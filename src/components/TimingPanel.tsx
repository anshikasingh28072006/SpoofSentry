import React from 'react';
import { Clock, Sun, Moon } from 'lucide-react';
import { TimingAnalysisResult } from '../types';

interface TimingPanelProps {
  timingAnalysis: TimingAnalysisResult;
}

export const TimingPanel: React.FC<TimingPanelProps> = ({ timingAnalysis }) => {
  const { parsed_date, hour_local, is_off_hours, detail } = timingAnalysis;

  return (
    <div className="bg-[#F2F1ED] border-2 border-[#1A1A1B] p-4">
      <div className="flex flex-wrap items-center justify-between pb-3 border-b-2 border-[#1A1A1B] mb-3 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-white bg-[#1A1A1B] px-2 py-0.5">
            04
          </span>
          <h3 className="font-display font-black text-sm text-[#1A1A1B] tracking-wide">
            SEND-TIME ANOMALY DETECTION
          </h3>
        </div>
        {is_off_hours ? (
          <span className="font-mono text-xs font-black px-2.5 py-0.5 bg-[#B8860B] text-white border-2 border-[#1A1A1B] flex items-center gap-1.5">
            <Moon className="w-3.5 h-3.5" /> OFF-HOURS ANOMALY
          </span>
        ) : (
          <span className="font-mono text-xs font-black px-2.5 py-0.5 bg-[#1B4D3E] text-white border-2 border-[#1A1A1B] flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5" /> NORMAL BUSINESS HOURS
          </span>
        )}
      </div>

      <div className="bg-white p-3.5 border-2 border-[#1A1A1B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#1A1A1B]" />
            <span className="font-mono text-xs font-bold text-[#1A1A1B]">
              {parsed_date || 'No Date header supplied'}
            </span>
            {hour_local !== null && (
              <span className="font-mono text-[11px] font-bold px-1.5 py-0.2 bg-[#EAE9E4] text-[#1A1A1B] border border-[#1A1A1B]">
                Local Hour: {hour_local}:00
              </span>
            )}
          </div>
          <p className="text-xs text-[#1A1A1B] font-sans font-medium">{detail}</p>
        </div>

        <div className="text-[11px] font-mono font-bold text-[#1A1A1B] bg-[#EAE9E4] px-2.5 py-1.5 border border-[#1A1A1B] shrink-0">
          Threshold: 23:00 to 06:00
        </div>
      </div>
    </div>
  );
};
