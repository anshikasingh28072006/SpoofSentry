import React from 'react';
import { HistoryItem, AnalysisResponse } from '../types';
import { History, Eye, RefreshCw } from 'lucide-react';

interface HistoryLogTableProps {
  history: HistoryItem[];
  onSelectRecord: (details: AnalysisResponse) => void;
  onRefresh: () => void;
  loading: boolean;
}

export const HistoryLogTable: React.FC<HistoryLogTableProps> = ({
  history,
  onSelectRecord,
  onRefresh,
  loading
}) => {
  return (
    <div className="bg-[#F2F1ED] border-2 border-[#1A1A1B] overflow-hidden">
      <div className="p-4 bg-white border-b-2 border-[#1A1A1B] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#1A1A1B]" />
          <h3 className="font-display font-black text-sm text-[#1A1A1B] tracking-wide">
            RECORDED FORENSIC AUDIT TRAIL
          </h3>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="text-xs font-mono font-bold text-[#1A1A1B] hover:bg-[#1A1A1B] hover:text-white bg-white border-2 border-[#1A1A1B] px-3 py-1 flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>REFRESH LOG</span>
        </button>
      </div>

      <div className="overflow-x-auto bg-white">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-[#1A1A1B] text-white border-b-2 border-[#1A1A1B] text-[11px]">
            <tr>
              <th className="py-2.5 px-3 font-bold">ID</th>
              <th className="py-2.5 px-3 font-bold">TIMESTAMP</th>
              <th className="py-2.5 px-3 font-bold">SENDER "FROM"</th>
              <th className="py-2.5 px-3 font-bold">SUBJECT</th>
              <th className="py-2.5 px-3 font-bold">RISK SCORE</th>
              <th className="py-2.5 px-3 font-bold">VERDICT</th>
              <th className="py-2.5 px-3 font-bold text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A1A1B]/20 text-[#1A1A1B]">
            {history.length > 0 ? (
              history.map(item => {
                const verdictClass = {
                  LEGITIMATE: 'bg-[#1B4D3E] text-white border border-[#1A1A1B]',
                  SUSPICIOUS: 'bg-[#B8860B] text-white border border-[#1A1A1B]',
                  SPOOFED: 'bg-[#B22222] text-white border border-[#1A1A1B]'
                }[item.verdict] || 'bg-[#1A1A1B] text-white border border-[#1A1A1B]';

                return (
                  <tr key={item.id} className="hover:bg-[#F2F1ED] transition-colors">
                    <td className="py-2.5 px-3 text-[#1A1A1B]/70 font-semibold">#{item.id}</td>
                    <td className="py-2.5 px-3 text-[#1A1A1B]/70 font-medium whitespace-nowrap">
                      {new Date(item.analyzedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-[#1A1A1B] max-w-[200px] truncate">
                      {item.fromAddress}
                    </td>
                    <td className="py-2.5 px-3 max-w-[240px] truncate text-[#1A1A1B]/80 font-medium">
                      {item.subject || '(No subject)'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-[#1A1A1B]">{item.riskScore}</span>
                      <span className="text-[#1A1A1B]/60 font-semibold">/100</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 text-[10px] font-black tracking-wider ${verdictClass}`}>
                        {item.verdict}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onSelectRecord(item.details)}
                        className="px-2.5 py-1 bg-white hover:bg-[#1A1A1B] hover:text-white text-[#1A1A1B] border border-[#1A1A1B] font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                      >
                        <Eye className="w-3 h-3" />
                        <span>INSPECT</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#1A1A1B]/60 font-medium italic">
                  No previous audit records found in current session. Run an analysis above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

