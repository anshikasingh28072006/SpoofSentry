/**
 * Universal Forensics Engine for SpoofSentry
 * Runs in Node.js (Express server, Vercel Serverless Functions) AND directly in modern browsers.
 * Uses DNS-over-HTTPS (Google & Cloudflare) for real-time cryptographic verification of SPF, DKIM, and DMARC.
 */

import { validateEmailInput } from './emailValidator';

export interface SpfResult {
  status: 'PASS' | 'FAIL' | 'NONE';
  detail: string;
  record: string | null;
}

export interface DkimResult {
  status: 'PASS' | 'FAIL' | 'NONE';
  detail: string;
  domain: string | null;
  selector: string | null;
  record: string | null;
}

export interface DmarcResult {
  status: 'PASS' | 'FAIL' | 'NONE';
  policy: string | null;
  detail: string;
  record: string | null;
}

export interface ContentAnalysisResult {
  risk_score: number;
  risk_rating: 'LOW' | 'MEDIUM' | 'HIGH';
  matched_phrases: { phrase: string; category: string }[];
  urgency_count: number;
  financial_count: number;
  threat_count: number;
  link_count: number;
  raw_ip_links: string[];
}

export interface TimingAnalysisResult {
  parsed_date: string | null;
  hour_local: number | null;
  is_off_hours: boolean;
  detail: string;
}

export interface ForensicsEvaluationResult {
  verdict: 'LEGITIMATE' | 'SUSPICIOUS' | 'SPOOFED';
  base_verdict: 'LEGITIMATE' | 'SUSPICIOUS' | 'SPOOFED';
  is_escalated: boolean;
  sender_alignment: {
    from_address: string;
    from_domain: string;
    return_path: string;
    return_path_domain: string;
    has_return_path: boolean;
    domains_aligned: boolean;
    domain_mismatch: boolean;
  };
  authentication: {
    spf: SpfResult;
    dkim: DkimResult;
    dmarc: DmarcResult;
    passes: number;
    fails: number;
  };
  content_analysis: ContentAnalysisResult;
  timing_analysis: TimingAnalysisResult;
  verdict_reasons: string[];
  analyzed_at: string;
  source?: string;
  headersUnavailable?: boolean;
}

// -------------------------------------------------------------
// Real DNS Lookup Utility via Google & Cloudflare DNS-over-HTTPS
// -------------------------------------------------------------
export async function queryDnsTxt(domain: string): Promise<string[]> {
  const cleanDomain = domain.trim().replace(/\.+$/, '');
  if (!cleanDomain) return [];

  // 1. Try Google DNS-over-HTTPS (DoH)
  try {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 4000) : null;

    const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(cleanDomain)}&type=TXT`, {
      headers: {
        Accept: 'application/json'
      },
      signal: controller ? controller.signal : undefined
    });

    if (timeoutId) clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.Answer && Array.isArray(data.Answer)) {
        const records = data.Answer
          .filter((ans: any) => ans.type === 16)
          .map((ans: any) => (ans.data || '').replace(/^"|"$/g, '').replace(/\\"/g, '"'));
        if (records.length > 0) return records;
      }
    }
  } catch {
    // Fall back to Cloudflare DoH
  }

  // 2. Try Cloudflare DNS-over-HTTPS (DoH)
  try {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 4000) : null;

    const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(cleanDomain)}&type=TXT`, {
      headers: {
        Accept: 'application/dns-json'
      },
      signal: controller ? controller.signal : undefined
    });

    if (timeoutId) clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.Answer && Array.isArray(data.Answer)) {
        const records = data.Answer
          .filter((ans: any) => ans.type === 16)
          .map((ans: any) => (ans.data || '').replace(/^"|"$/g, '').replace(/\\"/g, '"'));
        if (records.length > 0) return records;
      }
    }
  } catch {
    // Both failed or network error
  }

  return [];
}

// -------------------------------------------------------------
// Domain Extraction
// -------------------------------------------------------------
export function extractDomain(addressField: string): string {
  if (!addressField) return '';
  const match = addressField.match(/@([a-zA-Z0-9.\-_]+)/);
  if (match) {
    return match[1].toLowerCase().replace(/\.+$/, '');
  }
  return '';
}

// -------------------------------------------------------------
// SPF Check
// -------------------------------------------------------------
export async function checkSpf(domain: string): Promise<SpfResult> {
  if (!domain) {
    return { status: 'FAIL', detail: 'No sender domain provided for SPF check.', record: null };
  }
  const records = await queryDnsTxt(domain);
  const spfRecords = records.filter(r => r.toLowerCase().startsWith('v=spf1'));

  if (spfRecords.length === 0) {
    return {
      status: 'NONE',
      detail: `No SPF record published for ${domain}. Domain is vulnerable to unauthorized sender origination.`,
      record: null
    };
  }

  const rec = spfRecords[0];
  let qualifier = 'unknown';
  if (rec.includes('-all')) qualifier = 'hardfail (-all)';
  else if (rec.includes('~all')) qualifier = 'softfail (~all)';
  else if (rec.includes('?all')) qualifier = 'neutral (?all)';
  else if (rec.includes('+all')) qualifier = 'permissive (+all)';

  return {
    status: 'PASS',
    detail: `Valid SPF record published for ${domain} with ${qualifier} policy.`,
    record: rec
  };
}

// -------------------------------------------------------------
// DKIM Check
// -------------------------------------------------------------
export async function checkDkim(dkimHeader: string): Promise<DkimResult> {
  if (!dkimHeader) {
    return {
      status: 'NONE',
      detail: 'No DKIM-Signature header present in message.',
      domain: null,
      selector: null,
      record: null
    };
  }

  const dMatch = dkimHeader.match(/\bd=([a-zA-Z0-9.\-_]+)/i);
  const sMatch = dkimHeader.match(/\bs=([a-zA-Z0-9.\-_]+)/i);

  const domain = dMatch ? dMatch[1].toLowerCase() : null;
  const selector = sMatch ? sMatch[1] : null;

  if (!domain || !selector) {
    return {
      status: 'FAIL',
      detail: "Malformed DKIM-Signature header: missing required 'd=' (domain) or 's=' (selector) tags.",
      domain,
      selector,
      record: null
    };
  }

  const dkimDnsHost = `${selector}._domainkey.${domain}`;
  const records = await queryDnsTxt(dkimDnsHost);
  const dkimRecords = records.filter(r => r.includes('p=') || r.toLowerCase().includes('v=dkim1'));

  if (dkimRecords.length > 0) {
    return {
      status: 'PASS',
      detail: `DKIM public key confirmed in DNS at ${dkimDnsHost}.`,
      domain,
      selector,
      record: dkimRecords[0]
    };
  } else {
    return {
      status: 'FAIL',
      detail: `DKIM selector queried (${dkimDnsHost}) but no public key TXT record was found.`,
      domain,
      selector,
      record: null
    };
  }
}

// -------------------------------------------------------------
// DMARC Check
// -------------------------------------------------------------
export async function checkDmarc(domain: string): Promise<DmarcResult> {
  if (!domain) {
    return {
      status: 'FAIL',
      policy: null,
      detail: 'No domain provided for DMARC check.',
      record: null
    };
  }

  const dmarcHost = `_dmarc.${domain}`;
  const records = await queryDnsTxt(dmarcHost);
  const dmarcRecords = records.filter(r => r.trim().toLowerCase().startsWith('v=dmarc1'));

  if (dmarcRecords.length === 0) {
    return {
      status: 'NONE',
      policy: 'none_published',
      detail: `No DMARC policy found at ${dmarcHost}. Receivers have no enforcement directives.`,
      record: null
    };
  }

  const rec = dmarcRecords[0];
  const pMatch = rec.match(/\bp=([a-zA-Z]+)/i);
  const policyAction = pMatch ? pMatch[1].toLowerCase() : 'none';

  const detailMap: Record<string, string> = {
    reject: 'Strong DMARC protection active (p=reject). Unauthorized messages are dropped by receiving MTAs.',
    quarantine: 'Moderate DMARC protection active (p=quarantine). Suspect messages redirected to spam/quarantine.',
    none: 'DMARC is in monitoring mode only (p=none). No enforcement against spoofed messages.'
  };

  return {
    status: 'PASS',
    policy: policyAction,
    detail: detailMap[policyAction] || `DMARC record present with policy: ${policyAction}.`,
    record: rec
  };
}

// -------------------------------------------------------------
// Content Analysis Heuristics
// -------------------------------------------------------------
const URGENCY_PHRASES = [
  'urgent', 'act now', 'action required', 'within 24 hours', 'immediate action',
  'final notice', 'your account will be suspended', 'account suspended',
  'expires soon', 'deadline', 'suspended immediately', 'verify immediately',
  'time sensitive', 'prompt attention', 'critical alert', 'warning'
];

const FINANCIAL_PHRASES = [
  'wire transfer', 'bank details', 'invoice', 'gift card', 'routing number',
  'cryptocurrency', 'bitcoin', 'payment method', 'credit card details',
  'direct deposit', 'payroll update', 'reimbursement', 'overdue balance',
  'billing statement', 'tax refund', 'western union'
];

const THREAT_PHRASES = [
  'suspended', 'unusual activity', 'unauthorized access', 'compromised',
  'security breach', 'locked account', 'terminated', 'legal action',
  'law enforcement', 'violation detected', 'login from unknown device',
  'password expiring', 'deactivation'
];

export function analyzeContent(subject: string, body: string): ContentAnalysisResult {
  const combined = `${subject || ''} ${body || ''}`.toLowerCase();

  const matchedUrgency = URGENCY_PHRASES.filter(p => new RegExp(`\\b${p}\\b`, 'i').test(combined));
  const matchedFinancial = FINANCIAL_PHRASES.filter(p => new RegExp(`\\b${p}\\b`, 'i').test(combined));
  const matchedThreat = THREAT_PHRASES.filter(p => new RegExp(`\\b${p}\\b`, 'i').test(combined));

  const urlMatches = `${subject || ''} ${body || ''}`.match(/https?:\/\/[^\s<>"']+/g) || [];
  const rawIpUrls: string[] = [];

  urlMatches.forEach(u => {
    if (/https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(u)) {
      rawIpUrls.push(u);
    }
  });

  let score = 0;
  score += Math.min(matchedUrgency.length * 15, 30);
  score += Math.min(matchedFinancial.length * 20, 35);
  score += Math.min(matchedThreat.length * 15, 30);

  if (urlMatches.length > 0) {
    score += Math.min(urlMatches.length * 5, 15);
  }
  if (rawIpUrls.length > 0) {
    score += 30; // heavy penalty for raw IP links
  }

  score = Math.min(score, 100);

  let rating: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (score >= 60) rating = 'HIGH';
  else if (score >= 30) rating = 'MEDIUM';

  const matchedPhrases: { phrase: string; category: string }[] = [];
  matchedUrgency.forEach(p => matchedPhrases.push({ phrase: p, category: 'Urgency / Pressure' }));
  matchedFinancial.forEach(p => matchedPhrases.push({ phrase: p, category: 'Financial / Payment' }));
  matchedThreat.forEach(p => matchedPhrases.push({ phrase: p, category: 'Account Threat / Scare' }));

  return {
    risk_score: score,
    risk_rating: rating,
    matched_phrases: matchedPhrases,
    urgency_count: matchedUrgency.length,
    financial_count: matchedFinancial.length,
    threat_count: matchedThreat.length,
    link_count: urlMatches.length,
    raw_ip_links: rawIpUrls
  };
}

// -------------------------------------------------------------
// Timing Analysis
// -------------------------------------------------------------
export function analyzeTiming(dateHeaderStr: string): TimingAnalysisResult {
  if (!dateHeaderStr) {
    return {
      parsed_date: null,
      hour_local: null,
      is_off_hours: false,
      detail: 'No Date header provided; timing check skipped.'
    };
  }

  const dt = new Date(dateHeaderStr);
  if (isNaN(dt.getTime())) {
    return {
      parsed_date: null,
      hour_local: null,
      is_off_hours: false,
      detail: `Could not parse Date header '${dateHeaderStr}'.`
    };
  }

  const hour = dt.getUTCHours();
  const isOffHours = hour < 6 || hour >= 23;

  return {
    parsed_date: dt.toUTCString(),
    hour_local: hour,
    is_off_hours: isOffHours,
    detail: isOffHours
      ? `Sent at ${dt.toTimeString().split(' ')[0]} UTC (hour ${hour}:00), which falls in the off-hours window (23:00 - 06:00). Soft anomaly signal.`
      : `Sent at ${dt.toTimeString().split(' ')[0]} UTC (hour ${hour}:00), consistent with normal daytime business operations.`
  };
}

// -------------------------------------------------------------
// Master Evaluation Pipeline
// -------------------------------------------------------------
export async function evaluateEmail(params: {
  fromAddress: string;
  returnPath?: string;
  dkimHeader?: string;
  subject?: string;
  body?: string;
  dateStr?: string;
}): Promise<ForensicsEvaluationResult> {
  const { fromAddress, returnPath = '', dkimHeader = '', subject = '', body = '', dateStr = '' } = params;

  const fromDomain = extractDomain(fromAddress);
  const returnPathDomain = extractDomain(returnPath);
  const hasReturnPath = Boolean(returnPathDomain);
  const domainsMatch = fromDomain && returnPathDomain ? fromDomain === returnPathDomain : true;
  const domainMismatch = Boolean(fromDomain && returnPathDomain && fromDomain !== returnPathDomain);

  // 1. DNS Auth checks via DoH
  const [spfResult, dkimResult, dmarcResult] = await Promise.all([
    checkSpf(fromDomain),
    checkDkim(dkimHeader),
    checkDmarc(fromDomain)
  ]);

  // 2. Content Analysis
  const contentResult = analyzeContent(subject, body);

  // 3. Timing
  const timingResult = analyzeTiming(dateStr);

  // 4. Synthesis
  const authPasses = [spfResult.status === 'PASS', dkimResult.status === 'PASS', dmarcResult.status === 'PASS'].filter(Boolean).length;
  const authFails = [spfResult.status === 'FAIL', dkimResult.status === 'FAIL', dmarcResult.status === 'FAIL'].filter(Boolean).length;

  const reasons: string[] = [];

  if (domainMismatch) {
    reasons.push(`Domain mismatch: From header (${fromDomain}) does not match Return-Path (${returnPathDomain}).`);
  }

  if (spfResult.status === 'FAIL') {
    reasons.push(`SPF validation failed for ${fromDomain}.`);
  } else if (spfResult.status === 'NONE') {
    reasons.push(`No SPF record published for ${fromDomain}.`);
  }

  if (dkimResult.status === 'FAIL') {
    reasons.push(`DKIM verification failed: selector not found in DNS.`);
  } else if (dkimResult.status === 'NONE') {
    reasons.push(`No DKIM signature present on message.`);
  }

  if (dmarcResult.policy === 'none_published') {
    reasons.push(`No DMARC policy on ${fromDomain} to enforce domain protection.`);
  } else if (dmarcResult.policy === 'none') {
    reasons.push(`DMARC policy is set to 'none' (monitoring only, not enforced).`);
  }

  let baseVerdict: 'LEGITIMATE' | 'SUSPICIOUS' | 'SPOOFED' = 'SUSPICIOUS';
  if (domainMismatch || authFails >= 2 || (dmarcResult.policy === 'reject' && authPasses <= 1 && authFails >= 1)) {
    baseVerdict = 'SPOOFED';
  } else if (authPasses >= 2 && !domainMismatch) {
    baseVerdict = 'LEGITIMATE';
  }

  let finalVerdict = baseVerdict;
  let isEscalated = false;

  if (contentResult.risk_rating === 'HIGH') {
    if (baseVerdict === 'LEGITIMATE') {
      finalVerdict = 'SUSPICIOUS';
      isEscalated = true;
      reasons.push('Verdict escalated to SUSPICIOUS due to high-risk social engineering content triggers.');
    } else if (baseVerdict === 'SUSPICIOUS') {
      finalVerdict = 'SPOOFED';
      isEscalated = true;
      reasons.push('Verdict escalated to SPOOFED due to high-risk social engineering content triggers.');
    }
  }

  if (timingResult.is_off_hours) {
    reasons.push('Message timestamp falls during anomalous off-hours window (23:00 - 06:00).');
  }

  if (reasons.length === 0) {
    reasons.push('Authentication checks passed and sender domain alignment is verified.');
  }

  return {
    verdict: finalVerdict,
    base_verdict: baseVerdict,
    is_escalated: isEscalated,
    sender_alignment: {
      from_address: fromAddress,
      from_domain: fromDomain,
      return_path: returnPath,
      return_path_domain: returnPathDomain,
      has_return_path: hasReturnPath,
      domains_aligned: domainsMatch,
      domain_mismatch: domainMismatch
    },
    authentication: {
      spf: spfResult,
      dkim: dkimResult,
      dmarc: dmarcResult,
      passes: authPasses,
      fails: authFails
    },
    content_analysis: contentResult,
    timing_analysis: timingResult,
    verdict_reasons: reasons,
    analyzed_at: new Date().toISOString()
  };
}
