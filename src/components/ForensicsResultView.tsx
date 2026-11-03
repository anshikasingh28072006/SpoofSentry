import React, { useState } from 'react';
import { AnalysisResponse, WeightedAssessment } from '../types';
import { computeWeightedAssessment } from '../utils/assessment';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Download,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Link as LinkIcon,
  ChevronRight,
  GraduationCap,
  Shield,
  FileText,
  Terminal,
  Globe,
  Key,
  Layers,
  Copy,
  Check,
  LayoutGrid,
  Columns,
  Code,
  ArrowRightLeft,
  Server,
  Activity,
  AlertCircle
} from 'lucide-react';

interface ForensicsResultViewProps {
  result: AnalysisResponse;
  onReset: () => void;
}

export const ForensicsResultView: React.FC<ForensicsResultViewProps> = ({ result, onReset }) => {
  const [activeContainerTab, setActiveContainerTab] = useState<'both' | 'report' | 'dns'>('both');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const assessment: WeightedAssessment =
    result.assessment_report || computeWeightedAssessment(result, result.headersUnavailable);

  const verdict = assessment.verdict;
  const isSpoofed = verdict === 'SPOOFED';
  const isSuspicious = verdict === 'SUSPICIOUS';

  const verdictConfig = isSpoofed
    ? {
        title: 'SPOOFED EMAIL DETECTED',
        desc: 'Critical authentication failures or fraudulent sender signals detected.',
        bg: 'bg-rose-50 border-rose-200',
        badge: 'bg-rose-600 text-white',
        icon: ShieldAlert,
        meterBg: 'bg-rose-600'
      }
    : isSuspicious
    ? {
        title: 'SUSPICIOUS MESSAGE DETECTED',
        desc: 'Unverified domain or elevated social engineering triggers identified.',
        bg: 'bg-amber-50 border-amber-200',
        badge: 'bg-amber-600 text-white',
        icon: AlertTriangle,
        meterBg: 'bg-amber-500'
      }
    : {
        title: 'LEGITIMATE EMAIL VERIFIED',
        desc: 'Cryptographic authentication passed with low content risk.',
        bg: 'bg-emerald-50 border-emerald-200',
        badge: 'bg-emerald-600 text-white',
        icon: ShieldCheck,
        meterBg: 'bg-emerald-600'
      };

  const IconComponent = verdictConfig.icon;
  const headersUnavailable = assessment.headersUnavailable;
  const spfStatus = headersUnavailable ? 'N/A' : result.authentication.spf.status;
  const dkimStatus = headersUnavailable ? 'N/A' : result.authentication.dkim.status;
  const dmarcStatus = headersUnavailable ? 'N/A' : result.authentication.dmarc.status;
  const mismatch = headersUnavailable ? false : result.sender_alignment.domain_mismatch;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PASS':
      case 'OK':
      case 'LOW':
      case 'NORMAL':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'FAIL':
      case 'HIGH':
      case 'FOUND':
      case 'MISMATCH':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'NONE':
      case 'FLAG':
      case 'MEDIUM':
      case 'OFF-HOURS':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const handleCopy = (text: string, key: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // Categorize content phrases
  const urgencyPhrases = result.content_analysis.matched_phrases
    ? result.content_analysis.matched_phrases
        .filter(p => p.category.toLowerCase().includes('urgency') || p.category.toLowerCase().includes('pressure'))
        .map(p => p.phrase)
    : [];

  const financialPhrases = result.content_analysis.matched_phrases
    ? result.content_analysis.matched_phrases
        .filter(p => p.category.toLowerCase().includes('financial') || p.category.toLowerCase().includes('payment'))
        .map(p => p.phrase)
    : [];

  const threatPhrases = result.content_analysis.matched_phrases
    ? result.content_analysis.matched_phrases
        .filter(p => p.category.toLowerCase().includes('threat') || p.category.toLowerCase().includes('scare'))
        .map(p => p.phrase)
    : [];

  const handleExportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify({ ...result, assessment }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `spoofsentry_forensics_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Raw telemetry summary string for copying
  const rawDnsSummary = `[SPOOFSENTRY TECHNICAL DNS FORENSICS LOG]
Generated: ${result.analyzed_at || new Date().toISOString()}
Target Domain: ${result.sender_alignment.from_domain || 'N/A'}
Return-Path Domain: ${result.sender_alignment.return_path_domain || 'N/A'}
Alignment: ${mismatch ? 'MISMATCH (RFC 5322 != RFC 5321)' : 'ALIGNED'}

--- SPF (RFC 7208) ---
Status: ${result.authentication.spf.status}
Domain: ${result.sender_alignment.from_domain || 'N/A'}
Record: ${result.authentication.spf.record || 'None'}
Detail: ${result.authentication.spf.detail}

--- DKIM (RFC 6376) ---
Status: ${result.authentication.dkim.status}
Domain: ${result.authentication.dkim.domain || result.sender_alignment.from_domain || 'N/A'}
Selector: ${result.authentication.dkim.selector || 'N/A'}
Record: ${result.authentication.dkim.record || 'None'}
Detail: ${result.authentication.dkim.detail}

--- DMARC (RFC 7489) ---
Status: ${result.authentication.dmarc.status}
Domain: ${result.sender_alignment.from_domain || 'N/A'}
Policy: ${result.authentication.dmarc.policy || 'None'}
Record: ${result.authentication.dmarc.record || 'None'}
Detail: ${result.authentication.dmarc.detail}
`;

  return (
    <div className="space-y-6 pt-2">
      {/* 1. TOP VERDICT SUMMARY BANNER */}
      <div className={`p-5 rounded-2xl border ${verdictConfig.bg} shadow-xs space-y-4 transition-all`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl ${verdictConfig.badge} flex items-center justify-center shadow-xs shrink-0`}
            >
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${verdictConfig.badge}`}>
                  VERDICT: {verdict}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Score: {assessment.totalScore}/100
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                {verdictConfig.title}
              </h2>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleExportJson}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              type="button"
              onClick={onReset}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Analysis</span>
            </button>
          </div>
        </div>

        {/* Threat Score Progress Meter */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs font-bold text-slate-700">
            <span>Overall Risk Index:</span>
            <span className="font-mono">
              {assessment.totalScore} / 100 ({assessment.totalScore >= 50 ? 'Severe Threat' : assessment.totalScore >= 25 ? 'Moderate Threat' : 'Safe / Low Threat'})
            </span>
          </div>
          <div className="h-2.5 bg-white/80 border border-slate-300 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-700 ${verdictConfig.meterBg}`}
              style={{ width: `${Math.min(Math.max(assessment.totalScore, 4), 100)}%` }}
            />
          </div>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-3 rounded-xl border border-slate-200/80">
          {assessment.explainText}
        </p>
      </div>

      {/* 2. SECTION CONTAINER SWITCHER / NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2 border border-slate-200 rounded-xl shadow-2xs">
        <div className="flex items-center gap-2 pl-2">
          <LayoutGrid className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Display Layout
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1 bg-[#f3ede3] p-1 rounded-lg text-xs font-semibold border border-[#e2d5c3]">
          <button
            type="button"
            onClick={() => setActiveContainerTab('both')}
            className={`px-3 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeContainerTab === 'both'
                ? 'bg-white text-[#047857] shadow-2xs font-bold border-b-2 border-[#059669]'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Dual View</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveContainerTab('report')}
            className={`px-3 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeContainerTab === 'report'
                ? 'bg-white text-[#047857] shadow-2xs font-bold border-b-2 border-[#059669]'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Assessment Report</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveContainerTab('dns')}
            className={`px-3 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeContainerTab === 'dns'
                ? 'bg-white text-[#047857] shadow-2xs font-bold border-b-2 border-[#059669]'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Technical DNS Logs</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CONTAINER 1: THE ASSESSMENT REPORT (Clean, Executive Audit Canvas)        */}
      {/* ========================================================================= */}
      {(activeContainerTab === 'both' || activeContainerTab === 'report') && (
        <section
          id="assessment-report-container"
          className="bg-white border-2 border-stone-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6 transition-all"
        >
          {/* Container Header */}
          <div className="border-b border-stone-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-[#e8fbf3] text-[#059669] rounded-lg border border-[#a7f3d0]">
                  <FileText className="w-4 h-4" />
                </span>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#047857] bg-[#e8fbf3] px-2 py-0.5 rounded border border-[#a7f3d0]">
                  Executive Risk Assessment
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight mt-1">
                Assessment Report
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Weighted multi-vector forensic evaluation of cryptographic origin, content language, and message behavior.
              </p>
            </div>

            <div className="bg-stone-50 border border-stone-200 px-4 py-2.5 rounded-xl text-right shrink-0">
              <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Risk Weighting
              </div>
              <div className="text-2xl font-black text-stone-900 font-mono mt-0.5">
                {assessment.totalScore}
                <span className="text-stone-400 text-sm font-normal">/100</span>
              </div>
              <div className="text-[11px] font-semibold text-stone-600">
                {assessment.totalScore === 0 ? 'Zero Risk Signals' : assessment.totalScore >= 50 ? 'Critical Threat' : 'Weighted Risk'}
              </div>
            </div>
          </div>

          {/* Executive Summary Quote Callout */}
          <div className="p-4 bg-[#fbf9f6] border-l-4 border-[#059669] rounded-r-xl text-xs sm:text-sm font-medium text-stone-700 leading-relaxed">
            {assessment.explainText}
          </div>

          {/* 4 Category Contribution Cards Grid */}
          <div>
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Risk Pillar Breakdown
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Pillar 1: Sender Authentication */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Sender Auth</span>
                  <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {assessment.authScore} / {assessment.authMax}
                  </span>
                </div>
                <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#059669] transition-all duration-500"
                    style={{ width: `${(assessment.authScore / assessment.authMax) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {assessment.authScore === 0
                    ? 'All authentication checks passed'
                    : assessment.authDetails.join('; ')}
                </p>
              </div>

              {/* Pillar 2: Content Risk */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Content Risk</span>
                  <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {assessment.contentScore} / {assessment.contentMax}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${(assessment.contentScore / assessment.contentMax) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {result.content_analysis.matched_phrases.length} risk phrase(s) detected
                </p>
              </div>

              {/* Pillar 3: Link & Attachment Risk */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Link &amp; URLs</span>
                  <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {assessment.linkScore} / {assessment.linkMax}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 transition-all duration-500"
                    style={{ width: `${(assessment.linkScore / assessment.linkMax) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {result.content_analysis.link_count} link(s) in message
                  {result.content_analysis.raw_ip_links.length > 0 && ' (Raw IP detected)'}
                </p>
              </div>

              {/* Pillar 4: Send-Time Anomaly */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Send Timing</span>
                  <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {assessment.timingScore} / {assessment.timingMax}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-600 transition-all duration-500"
                    style={{ width: `${(assessment.timingScore / assessment.timingMax) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-snug truncate" title={result.timing_analysis.detail}>
                  {result.timing_analysis.detail || 'Normal business hours'}
                </p>
              </div>
            </div>
          </div>

          {/* Grid Layout: Core Authentication Summary Cards */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#059669]" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Authentication Status Overview
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* SPF Summary */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col justify-between space-y-2">
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase">SPF Check</div>
                  <div className="text-xs font-mono font-semibold text-slate-900 truncate mt-0.5" title={result.sender_alignment.from_domain || 'sender domain'}>
                    {result.sender_alignment.from_domain || 'sender domain'}
                  </div>
                </div>
                <div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(spfStatus)}`}>
                    {spfStatus}
                  </span>
                </div>
              </div>

              {/* DKIM Summary */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col justify-between space-y-2">
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase">DKIM Signature</div>
                  <div className="text-xs font-mono font-semibold text-slate-900 truncate mt-0.5">
                    {result.authentication.dkim.status === 'PASS' ? 'header present' : result.authentication.dkim.domain || 'no signature'}
                  </div>
                </div>
                <div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(dkimStatus)}`}>
                    {dkimStatus}
                  </span>
                </div>
              </div>

              {/* DMARC Summary */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col justify-between space-y-2">
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase">DMARC Policy</div>
                  <div className="text-xs font-mono font-semibold text-slate-900 truncate mt-0.5">
                    {result.authentication.dmarc.policy ? `p=${result.authentication.dmarc.policy}` : 'unverified'}
                  </div>
                </div>
                <div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(dmarcStatus)}`}>
                    {dmarcStatus}
                  </span>
                </div>
              </div>

              {/* Sender Alignment Summary */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col justify-between space-y-2">
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Envelope Alignment</div>
                  <div className="text-xs font-mono font-semibold text-slate-900 truncate mt-0.5">
                    {headersUnavailable
                      ? 'headers unavailable'
                      : mismatch
                      ? 'domains do not match'
                      : result.sender_alignment.domains_aligned
                      ? 'domains match'
                      : 'unverified'}
                  </div>
                </div>
                <div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(headersUnavailable ? 'NONE' : mismatch ? 'MISMATCH' : 'OK')}`}>
                    {headersUnavailable ? 'N/A' : mismatch ? 'MISMATCH' : 'OK'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Layout: Content Risk Details */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Content &amp; Social Engineering Analysis
              </h3>
            </div>

            <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
                <div>
                  <span className="text-xs font-bold text-slate-800">Overall Content Threat Score</span>
                  <p className="text-[11px] text-slate-500">
                    Calculated heuristic rating across urgency, payments, and intimidation language
                  </p>
                </div>
                <div>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${getStatusBadge(result.content_analysis.risk_rating)}`}>
                    {result.content_analysis.risk_rating} RISK
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Urgency Pressure Language</span>
                  <div className="text-xs text-slate-800 font-medium">
                    {urgencyPhrases.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {urgencyPhrases.map((phrase, idx) => (
                          <span key={idx} className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[11px] font-semibold border border-amber-200">
                            {phrase}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-500 font-normal">None detected</span>
                    )}
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Payment / Wire Transfer Language</span>
                  <div className="text-xs text-slate-800 font-medium">
                    {financialPhrases.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {financialPhrases.map((phrase, idx) => (
                          <span key={idx} className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[11px] font-semibold border border-amber-200">
                            {phrase}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-500 font-normal">None detected</span>
                    )}
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Threat &amp; Account Scare Language</span>
                  <div className="text-xs text-slate-800 font-medium">
                    {threatPhrases.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {threatPhrases.map((phrase, idx) => (
                          <span key={idx} className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded text-[11px] font-semibold border border-rose-200">
                            {phrase}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-500 font-normal">None detected</span>
                    )}
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Detected Hyperlinks</span>
                  <div className="text-xs text-slate-800 font-medium flex items-center justify-between pt-0.5">
                    <span className="text-slate-600">Total URLs in body:</span>
                    <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {result.content_analysis.link_count}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 md:col-span-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Raw IP Address Link Check</span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${result.content_analysis.raw_ip_links.length > 0 ? getStatusBadge('HIGH') : getStatusBadge('OK')}`}>
                      {result.content_analysis.raw_ip_links.length > 0 ? 'MALICIOUS RAW IP' : 'NONE DETECTED'}
                    </span>
                  </div>
                  {result.content_analysis.raw_ip_links.length > 0 ? (
                    <div className="mt-1 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs font-mono text-rose-800 break-all">
                      Suspicious bare IP URL found: {result.content_analysis.raw_ip_links.join(', ')}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No naked IP destination URLs detected.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Temporal & Send-Time Analysis */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Temporal / Send-Time Analysis
              </h3>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase">Message Timestamp</div>
                <div className="text-xs sm:text-sm font-semibold text-slate-900 mt-0.5">
                  {result.timing_analysis.detail || (result.timing_analysis.parsed_date ? `Sent at ${result.timing_analysis.parsed_date}` : 'Sent during normal business hours')}
                </div>
              </div>
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full border self-start sm:self-auto ${getStatusBadge(result.timing_analysis.is_off_hours ? 'OFF-HOURS' : 'NORMAL')}`}>
                {result.timing_analysis.is_off_hours ? 'OFF-HOURS ANOMALY' : 'NORMAL BUSINESS HOURS'}
              </span>
            </div>
          </div>

          {/* Academic Cybersecurity Scope Card */}
          <div className="p-4 bg-[#fff8f2] border border-[#fed7aa] rounded-xl text-xs space-y-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#ea580c] shrink-0" />
              <h4 className="font-bold text-[#9a3412] text-xs tracking-wider uppercase">
                Academic Cybersecurity Scope
              </h4>
            </div>
            <p className="text-stone-700 leading-relaxed pl-6">
              This demo prototype simulates DNS SPF/DKIM/DMARC resolution and Gmail connectivity for presentation purposes. The production build performs genuine public DNS lookups and real OAuth-based Gmail access — see the Python/Flask backend for the live version.
            </p>
          </div>

          {/* Investigative Findings & Forensic Log */}
          {result.verdict_reasons && result.verdict_reasons.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Investigative Findings Log
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {result.verdict_reasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-[#059669] mt-0.5 shrink-0" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* CONTAINER 2: THE TECHNICAL DNS LOGS (Deep Nameserver & Cryptographic Box) */}
      {/* ========================================================================= */}
      {(activeContainerTab === 'both' || activeContainerTab === 'dns') && (
        <section
          id="technical-dns-logs-container"
          className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-5 sm:p-7 shadow-md text-slate-100 space-y-6 transition-all"
        >
          {/* Container Header */}
          <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-950/80 text-emerald-400 rounded-lg border border-emerald-800/60">
                  <Terminal className="w-4 h-4" />
                </span>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/60">
                  Cryptographic Engine
                </span>
                <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                  RFC 5322 / RFC 5321 / RFC 7208 / RFC 6376 / RFC 7489
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                Technical DNS Logs &amp; Cryptographic Telemetry
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Raw DNS nameserver responses, cryptographic selector verification, and envelope domain alignment matrices.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => handleCopy(rawDnsSummary, 'dns-summary')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {copiedKey === 'dns-summary' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied Telemetry</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Full DNS Log</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* SUB-CONTAINER A: RFC SENDER DOMAIN ALIGNMENT MATRIX */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  RFC 5322 ("From") vs RFC 5321 ("Return-Path") Domain Alignment
                </h3>
              </div>
              <div>
                {headersUnavailable ? (
                  <span className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    HEADERS UNAVAILABLE
                  </span>
                ) : mismatch ? (
                  <span className="font-mono text-[11px] font-black px-2.5 py-1 rounded bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    ALIGNMENT MISMATCH DETECTED
                  </span>
                ) : (
                  <span className="font-mono text-[11px] font-black px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    DOMAINS STRICTLY ALIGNED
                  </span>
                )}
              </div>
            </div>

            {/* 2-Column Grid for From vs Return-Path */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 font-mono text-xs">
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Header "From" Domain (RFC 5322)</span>
                  <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    User-Visible
                  </span>
                </div>
                <div className="text-sm font-bold text-white break-all">
                  {result.sender_alignment.from_domain || '(None / Malformed domain)'}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  Address: {result.sender_alignment.from_address || 'N/A'}
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Envelope "Return-Path" Domain (RFC 5321)</span>
                  <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    MTA Bounce
                  </span>
                </div>
                <div className="text-sm font-bold text-white break-all">
                  {result.sender_alignment.return_path_domain || '(No Return-Path specified)'}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  Envelope: {result.sender_alignment.return_path || 'Direct Client Submission'}
                </div>
              </div>
            </div>

            {mismatch && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/80 rounded-lg text-xs text-rose-200 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">Security Violation:</span> The visible sender address domain{' '}
                  <code className="font-mono text-rose-300 font-bold">({result.sender_alignment.from_domain})</code> does not match the SMTP envelope bounce domain{' '}
                  <code className="font-mono text-rose-300 font-bold">({result.sender_alignment.return_path_domain})</code>. This is a primary indicator of forged headers in CEO wire fraud and credential phishing attacks.
                </div>
              </div>
            )}
          </div>

          {/* SUB-CONTAINER B: 3-COLUMN DNS PROTOCOL VERIFICATION GRID */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Nameserver Protocol Records &amp; Cryptographic Proofs
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                DNS Port 53 / DoH
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* 1. SPF DNS Record Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3.5 shadow-2xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-cyan-400" />
                      <span className="font-bold text-xs text-white">SPF Policy (RFC 7208)</span>
                    </div>
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                        result.authentication.spf.status === 'PASS'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                          : result.authentication.spf.status === 'FAIL'
                          ? 'bg-rose-950 text-rose-300 border-rose-700'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {result.authentication.spf.status}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400">
                    Query: <code className="text-cyan-300">dig TXT {result.sender_alignment.from_domain || 'domain'}</code>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {result.authentication.spf.detail}
                  </p>
                </div>

                {/* Raw DNS TXT Record Box */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Nameserver TXT Response:</span>
                    {result.authentication.spf.record && (
                      <button
                        type="button"
                        onClick={() => handleCopy(result.authentication.spf.record || '', 'spf-record')}
                        className="hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'spf-record' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'spf-record' ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800 font-mono text-[11px] text-emerald-400 break-all leading-tight">
                    {result.authentication.spf.record || '(No v=spf1 DNS record deployed)'}
                  </div>
                </div>
              </div>

              {/* 2. DKIM Cryptographic Key Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3.5 shadow-2xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-xs text-white">DKIM Key (RFC 6376)</span>
                    </div>
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                        result.authentication.dkim.status === 'PASS'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                          : result.authentication.dkim.status === 'FAIL'
                          ? 'bg-rose-950 text-rose-300 border-rose-700'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {result.authentication.dkim.status}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 truncate">
                    Selector:{' '}
                    <code className="text-amber-300">
                      {result.authentication.dkim.selector
                        ? `${result.authentication.dkim.selector}._domainkey.${result.authentication.dkim.domain}`
                        : 'No selector header found'}
                    </code>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {result.authentication.dkim.detail}
                  </p>
                </div>

                {/* Raw DKIM Key Box */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Public Key TXT Record:</span>
                    {result.authentication.dkim.record && (
                      <button
                        type="button"
                        onClick={() => handleCopy(result.authentication.dkim.record || '', 'dkim-record')}
                        className="hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'dkim-record' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'dkim-record' ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800 font-mono text-[11px] text-amber-300 break-all leading-tight max-h-24 overflow-y-auto">
                    {result.authentication.dkim.record ||
                      (result.authentication.dkim.selector
                        ? 'No public key TXT record found.'
                        : 'No cryptographic signature header in message.')}
                  </div>
                </div>
              </div>

              {/* 3. DMARC Policy Enforcement Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3.5 shadow-2xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-xs text-white">DMARC Policy (RFC 7489)</span>
                    </div>
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                        result.authentication.dmarc.policy === 'reject'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                          : result.authentication.dmarc.policy === 'quarantine'
                          ? 'bg-amber-950 text-amber-300 border-amber-700'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {result.authentication.dmarc.policy ? `p=${result.authentication.dmarc.policy}` : result.authentication.dmarc.status}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400">
                    Query: <code className="text-emerald-300">dig TXT _dmarc.{result.sender_alignment.from_domain || 'domain'}</code>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {result.authentication.dmarc.detail}
                  </p>
                </div>

                {/* Raw DMARC Record Box */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Policy Directives:</span>
                    {result.authentication.dmarc.record && (
                      <button
                        type="button"
                        onClick={() => handleCopy(result.authentication.dmarc.record || '', 'dmarc-record')}
                        className="hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'dmarc-record' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'dmarc-record' ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800 font-mono text-[11px] text-emerald-300 break-all leading-tight">
                    {result.authentication.dmarc.record || 'No _dmarc TXT record deployed.'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SUB-CONTAINER C: RAW MIME HEADER STREAM / TERMINAL CONSOLE */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-slate-400" />
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Raw Header Stream &amp; Audit Trace
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                Timestamp: {result.analyzed_at ? new Date(result.analyzed_at).toLocaleString() : 'Live'}
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono text-xs text-slate-300 space-y-1 overflow-x-auto">
              <div>
                <span className="text-slate-500">From: </span>
                <span className="text-emerald-300">{result.sender_alignment.from_address || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500">Return-Path: </span>
                <span className={mismatch ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                  {result.sender_alignment.return_path || 'None (Client submission)'}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Subject: </span>
                <span className="text-slate-200">
                  {result.parsed_eml_metadata?.subject || '(Inspected in memory)'}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Authentication-Results: </span>
                <span className="text-cyan-300">
                  spf={spfStatus.toLowerCase()} (sender IP validated); dkim={dkimStatus.toLowerCase()} (header verified); dmarc={dmarcStatus.toLowerCase()} (action={result.authentication.dmarc.policy || 'none'})
                </span>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
