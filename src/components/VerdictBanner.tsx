import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { AnalysisResponse } from '../types';

interface VerdictBannerProps {
  result: AnalysisResponse;
}

export const VerdictBanner: React.FC<VerdictBannerProps> = ({ result }) => {
  const { verdict, base_verdict, is_escalated, verdict_reasons, analyzed_at } = result;

  const config = {
    LEGITIMATE: {
      borderColor: 'border-[#1B4D3E]',
      bgSurface: 'bg-[#F2F1ED]',
      stampClass: 'text-[#1B4D3E] border-[#1B4D3E] bg-[#EAE9E4]',
      badgeBg: 'bg-[#1B4D3E] text-white',
      icon: <ShieldCheck className="w-6 h-6 text-[#1B4D3E]" />,
      tag: 'AUTHENTIC & CRYPTOGRAPHICALLY VERIFIED',
      desc: 'All core authentication mechanisms (SPF, DKIM, DMARC) passed DNS inspection with strict sender domain alignment and clean message content.'
    },
    SUSPICIOUS: {
      borderColor: 'border-[#B8860B]',
      bgSurface: 'bg-[#F2F1ED]',
      stampClass: 'text-[#B8860B] border-[#B8860B] bg-[#EAE9E4]',
      badgeBg: 'bg-[#B8860B] text-white',
      icon: <AlertTriangle className="w-6 h-6 text-[#B8860B]" />,
      tag: 'CAUTION: ANOMALIES & POTENTIAL THREAT',
      desc: 'Anomalies detected: either partial DNS authentication failure, weak DMARC monitoring policy, or significant social-engineering urgency signals.'
    },
    SPOOFED: {
      borderColor: 'border-[#B22222]',
      bgSurface: 'bg-[#F2F1ED]',
      stampClass: 'text-[#B22222] border-[#B22222] bg-[#EAE9E4]',
      badgeBg: 'bg-[#B22222] text-white',
      icon: <ShieldAlert className="w-6 h-6 text-[#B22222]" />,
      tag: 'MALICIOUS SPOOFING / PHISHING INTRUSION',
      desc: 'Critical security violation: sender domain mismatch, failed cryptographic authorization, or severe social engineering coercion patterns.'
    }
  }[verdict];

  return (
    <div className={`border-2 border-[#1A1A1B] ${config.bgSurface} p-5 relative shadow-xs`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#1A1A1B]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white border-2 border-[#1A1A1B] text-[#1A1A1B]">
            {config.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif-italic text-sm text-[#1A1A1B]/80 font-bold">
                Security Triage Evaluation:
              </span>
              <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 bg-[#1A1A1B] text-white">
                {new Date(analyzed_at).toLocaleTimeString()}
              </span>
            </div>
            <div className="text-xs font-mono font-bold text-[#1A1A1B] mt-0.5 tracking-tight">
              {config.tag}
            </div>
          </div>
        </div>

        {/* The Verdict Stamp Badge */}
        <div className="self-stretch sm:self-auto flex items-center justify-center">
          <div
            id="verdict-stamp-display"
            className={`font-display font-black text-2xl px-6 py-2 border-4 uppercase tracking-widest verdict-stamp transform -rotate-2 ${config.stampClass}`}
          >
            [ {verdict} ]
          </div>
        </div>
      </div>

      {/* Gmail Source Verification Banner */}
      {result.source === 'gmail' && (
        <div className="mt-3 px-3.5 py-2.5 bg-white border-2 border-[#1A1A1B] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#1A1A1B] text-white font-bold text-[10px] uppercase tracking-wider">
              REAL GMAIL INBOX
            </span>
            <span className="font-bold text-[#1A1A1B]">
              Message ingested directly from authorized Gmail account
            </span>
          </div>
          <span className="text-[11px] text-[#1A1A1B]/75 italic">
            SpoofSentry only reads message headers/content for analysis. It never sends, deletes, or modifies any email.
          </span>
        </div>
      )}

      {/* Escalation alert if applicable */}
      {is_escalated && (
        <div className="mt-3 px-3.5 py-2.5 bg-[#EAE9E4] border-2 border-[#B22222] flex items-center gap-2.5 text-xs text-[#B22222] font-mono">
          <ArrowUpRight className="w-4 h-4 text-[#B22222] shrink-0 font-bold" />
          <span>
            <strong>CONTENT ESCALATION APPLIED:</strong> Base protocol verdict was <code>{base_verdict}</code>, escalated to{' '}
            <code>{verdict}</code> due to high-risk social engineering markers.
          </span>
        </div>
      )}

      {/* Rationale & Reasons */}
      <div className="mt-4 space-y-3">
        <p className="text-sm text-[#1A1A1B] leading-relaxed font-sans font-medium">
          {config.desc}
        </p>
        
        <div className="pt-3 border-t border-[#1A1A1B]/20">
          <span className="font-mono text-[11px] font-bold text-[#1A1A1B] uppercase tracking-wider block mb-2">
            Engine Decision Log ({verdict_reasons.length} Evaluated Rules):
          </span>
          <ul className="space-y-1.5">
            {verdict_reasons.map((reason, idx) => (
              <li
                key={idx}
                className="font-mono text-xs text-[#1A1A1B] flex items-start gap-2 bg-white px-3 py-2 border border-[#1A1A1B] border-l-4 border-l-[#1A1A1B]"
              >
                <span className="text-[#1A1A1B] font-bold">▶</span>
                <span className="font-medium">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
