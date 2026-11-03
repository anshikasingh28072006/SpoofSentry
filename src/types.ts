export type VerdictType = 'LEGITIMATE' | 'SUSPICIOUS' | 'SPOOFED';

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

export interface MatchedPhrase {
  phrase: string;
  category: string;
}

export interface ContentAnalysisResult {
  risk_score: number;
  risk_rating: 'LOW' | 'MEDIUM' | 'HIGH';
  matched_phrases: MatchedPhrase[];
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

export interface SenderAlignmentResult {
  from_address: string;
  from_domain: string;
  return_path: string;
  return_path_domain: string;
  has_return_path: boolean;
  domains_aligned: boolean;
  domain_mismatch: boolean;
}

export interface WeightedAssessment {
  totalScore: number;
  totalMax: number;
  verdict: VerdictType;
  explainText: string;
  authScore: number;
  authMax: number;
  authDetails: string[];
  contentScore: number;
  contentMax: number;
  linkScore: number;
  linkMax: number;
  timingScore: number;
  timingMax: number;
  headersUnavailable: boolean;
}

export interface AnalysisResponse {
  verdict: VerdictType;
  base_verdict: VerdictType;
  is_escalated: boolean;
  sender_alignment: SenderAlignmentResult;
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
  source?: 'manual' | 'eml' | 'gmail' | 'screenshot' | 'raw-paste';
  headersUnavailable?: boolean;
  assessment_report?: WeightedAssessment;
  gmail_metadata?: {
    id: string;
    snippet?: string;
    receivedAt?: string;
  };
  parsed_eml_metadata?: {
    to: string;
    subject: string;
    date: string;
    body_preview: string;
  };
}

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  from: string;
  subject: string;
  date: string;
  snippet: string;
}

export interface HistoryItem {
  id: number;
  userId: number;
  fromAddress: string;
  subject: string;
  verdict: VerdictType;
  riskScore: number;
  analyzedAt: string;
  details: AnalysisResponse;
}

export interface OperatorUser {
  id: number;
  username: string;
  companyName: string;
}
