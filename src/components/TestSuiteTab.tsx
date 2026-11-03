import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle, Terminal, RefreshCw, Cpu } from 'lucide-react';

export const TestSuiteTab: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<'idle' | 'running' | 'success' | 'failed'>('idle');

  const runPythonTests = async () => {
    setIsRunning(true);
    setTestStatus('running');
    setOutput(null);

    try {
      const response = await fetch('/api/run-python-suite', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        setOutput(data.stdout);
        setTestStatus('success');
      } else {
        setOutput(data.stdout + '\n' + (data.stderr || 'Test execution encountered an error.'));
        setTestStatus('failed');
      }
    } catch (err: any) {
      setOutput('Failed to trigger test suite: ' + err.message);
      setTestStatus('failed');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#F2F1ED] border-2 border-[#1A1A1B] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#1B4D3E] border border-[#1A1A1B]" />
            <h2 className="font-display font-black text-lg text-[#1A1A1B]">
              AUTOMATED THREAT ENGINE VERIFICATION SUITE
            </h2>
          </div>
          <p className="text-xs text-[#1A1A1B]/80 font-sans mt-1 max-w-2xl font-medium">
            Executes real DNS lookups against live internet nameservers for both legitimate and spoofed test cases
            to mathematically verify SPF, DKIM selector records, DMARC policies, and content scoring.
          </p>
        </div>

        <button
          id="btn-run-all-tests"
          onClick={runPythonTests}
          disabled={isRunning}
          className="px-4 py-2.5 bg-[#1A1A1B] hover:bg-[#333] disabled:opacity-50 text-white font-mono font-bold text-xs border-2 border-[#1A1A1B] flex items-center gap-2 transition-all shrink-0 cursor-pointer shadow-xs"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>EXECUTING DNS SUITE...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>RUN LIVE VERIFICATION TESTS</span>
            </>
          )}
        </button>
      </div>

      {/* Test Scenarios Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Test 1 */}
        <div className="bg-white border-2 border-[#1A1A1B] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[#1A1A1B]/20">
              <span className="font-mono text-xs text-white font-black bg-[#1B4D3E] px-2 py-0.5 border border-[#1A1A1B]">
                TEST CASE 01
              </span>
              <span className="font-mono text-[10px] text-[#1A1A1B]/70 uppercase font-bold">Live DNS</span>
            </div>
            <h3 className="font-display font-black text-sm text-[#1A1A1B] mb-1">
              Legitimate Email (google.com)
            </h3>
            <p className="text-xs text-[#1A1A1B] font-sans mb-3 font-medium">
              Google Security notice with aligned From/Return-Path, active SPF record, valid DKIM selector, and DMARC p=reject policy.
            </p>
          </div>

          <div className="font-mono text-[11px] bg-[#EAE9E4] p-2.5 border border-[#1A1A1B] space-y-1">
            <div className="text-[#1A1A1B] flex justify-between font-semibold">
              <span>Expected Verdict:</span>
              <strong className="text-[#1B4D3E] font-black">LEGITIMATE</strong>
            </div>
            <div className="text-[#1A1A1B] flex justify-between font-semibold">
              <span>Content Risk:</span>
              <strong className="text-[#1B4D3E] font-black">LOW (0/100)</strong>
            </div>
          </div>
        </div>

        {/* Test 2 */}
        <div className="bg-white border-2 border-[#1A1A1B] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[#1A1A1B]/20">
              <span className="font-mono text-xs text-white font-black bg-[#B22222] px-2 py-0.5 border border-[#1A1A1B]">
                TEST CASE 02
              </span>
              <span className="font-mono text-[10px] text-[#1A1A1B]/70 uppercase font-bold">Phish Test</span>
            </div>
            <h3 className="font-display font-black text-sm text-[#1A1A1B] mb-1">
              Spoofed Wire Transfer Attack
            </h3>
            <p className="text-xs text-[#1A1A1B] font-sans mb-3 font-medium">
              Mismatched From vs Return-Path domain, missing DKIM, urgency coercion, bank wire keywords, raw IP link, and 03:15 AM off-hours send.
            </p>
          </div>

          <div className="font-mono text-[11px] bg-[#EAE9E4] p-2.5 border border-[#1A1A1B] space-y-1">
            <div className="text-[#1A1A1B] flex justify-between font-semibold">
              <span>Expected Verdict:</span>
              <strong className="text-[#B22222] font-black">SPOOFED</strong>
            </div>
            <div className="text-[#1A1A1B] flex justify-between font-semibold">
              <span>Content Risk:</span>
              <strong className="text-[#B22222] font-black">HIGH (100/100)</strong>
            </div>
          </div>
        </div>

        {/* Test 3 */}
        <div className="bg-white border-2 border-[#1A1A1B] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[#1A1A1B]/20">
              <span className="font-mono text-xs text-white font-black bg-[#1A1A1B] px-2 py-0.5 border border-[#1A1A1B]">
                TEST CASE 03
              </span>
              <span className="font-mono text-[10px] text-[#1A1A1B]/70 uppercase font-bold">MIME Parser</span>
            </div>
            <h3 className="font-display font-black text-sm text-[#1A1A1B] mb-1">
              Raw .EML Multipart Parser
            </h3>
            <p className="text-xs text-[#1A1A1B] font-sans mb-3 font-medium">
              Extracts RFC 5322 headers, Return-Path, DKIM-Signature header tags, Date timestamp, and plain-text body from raw binary byte stream.
            </p>
          </div>

          <div className="font-mono text-[11px] bg-[#EAE9E4] p-2.5 border border-[#1A1A1B] space-y-1">
            <div className="text-[#1A1A1B] flex justify-between font-semibold">
              <span>MIME Decoder:</span>
              <strong className="text-[#1A1A1B] font-black">RFC 5322 / RFC 2045</strong>
            </div>
            <div className="text-[#1A1A1B] flex justify-between font-semibold">
              <span>Payload Extraction:</span>
              <strong className="text-[#1A1A1B] font-black">Multipart Safe</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Output Console */}
      <div className="bg-[#1A1A1B] text-[#EAE9E4] border-2 border-[#1A1A1B] shadow-xs">
        <div className="bg-[#111111] px-4 py-2.5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-xs text-white font-bold tracking-wider">
              TEST SUITE CONSOLE STDOUT (`test_detector.py`)
            </span>
          </div>
          <div className="flex items-center gap-2">
            {testStatus === 'success' && (
              <span className="font-mono text-[11px] text-white font-bold flex items-center gap-1 bg-[#1B4D3E] px-2 py-0.5 border border-white/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> ALL ASSERTIONS PASSED
              </span>
            )}
            {testStatus === 'failed' && (
              <span className="font-mono text-[11px] text-white font-bold flex items-center gap-1 bg-[#B22222] px-2 py-0.5 border border-white/20">
                <XCircle className="w-3.5 h-3.5" /> TEST FAILED
              </span>
            )}
          </div>
        </div>

        <div className="p-4 font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed select-text">
          {output ? (
            <pre className="text-emerald-400 whitespace-pre-wrap">{output}</pre>
          ) : (
            <div className="text-white/60 py-8 text-center space-y-2 font-medium">
              <Cpu className="w-8 h-8 mx-auto text-white/40 mb-2" />
              <p>Click "RUN LIVE VERIFICATION TESTS" above to execute the Python test suite.</p>
              <p className="text-[11px] text-white/40 font-mono">
                Queries Google nameservers in real-time and runs all assertions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
