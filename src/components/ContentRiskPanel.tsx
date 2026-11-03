import React from 'react';
import { AlertTriangle, DollarSign, Clock, ShieldAlert, Link as LinkIcon, AlertOctagon } from 'lucide-react';
import { ContentAnalysisResult } from '../types';

interface ContentRiskPanelProps {
  contentAnalysis: ContentAnalysisResult;
}

export const ContentRiskPanel: React.FC<ContentRiskPanelProps> = ({ contentAnalysis }) => {
  const {
    risk_score,
    risk_rating,
    matched_phrases,
    urgency_count,
    financial_count,
    threat_count,
    link_count,
    raw_ip_links
  } = contentAnalysis;

  const ratingStyles = {
    LOW: {
      badge: 'bg-[#1B4D3E] text-white border-2 border-[#1A1A1B]',
      bar: 'bg-[#1B4D3E]'
    },
    MEDIUM: {
      badge: 'bg-[#B8860B] text-white border-2 border-[#1A1A1B]',
      bar: 'bg-[#B8860B]'
    },
    HIGH: {
      badge: 'bg-[#B22222] text-white border-2 border-[#1A1A1B] animate-pulse',
      bar: 'bg-[#B22222]'
    }
  }[risk_rating];

  return (
    <div className="bg-[#F2F1ED] border-2 border-[#1A1A1B] p-4 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b-2 border-[#1A1A1B]">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-white bg-[#1A1A1B] px-2 py-0.5">
            03
          </span>
          <h3 className="font-display font-black text-sm text-[#1A1A1B] tracking-wide">
            CONTENT & SOCIAL ENGINEERING ANALYSIS
          </h3>
        </div>
        <span className={`font-mono text-xs font-black px-2.5 py-0.5 ${ratingStyles.badge}`}>
          {risk_rating} RISK
        </span>
      </div>

      {/* Score and Signals Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Risk Score Gauge */}
        <div className="bg-white p-3.5 border-2 border-[#1A1A1B] flex flex-col items-center justify-center text-center">
          <span className="font-mono text-[11px] font-bold text-[#1A1A1B]/70 uppercase">Risk Score</span>
          <div className="flex items-baseline gap-1 my-1">
            <span className="font-display font-black text-3xl text-[#1A1A1B]">{risk_score}</span>
            <span className="font-mono text-xs font-bold text-[#1A1A1B]/60">/100</span>
          </div>
          {/* Visual bar */}
          <div className="w-full h-2 bg-[#EAE9E4] border border-[#1A1A1B] overflow-hidden mt-1">
            <div
              className={`h-full ${ratingStyles.bar} transition-all duration-500`}
              style={{ width: `${risk_score}%` }}
            />
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-white p-2.5 border-2 border-[#1A1A1B] flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1 text-[#1A1A1B] mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-display font-black text-base">{urgency_count}</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#1A1A1B]/70 uppercase">Urgency Triggers</span>
          </div>

          <div className="bg-white p-2.5 border-2 border-[#1A1A1B] flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1 text-[#B22222] mb-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span className="font-display font-black text-base">{financial_count}</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#1A1A1B]/70 uppercase">Financial Demands</span>
          </div>

          <div className="bg-white p-2.5 border-2 border-[#1A1A1B] flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1 text-[#1A1A1B] mb-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="font-display font-black text-base">{threat_count}</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#1A1A1B]/70 uppercase">Threat / Scares</span>
          </div>

          <div className="bg-white p-2.5 border-2 border-[#1A1A1B] flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1 text-[#1A1A1B] mb-1">
              <LinkIcon className="w-3.5 h-3.5" />
              <span className="font-display font-black text-base">{link_count}</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#1A1A1B]/70 uppercase">Extracted Links</span>
          </div>
        </div>
      </div>

      {/* Raw IP Alert if present */}
      {raw_ip_links && raw_ip_links.length > 0 && (
        <div className="p-3 bg-white border-2 border-[#B22222] flex items-start gap-2.5">
          <AlertOctagon className="w-5 h-5 text-[#B22222] shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-mono font-black text-[#B22222] block">
              RAW IP ADDRESS LINK EVASION DETECTED (+30 Risk Penalty)
            </span>
            <p className="text-[#1A1A1B] font-sans font-medium">
              Attacker messages often use raw IP targets to bypass domain-based reputation filters and blocklists.
            </p>
            <div className="font-mono text-[11px] font-bold text-[#B22222] bg-[#EAE9E4] p-1.5 border border-[#1A1A1B]">
              {raw_ip_links.join(' , ')}
            </div>
          </div>
        </div>
      )}

      {/* Matched Red-Flag Keyword Pill Badges */}
      <div className="bg-white p-3.5 border-2 border-[#1A1A1B]">
        <span className="font-mono text-[11px] font-bold text-[#1A1A1B] uppercase block mb-2 tracking-wider">
          Detected Red-Flag Phrases & Keyword Matches ({matched_phrases.length}):
        </span>

        {matched_phrases.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {matched_phrases.map((item, i) => {
              const tagStyle = item.category.includes('Urgency')
                ? 'bg-[#EAE9E4] text-[#1A1A1B] border-l-4 border-l-[#B8860B]'
                : item.category.includes('Financial')
                ? 'bg-[#EAE9E4] text-[#1A1A1B] border-l-4 border-l-[#B22222]'
                : 'bg-[#EAE9E4] text-[#1A1A1B] border-l-4 border-l-[#1A1A1B]';

              return (
                <span
                  key={i}
                  className={`font-mono text-xs px-2.5 py-1 border border-[#1A1A1B] flex items-center gap-1.5 ${tagStyle}`}
                >
                  <span className="font-bold text-[10px] text-[#1A1A1B]/60">[{item.category}]</span>
                  <strong className="font-bold text-[#1A1A1B]">"{item.phrase}"</strong>
                </span>
              );
            })}
          </div>
        ) : (
          <div className="font-mono text-xs text-[#1A1A1B]/60 italic font-medium">
            No known phishing keywords, pressure tactics, or suspicious financial demands matched in message body.
          </div>
        )}
      </div>
    </div>
  );
};
