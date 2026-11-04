import express from 'express';
import path from 'path';
import fs from 'fs';
import dns from 'dns';
import { promisify } from 'util';
import multer from 'multer';
import { exec } from 'child_process';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { validateEmailInput } from './src/utils/emailValidator';
import { generateReportHtml, generateWordDocString } from './src/reportTemplate';

const resolveTxtPromise = promisify(dns.resolveTxt);
const execPromise = promisify(exec);

const app = express();
const PORT = 3000;

// Lazy initialization for Gemini SDK
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return geminiClient;
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// In-memory / file-backed storage for session and history
interface User {
  id: number;
  username: string;
  companyName: string;
  passwordHash: string;
  createdAt: string;
}

interface AnalysisRecord {
  id: number;
  userId: number;
  fromAddress: string;
  subject: string;
  verdict: 'LEGITIMATE' | 'SUSPICIOUS' | 'SPOOFED';
  riskScore: number;
  analyzedAt: string;
  details: any;
}

const users: User[] = [
  {
    id: 1,
    username: 'analyst_demo',
    companyName: 'CyberSec Research Lab',
    passwordHash: 'demo123',
    createdAt: new Date().toISOString()
  }
];

let nextUserId = 2;
let nextRecordId = 1;
const historyRecords: AnalysisRecord[] = [];

// -------------------------------------------------------------
// Real DNS Lookup Utility with DoH Fallback
// -------------------------------------------------------------
async function queryDnsTxt(domain: string): Promise<string[]> {
  const cleanDomain = domain.trim().replace(/\.+$/, '');
  if (!cleanDomain) return [];

  // Try local system DNS first
  try {
    const rawRecords = await resolveTxtPromise(cleanDomain);
    const flattened = rawRecords.map(chunk => chunk.join(''));
    if (flattened.length > 0) return flattened;
  } catch (err) {
    // Fallback to Google DNS-over-HTTPS
  }

  // Fallback to Google DNS-over-HTTPS API
  try {
    const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(cleanDomain)}&type=TXT`, {
      headers: { 'User-Agent': 'SpoofSentry-Node/1.0' }
    });
    if (response.ok) {
      const data = await response.json();
      if (data.Answer && Array.isArray(data.Answer)) {
        return data.Answer
          .filter((ans: any) => ans.type === 16)
          .map((ans: any) => (ans.data || '').replace(/^"|"$/g, ''));
      }
    }
  } catch (dohErr) {
    console.error('DNS DoH Error:', dohErr);
  }

  return [];
}

// -------------------------------------------------------------
// Detection Engine in TypeScript
// -------------------------------------------------------------
function extractDomain(addressField: string): string {
  if (!addressField) return '';
  const match = addressField.match(/@([a-zA-Z0-9.\-_]+)/);
  if (match) {
    return match[1].toLowerCase().replace(/\.+$/, '');
  }
  return '';
}

async function checkSpf(domain: string) {
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

async function checkDkim(dkimHeader: string) {
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

async function checkDmarc(domain: string) {
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

function analyzeContent(subject: string, body: string) {
  const combined = `${subject} ${body}`.toLowerCase();

  const matchedUrgency = URGENCY_PHRASES.filter(p => new RegExp(`\\b${p}\\b`, 'i').test(combined));
  const matchedFinancial = FINANCIAL_PHRASES.filter(p => new RegExp(`\\b${p}\\b`, 'i').test(combined));
  const matchedThreat = THREAT_PHRASES.filter(p => new RegExp(`\\b${p}\\b`, 'i').test(combined));

  const urlMatches = `${subject} ${body}`.match(/https?:\/\/[^\s<>"']+/g) || [];
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
    score += 30; // heavy penalty for naked IP links
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

function analyzeTiming(dateHeaderStr: string) {
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

async function evaluateEmail(params: {
  fromAddress: string;
  returnPath?: string;
  dkimHeader?: string;
  subject?: string;
  body?: string;
  dateStr?: string;
}) {
  const { fromAddress, returnPath = '', dkimHeader = '', subject = '', body = '', dateStr = '' } = params;

  const fromDomain = extractDomain(fromAddress);
  const returnPathDomain = extractDomain(returnPath);
  const hasReturnPath = Boolean(returnPathDomain);
  const domainsMatch = (fromDomain && returnPathDomain) ? (fromDomain === returnPathDomain) : true;
  const domainMismatch = Boolean(fromDomain && returnPathDomain && fromDomain !== returnPathDomain);

  // 2. DNS Auth
  const [spfResult, dkimResult, dmarcResult] = await Promise.all([
    checkSpf(fromDomain),
    checkDkim(dkimHeader),
    checkDmarc(fromDomain)
  ]);

  // 3. Content Analysis
  const contentResult = analyzeContent(subject, body);

  // 4. Timing
  const timingResult = analyzeTiming(dateStr);

  // 5. Synthesis
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

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// -------------------------------------------------------------
// Public Compliance Endpoints (Required for Google OAuth Verification)
// -------------------------------------------------------------
app.get('/privacy', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy - SpoofSentry</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 800px; margin: 0 auto; padding: 40px 20px; background: #fafaf9; }
    .card { background: white; padding: 40px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
    h1 { color: #047857; margin-top: 0; font-size: 28px; }
    h2 { color: #0f172a; margin-top: 28px; font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
    p, li { font-size: 14px; color: #334155; }
    .badge { display: inline-block; background: #e8fbf3; color: #047857; border: 1px solid #a7f3d0; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold; margin-bottom: 16px; }
    .highlight { background: #f0fdf4; border-left: 4px solid #059669; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
    a { color: #059669; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">Official Privacy Policy</span>
    <h1>SpoofSentry Privacy Policy</h1>
    <p><em>Last Updated: September 2026</em></p>
    
    <div class="highlight">
      <strong>Core Commitment:</strong> SpoofSentry analyzes emails strictly in-memory during your active session to evaluate SPF, DKIM, DMARC, and phishing indicators. We <strong>never</strong> store your emails in a persistent database, never sell your data, and never use your email content for advertising.
    </div>

    <h2>1. Information We Access</h2>
    <p>When you choose to connect your Google account via Google Sign-In, SpoofSentry requests the <code>https://www.googleapis.com/auth/gmail.readonly</code> permission. We use this access solely to:</p>
    <ul>
      <li>Read message headers (<code>From</code>, <code>Return-Path</code>, <code>Authentication-Results</code>, <code>DKIM-Signature</code>) to verify sender identity against DNS records.</li>
      <li>Inspect message text snippets to calculate phishing and social engineering risk scores.</li>
    </ul>

    <h2>2. Ephemeral In-Memory Processing</h2>
    <p>All email header parsing and threat detections occur ephemerally in volatile memory. Your messages are never written to disk, saved into a database, or retained after your browser tab is closed or your session ends.</p>

    <h2>3. Google API Services User Data Policy (Limited Use)</h2>
    <p>SpoofSentry's use and transfer to any other app of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener">Google API Services User Data Policy</a>, including the Limited Use requirements:</p>
    <ul>
      <li>We do not transfer or disclose user data to third parties, unless necessary to provide or improve user-facing features.</li>
      <li>We do not use or transfer user data for serving ads, including retargeting, personalized, or interest-based advertising.</li>
      <li>We do not allow humans to read user data unless we have obtained your affirmative agreement for specific messages, or it is necessary for security purposes (such as investigating a bug or abuse).</li>
    </ul>

    <h2>4. Data Retention & Deletion</h2>
    <p>You may disconnect your Google account at any time by clicking "Disconnect" in the SpoofSentry interface or revoking access in your <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener">Google Account Security Settings</a>.</p>

    <h2>5. Developer Contact</h2>
    <p>If you have any questions regarding this Privacy Policy or our security practices, contact:</p>
    <p><strong>Lead Developer:</strong> <a href="mailto:anshika8422@gmail.com">anshika8422@gmail.com</a></p>
  </div>
</body>
</html>`);
});

app.get('/terms', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terms of Service - SpoofSentry</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 800px; margin: 0 auto; padding: 40px 20px; background: #fafaf9; }
    .card { background: white; padding: 40px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
    h1 { color: #047857; margin-top: 0; font-size: 28px; }
    h2 { color: #0f172a; margin-top: 28px; font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
    p, li { font-size: 14px; color: #334155; }
    .badge { display: inline-block; background: #e8fbf3; color: #047857; border: 1px solid #a7f3d0; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold; margin-bottom: 16px; }
    a { color: #059669; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">Legal Terms</span>
    <h1>SpoofSentry Terms of Service</h1>
    <p><em>Last Updated: September 2026</em></p>
    
    <h2>1. Acceptance of Terms</h2>
    <p>By accessing or using SpoofSentry, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use the application.</p>

    <h2>2. Purpose of the Application</h2>
    <p>SpoofSentry provides defensive cybersecurity analysis, email authentication verification (SPF, DKIM, DMARC), and social engineering detection to help users identify potential email spoofing and phishing attempts.</p>

    <h2>3. Acceptable Use</h2>
    <p>You agree to use SpoofSentry only for lawful cybersecurity analysis and verification of emails you are authorized to inspect. You may not attempt to reverse engineer, disrupt, or exploit the service.</p>

    <h2>4. Limitation of Liability & Disclaimer</h2>
    <p>SpoofSentry is provided on an "as is" and "as available" basis. While we strive for high accuracy through cryptographic DNS checks and heuristic scoring, no automated tool can guarantee 100% detection of all phishing attacks. Users should exercise caution with any suspicious communications.</p>

    <h2>5. Contact Information</h2>
    <p>For questions or support regarding these terms, please contact: <a href="mailto:anshika8422@gmail.com">anshika8422@gmail.com</a>.</p>
  </div>
</body>
</html>`);
});

// -------------------------------------------------------------
// Academic B.Tech Project Report & Direct Document Download Endpoints
// -------------------------------------------------------------
app.get(['/report', '/documentation'], (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(generateReportHtml());
});

app.get(['/download-report-pdf', '/SpoofSentry_Mini_Project_Report.pdf', '/report.pdf'], (req, res) => {
  const pdfPath = path.join(process.cwd(), 'public/SpoofSentry_Mini_Project_Report.pdf');
  if (fs.existsSync(pdfPath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="SpoofSentry_BTech_Mini_Project_Report.pdf"');
    res.sendFile(pdfPath);
  } else {
    res.redirect('/');
  }
});

app.get(['/download-report', '/api/download-report-pdf'], (req, res) => {
  const pdfPath = path.join(process.cwd(), 'public/SpoofSentry_Mini_Project_Report.pdf');
  if (fs.existsSync(pdfPath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="SpoofSentry_BTech_Mini_Project_Report.pdf"');
    res.sendFile(pdfPath);
  } else {
    res.setHeader('Content-Type', 'application/msword; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="SpoofSentry_BTech_Mini_Project_Report.doc"');
    res.send(generateWordDocString());
  }
});

app.get(['/download-report-docx', '/api/download-report-docx'], (req, res) => {
  res.setHeader('Content-Type', 'application/msword; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="SpoofSentry_BTech_Mini_Project_Report.doc"');
  res.send(generateWordDocString());
});

// OAuth and Environment Configuration
app.get('/api/config', (req, res) => {
  let googleClientId = '';
  let firebaseConfig: any = null;
  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      googleClientId = firebaseConfig.oAuthClientId || '';
    }
  } catch (e) {
    console.error('Error reading firebase-applet-config.json:', e);
  }

  if (!firebaseConfig) {
    firebaseConfig = {
      projectId: "gen-lang-client-0209555847",
      appId: "1:920586400525:web:eb19609034f792a132b644",
      apiKey: "AIzaSyDao0Bd_vdyfO5dhbbQjEewOUhrLUwLCao",
      authDomain: "gen-lang-client-0209555847.firebaseapp.com",
      storageBucket: "gen-lang-client-0209555847.firebasestorage.app",
      messagingSenderId: "920586400525",
      oAuthClientId: "920586400525-i6mfndl1u2e4vjv3qn8gsk6mmrrp2vnb.apps.googleusercontent.com"
    };
    googleClientId = firebaseConfig.oAuthClientId;
  }

  // Fallback to process.env only if it contains a valid client ID
  if (!googleClientId && process.env.GOOGLE_CLIENT_ID?.includes('googleusercontent.com')) {
    googleClientId = process.env.GOOGLE_CLIENT_ID;
  }

  res.json({
    googleClientId,
    firebaseConfig,
    hasGmailConfig: Boolean(googleClientId)
  });
});

// Proxy: Fetch recent messages from Gmail API with in-memory Bearer token
app.get('/api/gmail/messages', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header with OAuth Bearer token.' });
  }

  try {
    const maxResults = req.query.maxResults || '15';
    const q = req.query.q || 'in:inbox';
    const pageToken = req.query.pageToken ? `&pageToken=${encodeURIComponent(String(req.query.pageToken))}` : '';
    const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=${encodeURIComponent(String(q))}${pageToken}`, {
      headers: {
        Authorization: authHeader,
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `Gmail API error (${response.status}): ${errText}` });
    }

    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    console.error('Gmail messages proxy error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch messages from Gmail.' });
  }
});

// AI-powered Screenshot OCR extraction endpoint using Gemini 3.8 Flash
app.post('/api/ocr-screenshot', upload.single('screenshot'), async (req, res) => {
  try {
    let base64Data = '';
    let mimeType = 'image/png';

    if (req.file && req.file.buffer) {
      base64Data = req.file.buffer.toString('base64');
      mimeType = req.file.mimetype || 'image/png';
    } else if (req.body?.imageBase64) {
      base64Data = req.body.imageBase64.replace(/^data:image\/[a-zA-Z0-9.+_-]+;base64,/, '');
      mimeType = req.body.mimeType || 'image/png';
    }

    if (!base64Data) {
      return res.status(400).json({ error: 'No screenshot image received for OCR extraction.' });
    }

    const ai = getGemini();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini AI Vision service is not configured (GEMINI_API_KEY missing).',
        fallbackAvailable: true
      });
    }

    const prompt = `You are a strict forensic email cybersecurity analyst. Inspect this screenshot carefully.
CRITICAL EMAIL VALIDATION:
1. Determine whether this screenshot shows an actual email message or email client (such as Gmail, Outlook, Apple Mail, Yahoo Mail, mobile mail app, webmail, or an email message with headers/body).
2. If the screenshot contains programming source code (IDE, text editor like VSCode, programming script in Python, JavaScript/TypeScript, Java, C++, HTML/CSS, terminal logs, command prompt, document, or non-email application):
   - Set is_email to false.
   - Set detected_type to "source_code" (or "terminal", "document", "other").
   - Set rejection_reason to "The uploaded screenshot appears to be programming source code or a non-email window. SpoofSentry only performs forensics on email messages."
   - DO NOT invent, hallucinate, or extract line numbers, variables, or functions as sender name, sender number, or dates! Leave from, subject, and date as empty strings ("").
   - Set full_text to the legible text in the screenshot.
3. ONLY IF the screenshot genuinely displays an email message or email client:
   - Set is_email to true.
   - Set detected_type to "email".
   - Set rejection_reason to "".
   - Extract:
     1. Sender address and display name (e.g. '"Security Team" <alerts@security-portal.xyz>' or clean email)
     2. Subject line
     3. Date / timestamp if visible
     4. Full legible email message body (all sentences, paragraphs, instructions, wire details)
     5. Any visible URLs, domains, login portals, or raw IP addresses
     6. Detected email client or platform (e.g. "Gmail Web", "Gmail Mobile", "Outlook", "Apple Mail")
     7. Summary of what the sender is asking or coercing the user to do.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { data: base64Data, mimeType } }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            is_email: { type: Type.BOOLEAN, description: 'True if the image is an email or email client; false if source code, terminal, document, or non-email' },
            detected_type: { type: Type.STRING, description: 'Category: email, source_code, terminal, document, or other' },
            rejection_reason: { type: Type.STRING, description: 'Clear explanation if is_email is false' },
            from: { type: Type.STRING, description: 'The sender address or "Display Name <email>" if email, otherwise empty string' },
            subject: { type: Type.STRING, description: 'The subject line if email, otherwise empty string' },
            date: { type: Type.STRING, description: 'The date and time shown in the email' },
            body: { type: Type.STRING, description: 'The full legible email body text if email, or extracted code text' },
            links: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'All URLs, links, or IP addresses found'
            },
            full_text: { type: Type.STRING, description: 'All legible text visible in the screenshot' },
            detected_platform: { type: Type.STRING, description: 'The client application detected' },
            summary: { type: Type.STRING, description: 'One-sentence summary of the message' }
          },
          required: ['is_email', 'detected_type', 'full_text']
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Gemini model returned empty response.');
    }

    const parsed = JSON.parse(responseText);

    // Heuristic safety check on the extracted full_text to prevent any AI classification bypass
    const heuristicCheck = validateEmailInput({
      text: parsed.full_text || parsed.body || '',
      from: parsed.from,
      subject: parsed.subject,
      body: parsed.body
    });

    const isEmail = Boolean(parsed.is_email && heuristicCheck.isEmail);
    const detectedType = !isEmail ? (parsed.detected_type && parsed.detected_type !== 'email' ? parsed.detected_type : heuristicCheck.detectedType) : 'email';
    const rejectionReason = !isEmail
      ? (parsed.rejection_reason || heuristicCheck.reason || 'The uploaded screenshot is programming source code or not an email message. SpoofSentry only analyzes email messages.')
      : '';

    // If not an email, ensure no hallucinated email fields exist
    if (!isEmail) {
      parsed.from = '';
      parsed.subject = '';
      parsed.date = '';
    }

    res.json({
      success: true,
      engine: 'gemini-3.8-flash',
      is_email: isEmail,
      detected_type: detectedType,
      rejection_reason: rejectionReason,
      data: {
        ...parsed,
        is_email: isEmail,
        detected_type: detectedType,
        rejection_reason: rejectionReason
      }
    });
  } catch (error: any) {
    console.error('Screenshot OCR error:', error);
    res.status(500).json({
      error: error.message || 'Failed to extract text from screenshot using AI.',
      fallbackAvailable: true
    });
  }
});

// Proxy: Fetch detailed message by ID from Gmail API
app.get('/api/gmail/messages/:id', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header with OAuth Bearer token.' });
  }

  try {
    const format = req.query.format || 'full';
    const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(req.params.id)}?format=${format}`, {
      headers: {
        Authorization: authHeader,
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `Gmail API error (${response.status}): ${errText}` });
    }

    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    console.error('Gmail message detail proxy error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch message details from Gmail.' });
  }
});

// Analyze manual, screenshot, or Gmail inputs
app.post('/api/analyze', async (req, res) => {
  try {
    let { from, return_path, dkim_header, subject, body, date, source, headersUnavailable } = req.body || {};
    
    // Strict Validation: Reject if this is not an email (e.g. source code or non-email text)
    const validation = validateEmailInput({
      from,
      subject,
      body,
      text: [from, subject, body].filter(Boolean).join('\n'),
      source: source || 'manual'
    });

    if (!validation.isEmail) {
      return res.status(400).json({
        error: `This is not an email. ${validation.reason}`,
        is_not_email: true,
        detected_type: validation.detectedType,
        reason: validation.reason,
        details: validation.details
      });
    }

    // Sender email check: must contain a valid email address, not line numbers or code tokens
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    if (!from || !from.trim() || !emailRegex.test(from)) {
      const emailInBody = body ? body.match(emailRegex) : null;
      if (emailInBody) {
        from = emailInBody[0];
        if (!headersUnavailable) {
          headersUnavailable = true;
        }
      } else {
        return res.status(400).json({
          error: 'This is not an email. A valid sender email address (e.g. name@domain.com) or RFC From header is required. Code identifiers and line numbers cannot be analyzed.',
          is_not_email: true,
          detected_type: 'missing_sender'
        });
      }
    }

    const result = await evaluateEmail({
      fromAddress: from,
      returnPath: return_path,
      dkimHeader: dkim_header,
      subject,
      body,
      dateStr: date
    });

    const enrichedResult = {
      ...result,
      source: source || 'manual',
      headersUnavailable: Boolean(headersUnavailable)
    };

    // Save record to history
    const record: AnalysisRecord = {
      id: nextRecordId++,
      userId: 1,
      fromAddress: from,
      subject: subject || '',
      verdict: result.verdict,
      riskScore: result.content_analysis.risk_score,
      analyzedAt: result.analyzed_at,
      details: enrichedResult
    };
    historyRecords.unshift(record);

    res.json(enrichedResult);
  } catch (error: any) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message || 'Internal server error during analysis.' });
  }
});

// Analyze uploaded .eml file
app.post('/api/analyze-eml', upload.single('eml_file'), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'No .eml file received.' });
    }

    const rawContent = req.file.buffer.toString('utf-8');

    // Parse simple RFC 5322 headers and body
    const headerEndIndex = rawContent.indexOf('\r\n\r\n') !== -1 
      ? rawContent.indexOf('\r\n\r\n') 
      : rawContent.indexOf('\n\n');

    let headersText = rawContent;
    let bodyText = '';

    if (headerEndIndex !== -1) {
      headersText = rawContent.slice(0, headerEndIndex);
      bodyText = rawContent.slice(headerEndIndex).trim();
    }

    const getHeader = (name: string): string => {
      const regex = new RegExp(`^${name}:\\s*(.+)`, 'im');
      const match = headersText.match(regex);
      return match ? match[1].trim() : '';
    };

    const fromField = getHeader('From');
    const returnPathField = getHeader('Return-Path');
    const dkimField = getHeader('DKIM-Signature');
    const subjectField = getHeader('Subject');
    const dateField = getHeader('Date');
    const toField = getHeader('To');

    if (!fromField) {
      return res.status(400).json({ error: 'Could not extract valid From header from .eml file.' });
    }

    const result = await evaluateEmail({
      fromAddress: fromField,
      returnPath: returnPathField,
      dkimHeader: dkimField,
      subject: subjectField,
      body: bodyText,
      dateStr: dateField
    });

    const enriched = {
      ...result,
      parsed_eml_metadata: {
        to: toField,
        subject: subjectField,
        date: dateField,
        body_preview: bodyText.length > 200 ? bodyText.slice(0, 200) + '...' : bodyText
      }
    };

    const record: AnalysisRecord = {
      id: nextRecordId++,
      userId: 1,
      fromAddress: fromField,
      subject: subjectField || '',
      verdict: result.verdict,
      riskScore: result.content_analysis.risk_score,
      analyzedAt: result.analyzed_at,
      details: enriched
    };
    historyRecords.unshift(record);

    res.json(enriched);
  } catch (error: any) {
    console.error('EML error:', error);
    res.status(500).json({ error: error.message || 'Failed to parse .eml file.' });
  }
});

// Run Python Verification Test Suite
app.post('/api/run-python-suite', async (req, res) => {
  try {
    const { stdout, stderr } = await execPromise('python3 test_detector.py', { timeout: 15000 });
    res.json({
      success: true,
      stdout,
      stderr
    });
  } catch (err: any) {
    res.json({
      success: false,
      stdout: err.stdout || '',
      stderr: err.stderr || err.message
    });
  }
});

// History endpoint
app.get('/api/history', (req, res) => {
  res.json({
    history: historyRecords.slice(0, 20)
  });
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  const user = users.find(u => u.username === username);
  if (user && user.passwordHash === password) {
    res.json({ success: true, user: { id: user.id, username: user.username, companyName: user.companyName } });
  } else {
    res.status(401).json({ error: 'Invalid operator credentials.' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { username, password, companyName } = req.body || {};
  if (!username || !password || !companyName) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already taken.' });
  }
  const newUser: User = {
    id: nextUserId++,
    username,
    companyName,
    passwordHash: password,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  res.json({ success: true, user: { id: newUser.id, username: newUser.username, companyName: newUser.companyName } });
});

// Fetch source files for review / download
app.get('/api/source-files', (req, res) => {
  try {
    const files = {
      'detector.py': fs.readFileSync(path.join(process.cwd(), 'detector.py'), 'utf-8'),
      'app.py': fs.readFileSync(path.join(process.cwd(), 'app.py'), 'utf-8'),
      'test_detector.py': fs.readFileSync(path.join(process.cwd(), 'test_detector.py'), 'utf-8'),
      'requirements.txt': fs.readFileSync(path.join(process.cwd(), 'requirements.txt'), 'utf-8'),
      'README.md': fs.readFileSync(path.join(process.cwd(), 'README.md'), 'utf-8')
    };
    res.json({ files });
  } catch (err: any) {
    res.status(500).json({ error: 'Could not load source files.' });
  }
});

// Download endpoints for academic report
app.get('/download-report', (req, res) => {
  const pdfPath = path.join(process.cwd(), 'public', 'SpoofSentry_Mini_Project_Report.pdf');
  if (fs.existsSync(pdfPath)) {
    return res.download(pdfPath, 'SpoofSentry_BTech_Mini_Project_Report.pdf');
  }
  const htmlPath = path.join(process.cwd(), 'public', 'report.html');
  if (fs.existsSync(htmlPath)) {
    return res.sendFile(htmlPath);
  }
  res.redirect('/');
});

app.get(['/download-report', '/SpoofSentry_Mini_Project_Report.pdf', '/SpoofSentry_BTech_Mini_Project_Report.pdf'], (req, res) => {
  const pdfPath = path.join(process.cwd(), 'public', 'SpoofSentry_Mini_Project_Report.pdf');
  if (fs.existsSync(pdfPath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="SpoofSentry_BTech_Mini_Project_Report.pdf"');
    fs.createReadStream(pdfPath).pipe(res);
  } else {
    res.redirect('/');
  }
});

app.get('/api/report/pdf', (req, res) => {
  const pdfPath = path.join(process.cwd(), 'public', 'SpoofSentry_Mini_Project_Report.pdf');
  if (fs.existsSync(pdfPath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="SpoofSentry_BTech_Mini_Project_Report.pdf"');
    fs.createReadStream(pdfPath).pipe(res);
  } else {
    res.status(404).json({ error: 'Report PDF not found. Please re-generate.' });
  }
});

app.get('/api/report/doc', (req, res) => {
  const docPath = path.join(process.cwd(), 'public', 'SpoofSentry_Project_Report.doc');
  if (fs.existsSync(docPath)) {
    res.setHeader('Content-Type', 'application/msword');
    res.setHeader('Content-Disposition', 'attachment; filename="SpoofSentry_BTech_Mini_Project_Report.doc"');
    fs.createReadStream(docPath).pipe(res);
  } else {
    const docContent = generateWordDocString();
    res.setHeader('Content-Type', 'application/msword');
    res.setHeader('Content-Disposition', 'attachment; filename="SpoofSentry_BTech_Mini_Project_Report.doc"');
    res.send(docContent);
  }
});




// -------------------------------------------------------------
// Vite Middleware / Static Serving
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SpoofSentry Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
