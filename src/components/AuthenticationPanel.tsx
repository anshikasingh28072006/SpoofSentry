import React from 'react';
import { Globe, CheckCircle2, XCircle, AlertCircle, Key, Layers } from 'lucide-react';
import { SenderAlignmentResult, SpfResult, DkimResult, DmarcResult } from '../types';

interface AuthenticationPanelProps {
  alignment: SenderAlignmentResult;
  spf: SpfResult;
  dkim: DkimResult;
  dmarc: DmarcResult;
}

export const AuthenticationPanel: React.FC<AuthenticationPanelProps> = ({
  alignment,
  spf,
  dkim,
  dmarc
}) => {
  const getStatusBadge = (status: 'PASS' | 'FAIL' | 'NONE') => {
    switch (status) {
      case 'PASS':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2 py-0.5 bg-[#1B4D3E] text-white border border-[#1A1A1B]">
            <CheckCircle2 className="w-3 h-3" /> PASS
          </span>
        );
      case 'FAIL':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2 py-0.5 bg-[#B22222] text-white border border-[#1A1A1B]">
            <XCircle className="w-3 h-3" /> FAIL
          </span>
        );
      case 'NONE':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2 py-0.5 bg-[#1A1A1B] text-white/90 border border-[#1A1A1B]">
            <AlertCircle className="w-3 h-3" /> NONE
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Domain Alignment Grid */}
      <div className="bg-[#F2F1ED] border-2 border-[#1A1A1B] p-4">
        <div className="flex flex-wrap items-center justify-between pb-3 border-b-2 border-[#1A1A1B] mb-3 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-white bg-[#1A1A1B] px-2 py-0.5">
              01
            </span>
            <h3 className="font-display font-black text-sm text-[#1A1A1B] tracking-wide">
              SENDER DOMAIN ALIGNMENT (RFC 5322 vs RFC 5321)
            </h3>
          </div>
          {alignment.domain_mismatch ? (
            <span className="font-mono text-xs font-black px-2.5 py-1 bg-[#B22222] text-white border-2 border-[#1A1A1B] flex items-center gap-1.5 animate-pulse">
              <XCircle className="w-3.5 h-3.5" /> MISMATCH DETECTED
            </span>
          ) : (
            <span className="font-mono text-xs font-black px-2.5 py-1 bg-[#1B4D3E] text-white border-2 border-[#1A1A1B] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> DOMAINS ALIGNED
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white p-3 border border-[#1A1A1B]">
            <span className="text-[11px] font-mono text-[#1A1A1B]/70 font-semibold block mb-1">
              Header "From" Domain (RFC 5322)
            </span>
            <code className="text-sm font-mono font-bold text-[#1A1A1B] block truncate">
              {alignment.from_domain || '(None / Malformed)'}
            </code>
            <span className="text-[11px] text-[#1A1A1B]/60 font-mono truncate block mt-1">
              {alignment.from_address}
            </span>
          </div>

          <div className="bg-white p-3 border border-[#1A1A1B]">
            <span className="text-[11px] font-mono text-[#1A1A1B]/70 font-semibold block mb-1">
              "Return-Path" Envelope Domain (RFC 5321)
            </span>
            <code className="text-sm font-mono font-bold text-[#1A1A1B] block truncate">
              {alignment.return_path_domain || '(No Return-Path specified)'}
            </code>
            <span className="text-[11px] text-[#1A1A1B]/60 font-mono truncate block mt-1">
              {alignment.return_path || 'Direct client submission'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. DNS Authentication Checks (SPF, DKIM, DMARC) */}
      <div className="bg-[#F2F1ED] border-2 border-[#1A1A1B] p-4">
        <div className="flex items-center gap-2 pb-3 border-b-2 border-[#1A1A1B] mb-3">
          <span className="font-mono text-xs font-bold text-white bg-[#1A1A1B] px-2 py-0.5">
            02
          </span>
          <h3 className="font-display font-black text-sm text-[#1A1A1B] tracking-wide">
            DNS PROTOCOL VALIDATION (LIVE NAMESERVER LOOKUPS)
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* SPF Check */}
          <div className="bg-white p-3.5 border-2 border-[#1A1A1B] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[#1A1A1B]/20">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#1A1A1B]" />
                  <span className="font-display font-bold text-xs text-[#1A1A1B]">SPF POLICY</span>
                </div>
                {getStatusBadge(spf.status)}
              </div>
              <p className="text-xs text-[#1A1A1B] mb-3 font-sans leading-relaxed">
                {spf.detail}
              </p>
            </div>

            <div className="bg-[#EAE9E4] p-2 border border-[#1A1A1B] font-mono text-[11px]">
              <span className="text-[#1A1A1B]/70 font-bold block text-[10px] uppercase">DNS TXT Record:</span>
              <code className="text-[#1A1A1B] font-semibold block break-all mt-0.5">
                {spf.record || '(No v=spf1 record returned from DNS)'}
              </code>
            </div>
          </div>

          {/* DKIM Check */}
          <div className="bg-white p-3.5 border-2 border-[#1A1A1B] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[#1A1A1B]/20">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#1A1A1B]" />
                  <span className="font-display font-bold text-xs text-[#1A1A1B]">DKIM SIGNATURE</span>
                </div>
                {getStatusBadge(dkim.status)}
              </div>
              <p className="text-xs text-[#1A1A1B] mb-3 font-sans leading-relaxed">
                {dkim.detail}
              </p>
            </div>

            <div className="bg-[#EAE9E4] p-2 border border-[#1A1A1B] font-mono text-[11px]">
              <span className="text-[#1A1A1B]/70 font-bold block text-[10px] uppercase">
                {dkim.selector ? `Selector: ${dkim.selector}._domainkey.${dkim.domain}` : 'DKIM DNS Key:'}
              </span>
              <code className="text-[#1A1A1B] font-semibold block break-all mt-0.5">
                {dkim.record || (dkim.selector ? 'No public key TXT record found.' : 'No DKIM header in message.')}
              </code>
            </div>
          </div>

          {/* DMARC Check */}
          <div className="bg-white p-3.5 border-2 border-[#1A1A1B] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[#1A1A1B]/20">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#1A1A1B]" />
                  <span className="font-display font-bold text-xs text-[#1A1A1B]">DMARC POLICY</span>
                </div>
                <span className={`font-mono text-[11px] font-bold px-2 py-0.5 border border-[#1A1A1B] ${
                  dmarc.policy === 'reject'
                    ? 'bg-[#1B4D3E] text-white'
                    : dmarc.policy === 'quarantine'
                    ? 'bg-[#B8860B] text-white'
                    : 'bg-[#1A1A1B] text-white'
                }`}>
                  {dmarc.policy ? `p=${dmarc.policy}` : dmarc.status}
                </span>
              </div>
              <p className="text-xs text-[#1A1A1B] mb-3 font-sans leading-relaxed">
                {dmarc.detail}
              </p>
            </div>

            <div className="bg-[#EAE9E4] p-2 border border-[#1A1A1B] font-mono text-[11px]">
              <span className="text-[#1A1A1B]/70 font-bold block text-[10px] uppercase">
                Lookup: _dmarc.{alignment.from_domain || 'domain'}
              </span>
              <code className="text-[#1A1A1B] font-semibold block break-all mt-0.5">
                {dmarc.record || 'No _dmarc TXT record deployed.'}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
