import React, { useState, useEffect, useRef } from 'react';
import { GmailIntakeTab } from './components/GmailIntakeTab';
import { ScreenshotIntakeTab } from './components/ScreenshotIntakeTab';
import { PasteTextIntakeTab } from './components/PasteTextIntakeTab';
import { ForensicsResultView } from './components/ForensicsResultView';
import { FaqSection } from './components/FaqSection';
import { TestSuiteTab } from './components/TestSuiteTab';
import { SourceCodeViewer } from './components/SourceCodeViewer';
import { HistoryLogTable } from './components/HistoryLogTable';
import { EmailLogo } from './components/EmailLogo';
import { AnalysisResponse, HistoryItem } from './types';
import { validateEmailInput } from './utils/emailValidator';
import { evaluateEmail } from './utils/forensicsEngine';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Terminal,
  History,
  Code,
  Zap,
  Mail,
  Camera,
  FileText,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<'analyzer' | 'testsuite' | 'history' | 'specs'>('analyzer');
  const [activeTab, setActiveTab] = useState<'gmail' | 'screenshot' | 'paste'>('gmail');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data.history) && data.history.length > 0) {
          setHistory(data.history);
          return;
        }
      }
    } catch {
      // silent fallback to localStorage
    }

    try {
      const saved = localStorage.getItem('spoofsentry_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  };

  const persistToHistory = (itemResult: AnalysisResponse) => {
    const fromAddr = itemResult.sender_alignment.from_address || itemResult.sender_alignment.from_domain || 'Unknown Sender';
    const subj = itemResult.content_analysis ? (itemResult as any).subject || itemResult.gmail_metadata?.snippet || '' : '';
    
    const record: HistoryItem = {
      id: Date.now(),
      userId: 1,
      fromAddress: fromAddr,
      subject: subj,
      verdict: itemResult.verdict,
      riskScore: itemResult.content_analysis.risk_score,
      analyzedAt: itemResult.analyzed_at || new Date().toISOString(),
      details: itemResult
    };

    try {
      const existing = localStorage.getItem('spoofsentry_history');
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(record);
      localStorage.setItem('spoofsentry_history', JSON.stringify(list.slice(0, 30)));
      setHistory(list.slice(0, 30));
    } catch {
      // ignore
    }

    try {
      fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      }).catch(() => {});
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleExecuteAnalysis = async (params: {
    from: string;
    return_path?: string;
    dkim_header?: string;
    date?: string;
    subject?: string;
    body?: string;
    source: 'gmail' | 'screenshot' | 'raw-paste' | 'manual';
    headersUnavailable?: boolean;
    gmail_metadata?: any;
  }) => {
    setIsAnalyzing(true);
    setError(null);

    // Client-side strict validation check
    const validation = validateEmailInput({
      from: params.from,
      subject: params.subject,
      body: params.body,
      text: [params.from, params.subject, params.body].filter(Boolean).join('\n')
    });

    if (!validation.isEmail) {
      setIsAnalyzing(false);
      setError(`Cannot analyze: This is not an email. ${validation.reason} SpoofSentry only evaluates email messages.`);
      return;
    }

    // Clean sender email check
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    let cleanFrom = params.from;
    let cleanHeadersUnavailable = params.headersUnavailable;
    if (!cleanFrom || !cleanFrom.trim() || !emailRegex.test(cleanFrom)) {
      const emailInBody = params.body ? params.body.match(emailRegex) : null;
      if (emailInBody) {
        cleanFrom = emailInBody[0];
        cleanHeadersUnavailable = true;
      }
    }

    try {
      let finalResult: AnalysisResponse | null = null;

      // 1. First attempt: call the backend / serverless API endpoint
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...params,
            from: cleanFrom,
            headersUnavailable: cleanHeadersUnavailable
          })
        });

        const contentType = response.headers.get('content-type') || '';

        if (response.ok && contentType.includes('application/json')) {
          const result: AnalysisResponse = await response.json();
          finalResult = {
            ...result,
            source: params.source,
            headersUnavailable: cleanHeadersUnavailable,
            gmail_metadata: params.gmail_metadata
          };
        } else if (!response.ok && contentType.includes('application/json')) {
          const errData = await response.json();
          if (errData.is_not_email) {
            setError(`Cannot analyze: ${errData.error}`);
            setIsAnalyzing(false);
            return;
          }
        }
      } catch (networkErr) {
        console.warn('Backend API endpoint returned error or unreachable. Falling back to in-browser live DNS engine:', networkErr);
      }

      // 2. Dual-Engine Fallback: If backend was not reached or returned 404 HTML (Vercel static routing)
      // run the live forensics engine client-side with Google DNS-over-HTTPS!
      if (!finalResult) {
        console.info('Invoking SpoofSentry client forensics engine via Google DNS-over-HTTPS...');
        const localEvaluation = await evaluateEmail({
          fromAddress: cleanFrom,
          returnPath: params.return_path,
          dkimHeader: params.dkim_header,
          subject: params.subject,
          body: params.body,
          dateStr: params.date
        });

        finalResult = {
          ...localEvaluation,
          source: params.source,
          headersUnavailable: Boolean(cleanHeadersUnavailable),
          gmail_metadata: params.gmail_metadata
        };
      }

      setAnalysisResult(finalResult);
      persistToHistory(finalResult);

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'An error occurred during email evaluation.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeScreenshotText = async (
    text: string,
    options: {
      source: 'screenshot';
      headersUnavailable: boolean;
      extractedFields?: {
        from?: string;
        subject?: string;
        date?: string;
        body?: string;
        links?: string[];
      };
    }
  ) => {
    let from = options.extractedFields?.from;
    let date = options.extractedFields?.date;
    let subject = options.extractedFields?.subject;
    let body = options.extractedFields?.body || text;

    // Check if screenshot text is actually code or non-email
    const validation = validateEmailInput({
      from,
      subject,
      body,
      text
    });

    if (!validation.isEmail) {
      setError(`Cannot analyze: This screenshot is not an email. ${validation.reason} SpoofSentry only performs forensics on emails.`);
      return;
    }

    if (!from) {
      const fromMatch = text.match(/from:?\s*([^\n]+)/i) || text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      from = fromMatch ? fromMatch[1].trim() : '';
    }
    if (!date) {
      const dateMatch = text.match(/date:?\s*([^\n]+)/i);
      date = dateMatch ? dateMatch[1].trim() : '';
    }
    if (!subject) {
      const subjectMatch = text.match(/subject:?\s*([^\n]+)/i);
      subject = subjectMatch ? subjectMatch[1].trim() : '';
    }

    await handleExecuteAnalysis({
      from: from || '',
      return_path: '',
      dkim_header: '',
      date: date || '',
      subject: subject || '',
      body: body || text,
      source: options.source,
      headersUnavailable: options.headersUnavailable
    });
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] text-stone-900 flex flex-col selection:bg-[#059669] selection:text-white">
      {/* 1. MODERN TOP BAR */}
      <header className="bg-[#091b15] text-white border-b border-[#133d2d] sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <EmailLogo className="w-9 h-9 sm:w-10 sm:h-10" size={40} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-base sm:text-lg text-white">
                  SpoofSentry
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffedd5]/20 text-[#fed7aa] border border-[#fed7aa]/30">
                  v2.0
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-bold text-[#34d399] bg-[#059669]/20 px-2.5 py-0.5 rounded-full border border-[#10b981]/40 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse"></span>
                  Live Forensics Engine
                </span>
              </div>
              <div className="text-[11px] text-[#a7f3d0]">
                Email spoofing, DNS authentication &amp; social engineering detection
              </div>
            </div>
          </div>

          {/* Nav pills */}
          <nav className="flex items-center gap-1.5 self-end sm:self-auto overflow-x-auto max-w-full pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setActiveView('analyzer')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'analyzer'
                  ? 'bg-[#059669] text-white shadow-xs shadow-emerald-950/40 ring-1 ring-[#34d399]/40'
                  : 'text-stone-300 hover:text-white hover:bg-[#133d2d]'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Analyzer</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('testsuite')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'testsuite'
                  ? 'bg-[#059669] text-white shadow-xs shadow-emerald-950/40 ring-1 ring-[#34d399]/40'
                  : 'text-stone-300 hover:text-white hover:bg-[#133d2d]'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Test Suite</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('history')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'history'
                  ? 'bg-[#059669] text-white shadow-xs shadow-emerald-950/40 ring-1 ring-[#34d399]/40'
                  : 'text-stone-300 hover:text-white hover:bg-[#133d2d]'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>History ({history.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('specs')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'specs'
                  ? 'bg-[#059669] text-white shadow-xs shadow-emerald-950/40 ring-1 ring-[#34d399]/40'
                  : 'text-stone-300 hover:text-white hover:bg-[#133d2d]'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Specs</span>
            </button>
          </nav>
        </div>
      </header>

      {/* 2. MAIN CONTAINER */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 space-y-6">
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2 shadow-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {activeView === 'analyzer' && (
          <>
            {/* 3 INTAKE METHODS CARD */}
            <div className="bg-white border border-[#e8ded3] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-stone-100">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-stone-900">
                    Analyze Your Own Email
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Choose one of the 3 intake methods below to inspect whether an email is spoofed or safe.
                  </p>
                </div>
              </div>

              {/* 3 Pill Tabs */}
              <div className="grid grid-cols-3 p-1.5 bg-[#f3ede3] border border-[#e2d5c3] rounded-xl shadow-2xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('gmail')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'gmail'
                      ? 'bg-white text-[#047857] shadow-xs border-b-2 border-[#059669]'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 text-[#059669]" />
                  <span>1. Connect Gmail</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('screenshot')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'screenshot'
                      ? 'bg-white text-[#047857] shadow-xs border-b-2 border-[#059669]'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 text-[#059669]" />
                  <span>2. Screenshot (OCR)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('paste')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'paste'
                      ? 'bg-white text-[#047857] shadow-xs border-b-2 border-[#059669]'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-[#059669]" />
                  <span>3. Paste Text</span>
                </button>
              </div>

              {/* ACTIVE TAB PANEL */}
              <div>
                {activeTab === 'gmail' && (
                  <GmailIntakeTab
                    onAnalyzeEmail={handleExecuteAnalysis}
                    isAnalyzing={isAnalyzing}
                    onSwitchTab={(tab) => setActiveTab(tab)}
                  />
                )}

                {activeTab === 'screenshot' && (
                  <ScreenshotIntakeTab
                    onAnalyzeText={handleAnalyzeScreenshotText}
                    isAnalyzing={isAnalyzing}
                  />
                )}

                {activeTab === 'paste' && (
                  <PasteTextIntakeTab
                    onAnalyze={handleExecuteAnalysis}
                    isAnalyzing={isAnalyzing}
                  />
                )}
              </div>
            </div>

            {/* VERDICT & FORENSICS RESULT */}
            <div ref={resultRef}>
              {analysisResult && (
                <ForensicsResultView
                  result={analysisResult}
                  onReset={() => setAnalysisResult(null)}
                />
              )}
            </div>

            {/* FREQUENTLY ASKED QUESTIONS & INTAKE HOW-TO GUIDES */}
            <FaqSection
              onSwitchTab={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </>
        )}

        {/* TEST SUITE VIEW */}
        {activeView === 'testsuite' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Automated Python Test Suite</h2>
                <p className="text-xs text-slate-500">
                  Runs unit and integration tests verifying DNS resolution, spoof heuristic weighting, and MIME parsing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('analyzer')}
                className="text-xs text-[#059669] hover:text-[#047857] font-bold underline cursor-pointer"
              >
                Back to Analyzer
              </button>
            </div>
            <TestSuiteTab />
          </div>
        )}

        {/* HISTORY LOG VIEW */}
        {activeView === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Forensic Audit History</h2>
                <p className="text-xs text-slate-500">
                  Audit log of recently analyzed emails and threat assessment scores.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('analyzer')}
                className="text-xs text-[#059669] hover:text-[#047857] font-bold underline cursor-pointer"
              >
                Back to Analyzer
              </button>
            </div>
            <HistoryLogTable
              history={history}
              loading={false}
              onRefresh={fetchHistory}
              onSelectRecord={details => {
                if (details) {
                  setAnalysisResult(details);
                  setActiveView('analyzer');
                  setTimeout(() => {
                    resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }
              }}
            />
          </div>
        )}

        {/* DETECTION ARCHITECTURE SPECS VIEW */}
        {activeView === 'specs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Detection Engine Architecture</h2>
                <p className="text-xs text-slate-500">
                  Review the Python SpoofDetector algorithms, regular expressions, and weighted scoring models.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('analyzer')}
                className="text-xs text-[#059669] hover:text-[#047857] font-bold underline cursor-pointer"
              >
                Back to Analyzer
              </button>
            </div>
            <SourceCodeViewer />
          </div>
        )}
      </main>

      {/* 3. FOOTER */}
      <footer className="border-t border-[#e8ded3] bg-stone-50/60 py-5 text-center text-xs text-stone-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-700">SpoofSentry</span>
            <span>&bull;</span>
            <span>Email Authentication &amp; Phishing Forensics</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-600 hover:text-[#059669] transition-colors underline"
            >
              Privacy Policy
            </a>
            <span>&bull;</span>
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-600 hover:text-[#059669] transition-colors underline"
            >
              Terms of Service
            </a>
            <span>&bull;</span>
            <span className="text-stone-400">Ephemeral In-Memory Scanning</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
