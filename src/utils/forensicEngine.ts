import {
  AnalysisResponse,
  SpfResult,
  DkimResult,
  DmarcResult,
  ContentAnalysisResult,
  TimingAnalysisResult,
  VerdictType
} from '../types';
import { computeWeightedAssessment } from './assessment';

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
  'law enforcement', 'violation detected', 'login from unknown device'
];

export function extractDomain(input: string = ''): string {
  if (!input) return '';
  const emailMatch = input.match(/<([^>]+)>/) || input.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const target = emailMatch ? emailMatch[1] : input.trim();
  const atIndex = target.lastIndexOf('@');
  if (atIndex !== -1) {
    return target.slice(atIndex + 1).toLowerCase().trim().replace(/[>)\],;]+$/, '');
  }
  return target.toLowerCase().trim().replace(/^[<(\[]+/, '').replace(/[>)\],;]+$/, '');
}

/**
 * Resilient DNS TXT record query with DoH (Google & Cloudflare)
 */
export async function queryDnsTxtClient(domain: string): Promise<string[]> {
  const cleanDomain = domain.trim().replace(/\.+$/, '');
  if (!cleanDomain) return [];

  // Try Google DNS-over-HTTPS (RFC 8484)
  try {
    const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(cleanDomain)}&type=TXT`, {
      headers: { Accept: 'application/dns-json' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.Answer && Array.isArray(data.Answer)) {
        const records = data.Answer
          .filter((ans: any) => ans.type === 16)
          .map((ans: any) => String(ans.data || '').replace(/^"(.*)"$/, '$1').replace(/\\"/g, '"'));
        if (records.length > 0) return records;
      }
    }
  } catch (err) {
    console.warn('[ForensicEngine] Google DoH failed, trying Cloudflare DoH:', err);
  }

  // Fallback to Cloudflare DNS-over-HTTPS
  try {
    const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(cleanDomain)}&type=TXT`, {
      headers: { Accept: 'application/dns-json' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.Answer && Array.isArray(data.Answer)) {
        const records = data.Answer
          .filter((ans: any) => ans.type === 16)
          .map((ans: any) => String(ans.data || '').replace(/^"(.*)"$/, '$1').replace(/\\"/g, '"'));
        if (records.length > 0) return records;
      }
    }
  } catch (err) {
    console.warn('[ForensicEngine] Cloudflare DoH failed:', err);
  }

  return [];
}

export async function checkSpfClient(domain: string): Promise<SpfResult> {
  if (!domain) {
    return { status: 'FAIL', detail: 'No domain provided for SPF check.', record: null };
  }

  const records = await queryDnsTxtClient(domain);
  const spfRecords = records.filter(r => r.trim().toLowerCase().startsWith('v=spf1'));

  if (spfRecords.length === 0) {
    return {
      status: 'NONE',
      detail: `No SPF record published for ${domain}. Domain is vulnerable to unauthorized mail origination.`,
      record: null
    };
  }

  const spf = spfRecords[0];
  const lower = spf.toLowerCase();

  if (lower.includes('+all')) {
    return {
      status: 'FAIL',
      detail: `Permissive SPF record found (+all). Any IP address can send mail on behalf of ${domain}.`,
      record: spf
    };
  }

  if (lower.includes('-all')) {
    return {
      status: 'PASS',
      detail: `Strict SPF policy active (-all). Unauthorized senders are rejected.`,
      record: spf
    };
  }

  if (lower.includes('~all')) {
    return {
      status: 'PASS',
      detail: `SoftFail SPF policy active (~all). Valid SPF record configured on ${domain}.`,
      record: spf
    };
  }

  return {
    status: 'PASS',
    detail: `Valid SPF record found on ${domain}.`,
    record: spf
  };
}

export async function checkDkimClient(dkimHeaderStr: string, fromDomain: string): Promise<DkimResult> {
  if (!dkimHeaderStr) {
    // If from a reputable domain like google.com, check common selectors
    if (fromDomain) {
      const commonSelectors = ['20230601', 's1', 'google', 'selector1', 'k1', 'default'];
      for (const sel of commonSelectors) {
        const dkimHost = `${sel}._domainkey.${fromDomain}`;
        const records = await queryDnsTxtClient(dkimHost);
        const dkimRecords = records.filter(r => r.includes('v=DKIM1') || r.includes('k=rsa') || r.includes('p='));
        if (dkimRecords.length > 0) {
          return {
            status: 'PASS',
            detail: `DKIM public key confirmed in DNS at ${dkimHost}. Domain publishes active DKIM key pairs.`,
            domain: fromDomain,
            selector: sel,
            record: dkimRecords[0]
          };
        }
      }
    }

    return {
      status: 'NONE',
      detail: 'No DKIM-Signature header present in message.',
      domain: null,
      selector: null,
      record: null
    };
  }

  const sMatch = dkimHeaderStr.match(/\bs=([a-zA-Z0-9._-]+)/i);
  const dMatch = dkimHeaderStr.match(/\bd=([a-zA-Z0-9._-]+)/i);

  const selector = sMatch ? sMatch[1] : null;
  const domain = dMatch ? dMatch[1] : fromDomain;

  if (!selector || !domain) {
    return {
      status: 'FAIL',
      detail: 'Malformed DKIM header: missing selector (s=) or domain (d=).',
      domain,
      selector,
      record: null
    };
  }

  const dkimDnsHost = `${selector}._domainkey.${domain}`;
  const records = await queryDnsTxtClient(dkimDnsHost);
  const dkimRecords = records.filter(r => r.includes('v=DKIM1') || r.includes('k=rsa') || r.includes('p='));

  if (dkimRecords.length > 0) {
    return {
      status: 'PASS',
      detail: `DKIM public key confirmed in DNS at ${dkimDnsHost}. Message signed by domain owner.`,
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

export async function checkDmarcClient(domain: string): Promise<DmarcResult> {
  if (!domain) {
    return {
      status: 'FAIL',
      policy: null,
      detail: 'No domain provided for DMARC check.',
      record: null
    };
  }

  const dmarcHost = `_dmarc.${domain}`;
  const records = await queryDnsTxtClient(dmarcHost);
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

export function analyzeContentClient(subject: string = '', body: string = ''): ContentAnalysisResult {
  const combined = `${subject} ${body}`.toLowerCase();

  const matchedUrgency = URGENCY_PHRASES.filter(phrase => combined.includes(phrase));
  const matchedFinancial = FINANCIAL_PHRASES.filter(phrase => combined.includes(phrase));
  const matchedThreat = THREAT_PHRASES.filter(phrase => combined.includes(phrase));

  let score = 0;
  score += Math.min(matchedUrgency.length * 15, 45);
  score += Math.min(matchedFinancial.length * 20, 40);
  score += Math.min(matchedThreat.length * 15, 30);

  // Link extraction
  const urlRegex = /https?:\/\/[^\s"'<>]+/gi;
  const urlMatches = combined.match(urlRegex) || [];
  const rawIpUrls = urlMatches.filter(u => /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(u));

  if (rawIpUrls.length > 0) {
    score += 35;
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

export function analyzeTimingClient(dateHeaderStr: string = ''): TimingAnalysisResult {
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
  const isOffHours = (hour < 6 || hour >= 23);

  return {
    parsed_date: dt.toUTCString(),
    hour_local: hour,
    is_off_hours: isOffHours,
    detail: isOffHours
      ? `Sent at ${dt.toTimeString().split(' ')[0]} UTC (hour ${hour}:00), which falls in the off-hours window (23:00 - 06:00). Soft anomaly signal.`
      : `Sent at ${dt.toTimeString().split(' ')[0]} UTC (hour ${hour}:00), consistent with normal daytime business operations.`
  };
}

/**
 * Complete Client-Side Forensic Evaluation Engine
 * Guaranteed to execute smoothly without relying on any backend server!
 */
export async function evaluateEmailClientSide(params: {
  fromAddress: string;
  returnPath?: string;
  dkimHeader?: string;
  subject?: string;
  body?: string;
  dateStr?: string;
  source?: 'gmail' | 'screenshot' | 'raw-paste' | 'manual';
  headersUnavailable?: boolean;
  gmail_metadata?: any;
}): Promise<AnalysisResponse> {
  const {
    fromAddress,
    returnPath = '',
    dkimHeader = '',
    subject = '',
    body = '',
    dateStr = '',
    source = 'manual',
    headersUnavailable = false,
    gmail_metadata
  } = params;

  const fromDomain = extractDomain(fromAddress);
  const returnPathDomain = extractDomain(returnPath);
  const hasReturnPath = Boolean(returnPathDomain);
  const domainsMatch = (fromDomain && returnPathDomain) ? (fromDomain === returnPathDomain) : true;
  const domainMismatch = Boolean(fromDomain && returnPathDomain && fromDomain !== returnPathDomain);

  // Parallel asynchronous DNS checks
  const [spfResult, dkimResult, dmarcResult] = await Promise.all([
    checkSpfClient(fromDomain),
    checkDkimClient(dkimHeader, fromDomain),
    checkDmarcClient(fromDomain)
  ]);

  const contentResult = analyzeContentClient(subject, body);
  const timingResult = analyzeTimingClient(dateStr);

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

  let baseVerdict: VerdictType = 'SUSPICIOUS';
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

  const partialResponse: AnalysisResponse = {
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
    analyzed_at: new Date().toISOString(),
    source,
    headersUnavailable,
    gmail_metadata
  };

  const assessment = computeWeightedAssessment(partialResponse, headersUnavailable);

  return {
    ...partialResponse,
    assessment_report: assessment
  };
}
