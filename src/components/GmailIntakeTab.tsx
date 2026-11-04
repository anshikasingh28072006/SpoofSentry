import React, { useState, useEffect, useMemo } from 'react';
import {
  Mail,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  Search,
  LogOut,
  Info,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Archive,
  AlertOctagon,
  Calendar,
  Layers,
  Shield,
  ShieldAlert,
  X,
  Copy,
  Check,
  FileText,
  Camera
} from 'lucide-react';
import {
  signInWithGoogle,
  signOutGoogle,
  fetchLiveGmailInbox,
  getCachedAccessToken,
  ParsedGmailMessage,
  GmailInboxResult,
  initAuthListener
} from '../lib/firebaseAuth';
import { AnalysisResponse } from '../types';
import {
  INBOX_FILTER_PRESETS
} from '../data/demoEmails';

interface GmailIntakeTabProps {
  onAnalyzeEmail: (params: {
    from: string;
    return_path: string;
    dkim_header: string;
    date: string;
    subject: string;
    body: string;
    source: 'gmail';
    gmail_metadata?: {
      id: string;
      snippet: string;
      receivedAt: string;
    };
  }) => Promise<void>;
  isAnalyzing: boolean;
  analysisResult?: AnalysisResponse | null;
  onSwitchTab?: (tab: 'screenshot' | 'paste') => void;
  onScrollToResult?: () => void;
}

export const GmailIntakeTab: React.FC<GmailIntakeTabProps> = ({
  onAnalyzeEmail,
  isAnalyzing,
  analysisResult,
  onSwitchTab,
  onScrollToResult
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userPhoto, setUserPhoto] = useState<string>('');
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Live messages & pagination state
  const [liveMessages, setLiveMessages] = useState<ParsedGmailMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('in:inbox');
  const [analyzingMessageId, setAnalyzingMessageId] = useState<string | null>(null);

  // Pagination tokens & state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [tokenHistory, setTokenHistory] = useState<string[]>(['']); // index 0 is page 1
  const [resultSizeEstimate, setResultSizeEstimate] = useState<number | null>(null);

  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [popupNotice, setPopupNotice] = useState<boolean>(false);
  const [closedPopupNotice, setClosedPopupNotice] = useState<boolean>(false);
  const [unauthorizedDomainNotice, setUnauthorizedDomainNotice] = useState<boolean>(false);
  const [unauthorizedDomainName, setUnauthorizedDomainName] = useState<string>('');
  const [showHowTo, setShowHowTo] = useState<boolean>(false);
  const [showQueryTips, setShowQueryTips] = useState<boolean>(false);
  const [showVerificationModal, setShowVerificationModal] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Initialize Auth state listener
  useEffect(() => {
    initAuthListener(
      (user, token) => {
        if (user && token) {
          setIsConnected(true);
          setUserEmail(user.email || '');
          setUserName(user.displayName || '');
          setUserPhoto(user.photoURL || '');
          setAccessToken(token);
          loadLiveMessages(token, 'in:inbox', undefined, 1, 10);
        }
      },
      () => {
        // Not authenticated
      }
    );
  }, []);

  /**
   * Load messages from Gmail API with support for pagination token and page tracking
   */
  const loadLiveMessages = async (
    token: string,
    query: string,
    targetPageToken?: string,
    targetPage: number = 1,
    sizeOverride?: number
  ) => {
    setIsLoadingMessages(true);
    setError(null);
    const effectivePageSize = sizeOverride ?? pageSize;
    try {
      const result: GmailInboxResult = await fetchLiveGmailInbox(token, effectivePageSize, query, targetPageToken);
      setLiveMessages(result.messages);
      setNextPageToken(result.nextPageToken);
      setResultSizeEstimate(result.resultSizeEstimate ?? null);
      setCurrentPage(targetPage);

      if (result.messages.length === 0) {
        setError(`No messages found matching "${query}". Try searching "label:all" or clearing filters.`);
      }
    } catch (err: any) {
      console.error('Failed to load Gmail messages:', err);
      setError(`Failed to read Gmail messages: ${err.message || err}`);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  /**
   * Pagination: Go to next page
   */
  const handleNextPage = () => {
    if (!accessToken || !nextPageToken) return;
    const nextPage = currentPage + 1;
    // Push new token to history
    const updatedHistory = [...tokenHistory];
    updatedHistory[currentPage] = nextPageToken;
    setTokenHistory(updatedHistory);

    loadLiveMessages(accessToken, searchQuery, nextPageToken, nextPage, pageSize);
  };

  /**
   * Pagination: Go to previous page
   */
  const handlePreviousPage = () => {
    if (!accessToken || currentPage <= 1) return;
    const prevPage = currentPage - 1;
    const prevToken = tokenHistory[prevPage - 1] || undefined;

    loadLiveMessages(accessToken, searchQuery, prevToken, prevPage, pageSize);
  };

  /**
   * Handle filter preset button clicks
   */
  const handleApplyPreset = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    setTokenHistory(['']);

    if (accessToken) {
      loadLiveMessages(accessToken, query, undefined, 1, pageSize);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
    setTokenHistory(['']);
    if (accessToken) {
      loadLiveMessages(accessToken, searchQuery, undefined, 1, newSize);
    }
  };

  const handleLiveGoogleSignIn = async () => {
    setIsLoggingIn(true);
    setError(null);
    setPopupNotice(false);
    setClosedPopupNotice(false);
    setUnauthorizedDomainNotice(false);

    try {
      const result = await signInWithGoogle();
      if (result) {
        setIsConnected(true);
        setUserEmail(result.user.email || '');
        setUserName(result.user.displayName || '');
        setUserPhoto(result.user.photoURL || '');
        setAccessToken(result.accessToken);
        setCurrentPage(1);
        setTokenHistory(['']);
        await loadLiveMessages(result.accessToken, searchQuery, undefined, 1, pageSize);
      } else {
        // User closed or dismissed the popup
        setClosedPopupNotice(true);
      }
    } catch (err: any) {
      const isUserDismissal =
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request' ||
        err?.message?.includes('popup-closed-by-user') ||
        err?.message?.includes('cancelled-popup-request');

      if (isUserDismissal) {
        setClosedPopupNotice(true);
        return;
      }

      if (
        err?.code === 'auth/unauthorized-domain' ||
        err?.message?.includes('unauthorized-domain')
      ) {
        setUnauthorizedDomainNotice(true);
        setUnauthorizedDomainName(window.location.hostname || 'spoofsentry.vercel.app');
        return;
      }

      if (
        err.code === 'auth/popup-blocked' ||
        err.message?.includes('popup') ||
        err.message?.includes('window')
      ) {
        setPopupNotice(true);
        setError('Browser blocked the sign-in popup window. Please allow popups or use Screenshot / Paste Text analysis.');
      } else {
        console.error('Live Google sign-in failed:', err);
        setError(err.message || 'Google sign-in could not be completed.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutGoogle();
    } catch {
      // silent
    }
    setIsConnected(false);
    setUserEmail('');
    setUserName('');
    setUserPhoto('');
    setAccessToken(null);
    setLiveMessages([]);
    setCurrentPage(1);
    setTokenHistory(['']);
    setNextPageToken(undefined);
    setError(null);
    setPopupNotice(false);
    setClosedPopupNotice(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setTokenHistory(['']);
    if (accessToken) {
      loadLiveMessages(accessToken, searchQuery, undefined, 1, pageSize);
    }
  };

  const handleAnalyzeLiveMessage = async (msg: ParsedGmailMessage) => {
    setAnalyzingMessageId(msg.id);
    setError(null);

    try {
      await onAnalyzeEmail({
        from: msg.from,
        return_path: msg.returnPath,
        dkim_header: msg.dkimHeader,
        date: msg.date,
        subject: msg.subject,
        body: msg.body,
        source: 'gmail',
        gmail_metadata: {
          id: msg.id,
          snippet: msg.snippet,
          receivedAt: msg.date
        }
      });
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(`Failed to analyze email: ${err.message || err}`);
    } finally {
      setAnalyzingMessageId(null);
    }
  };

  // Common UI helper for Page Size Selector ("Show: 10 15 25 50")
  const renderPageSizeSelector = () => (
    <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-xl text-xs shadow-2xs">
      <span className="text-slate-500 font-medium text-xs select-none">Show:</span>
      <div className="inline-flex items-center gap-1">
        {[10, 15, 25, 50].map(size => (
          <button
            key={size}
            type="button"
            onClick={() => handlePageSizeChange(size)}
            className={`px-2.5 py-0.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
              pageSize === size
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title={`Show ${size} emails per page`}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Pop-up blocked notice */}
      {popupNotice && (
        <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl space-y-2">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs leading-relaxed">
              <div className="font-bold text-slate-900 text-sm">
                Browser Blocked Google Sign-in Popup
              </div>
              <p>
                When running inside an iframe (like the AI Studio preview pane), browser security policies restrict third-party authentication popups.
              </p>
              <div className="pt-1.5 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleLiveGoogleSignIn}
                  className="px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try Sign-In Again</span>
                </button>
                {onSwitchTab && (
                  <button
                    type="button"
                    onClick={() => onSwitchTab('screenshot')}
                    className="px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#059669]" />
                    <span>Analyze via Screenshot (No Sign-In Needed)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unauthorized Domain (e.g. Vercel deployment) Helper */}
      {unauthorizedDomainNotice && (
        <div className="p-4 bg-rose-50 border border-rose-300 text-rose-950 rounded-xl space-y-3 shadow-xs">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-2 text-xs flex-1">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 text-sm">
                  Firebase Error: Unauthorized Domain ({unauthorizedDomainName || 'spoofsentry.vercel.app'})
                </span>
                <button
                  type="button"
                  onClick={() => setUnauthorizedDomainNotice(false)}
                  className="text-stone-400 hover:text-stone-700 cursor-pointer p-0.5 rounded"
                  title="Dismiss notice"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-stone-700 leading-relaxed text-xs">
                Firebase Authentication blocks logins from any new domain until you register it in your Firebase project. To enable Google Sign-In on <strong className="text-slate-900">{unauthorizedDomainName || 'spoofsentry.vercel.app'}</strong> in 1 minute:
              </p>

              <div className="bg-white/95 p-3 rounded-lg border border-rose-200 space-y-2 text-xs text-stone-800">
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span>How to authorize this domain in Firebase Console:</span>
                  <a
                    href="https://console.firebase.google.com/project/gen-lang-client-0209555847/authentication/settings"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#059669] hover:text-[#047857] font-bold underline cursor-pointer"
                  >
                    Open Firebase Auth Settings ↗
                  </a>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-stone-700 text-[11px]">
                  <li>
                    Go to <a href="https://console.firebase.google.com/project/gen-lang-client-0209555847/authentication/settings" target="_blank" rel="noopener noreferrer" className="text-[#059669] underline font-bold">Firebase Console &gt; Authentication &gt; Settings</a>.
                  </li>
                  <li>Click the <strong>"Authorized domains"</strong> tab (under Sign-in method / Settings).</li>
                  <li>Click <strong>"Add domain"</strong>.</li>
                  <li>
                    Enter <code className="bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200 font-mono font-semibold text-rose-700">{unauthorizedDomainName || 'spoofsentry.vercel.app'}</code> (and also <code className="bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200 font-mono text-stone-700">vercel.app</code>) and click <strong>Add</strong>.
                  </li>
                </ol>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleLiveGoogleSignIn}
                  className="px-3.5 py-1.5 bg-[#059669] hover:bg-[#047857] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try Sign-In Again</span>
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(unauthorizedDomainName || 'spoofsentry.vercel.app', 'domain')}
                  className="px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>{copiedField === 'domain' ? 'Copied Domain!' : 'Copy Domain Name'}</span>
                </button>
                {onSwitchTab && (
                  <button
                    type="button"
                    onClick={() => onSwitchTab('screenshot')}
                    className="px-3.5 py-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#059669]" />
                    <span>Use Screenshot Intake (Zero Setup)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Closed Popup / Unverified Warning Helper */}
      {closedPopupNotice && (
        <div className="p-4 bg-[#fff8f2] border border-[#fed7aa] text-[#9a3412] rounded-xl space-y-3 shadow-xs">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-[#ea580c] shrink-0 mt-0.5" />
            <div className="space-y-2 text-xs flex-1">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-stone-900 text-sm">
                  Google Sign-In Window Closed
                </span>
                <button
                  type="button"
                  onClick={() => setClosedPopupNotice(false)}
                  className="text-stone-400 hover:text-stone-700 cursor-pointer p-0.5 rounded"
                  title="Dismiss notice"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-stone-700 leading-relaxed text-xs">
                Did you close the window because Google displayed the <strong>"Google hasn't verified this app"</strong> screen?
                During testing, Google shows this warning for apps requesting read-only Gmail access (<code className="font-mono text-[11px] bg-[#ffedd5] px-1 py-0.5 rounded text-[#9a3412]">gmail.readonly</code>).
              </p>

              <div className="bg-white/90 p-3 rounded-lg border border-[#fed7aa] space-y-1.5 text-xs text-stone-800">
                <div className="font-bold text-stone-900 flex items-center justify-between">
                  <span>How to sign in right now in 2 clicks:</span>
                  <button
                    type="button"
                    onClick={() => setShowVerificationModal(true)}
                    className="text-[11px] text-[#059669] hover:text-[#047857] font-bold underline cursor-pointer"
                  >
                    Verification Guide →
                  </button>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-stone-700 text-[11px]">
                  <li>Click <span className="font-bold text-[#047857]">"Try Sign-In Again"</span> below to re-open Google's window.</li>
                  <li>On the warning screen, click <span className="font-bold text-[#047857] underline">"Advanced"</span> in the bottom-left corner.</li>
                  <li>Click <span className="font-bold text-rose-700">"Go to SpoofSentry (unsafe)"</span> and click <span className="font-bold text-emerald-700">"Continue"</span>.</li>
                </ol>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleLiveGoogleSignIn}
                  className="px-3.5 py-1.5 bg-[#059669] hover:bg-[#047857] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try Sign-In Again</span>
                </button>
                {onSwitchTab && (
                  <>
                    <button
                      type="button"
                      onClick={() => onSwitchTab('screenshot')}
                      className="px-3.5 py-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#059669]" />
                      <span>Use Screenshot Intake (Zero Login)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSwitchTab('paste')}
                      className="px-3.5 py-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Paste Raw Headers / EML (Zero Login)</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {error && !popupNotice && !closedPopupNotice && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STATE 1: NOT CONNECTED -> Connection Portal                   */}
      {/* ------------------------------------------------------------- */}
      {!isConnected ? (
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-6">
          <div className="text-center space-y-1.5 max-w-lg mx-auto">
            <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mx-auto shadow-xs text-rose-600">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              Connect Gmail &amp; Access Your Inbox
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              SpoofSentry uses Google-verified read-only access (<code className="text-slate-700 font-mono text-[11px]">gmail.readonly</code>) to evaluate email authenticity, SPF, DKIM records, and social engineering red flags. We never send, edit, or delete any messages.
            </p>
          </div>

          {/* Connection Actions Box */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4 max-w-md mx-auto">
            <div className="space-y-3">
              {/* Live Google Sign-In */}
              <button
                type="button"
                id="sign-in-google-button"
                onClick={handleLiveGoogleSignIn}
                disabled={isLoggingIn}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-3 transition-all cursor-pointer"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#059669]" />
                    <span>Connecting to Google Account...</span>
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 48 48">
                      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34 6.5 29.3 4.5 24 4.5 13.5 4.5 5 13 5 23.5S13.5 42.5 24 42.5 43 34 43 23.5c0-1-.1-2-.4-3z"/>
                      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34 6.5 29.3 4.5 24 4.5c-7.7 0-14.4 4.4-17.7 10.2z"/>
                      <path fill="#4CAF50" d="M24 42.5c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 33.5 26.8 34.5 24 34.5c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 38 16.2 42.5 24 42.5z"/>
                      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.2 5.2C40.9 36 43 30.4 43 23.5c0-1-.1-2-.4-3z"/>
                    </svg>
                    <span>Sign in with Google (Live Inbox)</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick helper tip */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#059669]" />
                <span>Read-only permissions</span>
              </span>
              <span className="text-[11px] text-stone-500 flex items-center gap-1 font-medium">
                Ephemeral in-memory scan
              </span>
            </div>
          </div>

          {/* ZERO-SIGN-IN ALTERNATIVES CARD: No one has to hesitate */}
          <div className="max-w-xl mx-auto p-4 bg-white border border-[#e8ded3] rounded-xl space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#059669]" />
                <h4 className="text-xs font-bold text-stone-900">
                  Don't want to sign in with Google? Analyze without connecting:
                </h4>
              </div>
              <span className="text-[10px] font-bold text-[#047857] bg-[#e8fbf3] px-2 py-0.5 rounded-full border border-[#a7f3d0]">
                100% Private
              </span>
            </div>

            <p className="text-[11px] text-stone-500 leading-relaxed">
              If you or your users prefer not to grant Google account access, SpoofSentry offers two instant zero-permission methods:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => onSwitchTab ? onSwitchTab('screenshot') : null}
                className="p-3 rounded-lg border border-stone-200 hover:border-[#10b981] bg-[#fbf9f6] hover:bg-[#e8fbf3]/60 text-left transition-all cursor-pointer group space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-stone-800 group-hover:text-[#047857]">
                    <Camera className="w-3.5 h-3.5 text-[#059669]" />
                    <span>Upload Screenshot</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-stone-400 group-hover:text-[#059669] transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-[11px] text-stone-500 line-clamp-2">
                  Snap or paste an email screenshot. Gemini AI extracts headers, sender, and links with zero account access.
                </p>
              </button>

              <button
                type="button"
                onClick={() => onSwitchTab ? onSwitchTab('paste') : null}
                className="p-3 rounded-lg border border-stone-200 hover:border-[#10b981] bg-[#fbf9f6] hover:bg-[#e8fbf3]/60 text-left transition-all cursor-pointer group space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-stone-800 group-hover:text-[#047857]">
                    <FileText className="w-3.5 h-3.5 text-[#059669]" />
                    <span>Paste Raw Headers / EML</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-stone-400 group-hover:text-[#059669] transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-[11px] text-stone-500 line-clamp-2">
                  Paste raw MIME headers or drag an .eml file directly. Instant DNS verification without any login.
                </p>
              </button>
            </div>
          </div>

          {/* Expandable Step-by-Step Guide */}
          <div className="max-w-lg mx-auto">
            <button
              type="button"
              onClick={() => setShowHowTo(!showHowTo)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 mx-auto font-medium cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>How does Gmail connection work?</span>
            </button>

            {showHowTo && (
              <div className="mt-3 p-4 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 space-y-2 leading-relaxed">
                <div className="font-bold text-slate-800 pb-1 border-b border-slate-100">
                  How SpoofSentry Accesses Gmail:
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                  <span><strong>OAuth Permission:</strong> Google displays an authorization prompt asking for read-only email access.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                  <span><strong>Inbox Fetching &amp; Pagination:</strong> The app lists messages from your inbox, with full page navigation and date filters to browse all the way to the end of your inbox.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                  <span><strong>Instant Threat Scan:</strong> You choose which email to analyze, and SpoofSentry inspects SPF, DKIM, and DMARC alignment via live DNS queries.</span>
                </div>
              </div>
            )}
          </div>

          {/* ----------------------------------------------------------- */}
          {/* OFFICIAL GOOGLE VERIFICATION MODAL                         */}
          {/* ----------------------------------------------------------- */}
          {showVerificationModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8 border border-slate-200">
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#e8fbf3] border border-[#a7f3d0] flex items-center justify-center text-[#047857]">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-stone-900">
                        Official Google Cloud Verification Guide
                      </h3>
                      <p className="text-xs text-stone-500">
                        How to permanently remove the "Google hasn't verified this app" screen
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowVerificationModal(false)}
                    className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 text-xs text-stone-700 leading-relaxed max-h-[70vh] overflow-y-auto pr-1">
                  {/* Immediate Fix: Add Test Users */}
                  <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2">
                    <div className="font-bold text-blue-950 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      <span>Phase 1: Immediate Sign-In for Your Team &amp; Testers (Takes 1 Minute)</span>
                    </div>
                    <p className="text-[11px] text-blue-900">
                      While your app is in "Testing" mode, Google blocks accounts that are not registered in your project's Test Users list. To allow anyone to test:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] text-blue-950 font-medium pl-1">
                      <li>Go to <a href="https://console.cloud.google.com/apis/credentials/consent" target="_blank" rel="noopener noreferrer" className="text-[#059669] underline font-bold">Google Cloud Console &gt; OAuth consent screen</a></li>
                      <li>Scroll down to the <strong>"Test users"</strong> section.</li>
                      <li>Click <strong>"+ ADD USERS"</strong> and enter <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-mono">anshika8422@gmail.com</code> (and any coworker emails).</li>
                      <li>Click <strong>Save</strong>. Those users can now sign in using the "Advanced &gt; Go to SpoofSentry (unsafe)" bypass!</li>
                    </ol>
                  </div>

                  {/* Permanent Fix: Official Verification */}
                  <div className="space-y-3 pt-1">
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>Phase 2: Permanent Public Verification by Google Trust &amp; Safety</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      To eliminate the "Google hasn't verified this app" warning completely so that <em>any person in the world</em> can sign in without seeing any warning:
                    </p>

                    <div className="space-y-2.5">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                        <span className="font-bold text-slate-900">1. App Information &amp; Branding</span>
                        <p className="text-slate-600 text-[11px]">
                          In the OAuth consent screen, set:
                        </p>
                        <ul className="list-disc list-inside text-[11px] text-slate-600 pl-2 space-y-0.5">
                          <li><strong>App Name:</strong> SpoofSentry</li>
                          <li><strong>User support email:</strong> anshika8422@gmail.com</li>
                          <li><strong>Developer contact email:</strong> anshika8422@gmail.com</li>
                        </ul>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                        <span className="font-bold text-slate-900">2. Privacy Policy &amp; Terms of Service Links</span>
                        <p className="text-slate-600 text-[11px]">
                          Google requires public URLs for your Privacy Policy and Terms of Service. They must state that user email data is only used ephemerally to evaluate spoofing and is never shared, stored, or sold.
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">3. Scope Justification (Copy &amp; Paste to Google)</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(
                              "SpoofSentry uses the https://www.googleapis.com/auth/gmail.readonly scope exclusively to inspect incoming email MIME headers (SPF, DKIM signatures, and DMARC alignment) and content patterns to detect email spoofing and phishing attacks for user defense. Email messages are processed in-memory in the user's browser session, and are never saved to a database, sold, or shared with third parties.",
                              'justification'
                            )}
                            className="text-[11px] text-[#059669] hover:text-[#047857] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            {copiedField === 'justification' ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-600">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Text</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="p-2.5 bg-white border border-slate-200 rounded-lg font-mono text-[11px] text-slate-700 leading-relaxed">
                          "SpoofSentry uses the https://www.googleapis.com/auth/gmail.readonly scope exclusively to inspect incoming email MIME headers (SPF, DKIM signatures, and DMARC alignment) and content patterns to detect email spoofing and phishing attacks for user defense. Email messages are processed in-memory in the user's browser session, and are never saved to a database, sold, or shared with third parties."
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                        <span className="font-bold text-slate-900">4. 1-Minute Demonstration Video</span>
                        <p className="text-slate-600 text-[11px]">
                          Record a brief screen video showing:
                        </p>
                        <ul className="list-disc list-inside text-[11px] text-slate-600 pl-2 space-y-0.5">
                          <li>Clicking the "Sign in with Google" button with the OAuth Client ID visible in the URL.</li>
                          <li>Granting permissions on the Google consent screen.</li>
                          <li>Selecting an email and showing the SPF/DKIM security analysis result in SpoofSentry.</li>
                          <li>Upload to YouTube as "Unlisted" and paste the link in Google's verification form.</li>
                        </ul>
                      </div>

                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                        <span className="font-bold text-emerald-900">5. Click "Submit for Verification"</span>
                        <p className="text-emerald-800 text-[11px]">
                          Google's Trust &amp; Safety team usually reviews and approves OAuth verification within 2 to 5 business days. Once approved, the warning screen is permanently removed.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowVerificationModal(false)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Got It, Close Guide
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ------------------------------------------------------------- */
        /* STATE 2: CONNECTED INBOX (Live Gmail)                        */
        /* ------------------------------------------------------------- */
        <div className="space-y-4">
          {/* Active Connection Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="flex items-center gap-3">
              {userPhoto ? (
                <img
                  src={userPhoto}
                  alt={userName || userEmail}
                  className="w-8 h-8 rounded-full border border-slate-300"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#e8fbf3] text-[#047857] font-bold flex items-center justify-center text-xs">
                  {(userEmail[0] || 'G').toUpperCase()}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-slate-900">{userName || userEmail}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200">
                    Live Gmail Connected
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">{userEmail}</div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              {accessToken && (
                <button
                  type="button"
                  onClick={() => loadLiveMessages(accessToken, searchQuery, tokenHistory[currentPage - 1], currentPage)}
                  disabled={isLoadingMessages}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMessages ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleSignOut}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-500" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>

          {/* Quick Date and Depth Filter Shortcuts */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-600 font-semibold px-1">
              <span>Quick Inbox Filters &amp; Depth Navigation:</span>
              <button
                type="button"
                onClick={() => setShowQueryTips(!showQueryTips)}
                className="text-[#059669] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Info className="w-3 h-3" />
                <span>How to jump to oldest emails</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {INBOX_FILTER_PRESETS.map(preset => {
                const isSelected = searchQuery === preset.query;
                const IconComponent = preset.icon;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset.query)}
                    className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                    title={preset.hint}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{preset.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Query Tips Drawer */}
            {showQueryTips && (
              <div className="p-3 bg-[#fff8f2] border border-[#fed7aa] rounded-xl text-xs text-stone-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-[#9a3412]">
                  <Archive className="w-3.5 h-3.5 text-[#ea580c]" />
                  <span>How to reach the very end of large inboxes:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-stone-600">
                  If you have thousands of emails, clicking "Next" hundreds of times is unnecessary! You can jump directly to the oldest messages in your Gmail using native date filters:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                  <div className="bg-white p-2 rounded-md border border-[#fed7aa]/80">
                    <span className="font-bold text-stone-800">before:2024/01/01</span>
                    <p className="text-[10px] text-stone-500 font-sans mt-0.5">Jump directly to emails prior to 2024</p>
                  </div>
                  <div className="bg-white p-2 rounded-md border border-[#fed7aa]/80">
                    <span className="font-bold text-stone-800">older_than:2y</span>
                    <p className="text-[10px] text-stone-500 font-sans mt-0.5">Show emails older than 2 years</p>
                  </div>
                  <div className="bg-white p-2 rounded-md border border-[#fed7aa]/80">
                    <span className="font-bold text-stone-800">from:paypal before:2025/01/01</span>
                    <p className="text-[10px] text-stone-500 font-sans mt-0.5">Target specific sender from previous years</p>
                  </div>
                  <div className="bg-white p-2 rounded-md border border-[#fed7aa]/80">
                    <span className="font-bold text-stone-800">label:all older_than:3y</span>
                    <p className="text-[10px] text-stone-500 font-sans mt-0.5">Browse deep historical archives</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search bar & Page Size Controls */}
          <div className="flex flex-col sm:flex-row gap-2">
            <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search inbox (e.g. in:inbox, older_than:1y, before:2024/01/01)..."
                  className="w-full bg-white border border-slate-200 pl-9 pr-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 shadow-2xs"
                />
              </div>
              <button
                type="submit"
                disabled={isLoadingMessages}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0 shadow-2xs"
              >
                Search
              </button>
            </form>

            {/* Page Size Selector ("Show: 10 15 25 50") */}
            <div className="self-end sm:self-auto shrink-0">
              {renderPageSizeSelector()}
            </div>
          </div>

          {/* TOP VERDICT BANNER (Shows when an email has been analyzed) */}
          {analysisResult && (
            <div className="p-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300 rounded-xl flex flex-wrap items-center justify-between gap-2.5 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-3 h-3 rounded-full ${analysisResult.verdict === 'LEGITIMATE' ? 'bg-emerald-500' : analysisResult.verdict === 'SPOOFED' ? 'bg-rose-500' : 'bg-amber-500'} shrink-0 animate-pulse`} />
                <div className="text-xs">
                  <span className="font-bold text-slate-900">Analysis Complete: </span>
                  <span className={`font-extrabold uppercase px-1.5 py-0.5 rounded ${
                    analysisResult.verdict === 'LEGITIMATE'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : analysisResult.verdict === 'SPOOFED'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {analysisResult.verdict}
                  </span>
                  <span className="text-slate-600 truncate ml-2 hidden sm:inline">
                    ({analysisResult.sender_alignment.from_address})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onScrollToResult}
                className="px-3.5 py-1.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <span>View Full Forensic Report ↓</span>
              </button>
            </div>
          )}

          {/* Top Pagination Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-800">
                Page {currentPage}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-[11px] text-slate-500">
                {resultSizeEstimate
                  ? `Showing ${liveMessages.length} messages (Estimated ~${resultSizeEstimate} total, ${pageSize} per page)`
                  : `Showing ${liveMessages.length} messages (${pageSize} per page)`}
              </span>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                type="button"
                onClick={handlePreviousPage}
                disabled={currentPage <= 1 || isLoadingMessages}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 disabled:opacity-40 border border-slate-300 rounded-lg text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                title="Go to previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <button
                type="button"
                onClick={handleNextPage}
                disabled={!nextPageToken || isLoadingMessages}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 disabled:opacity-40 border border-slate-300 rounded-lg text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                title={nextPageToken ? 'Go to next page' : 'No more messages on this query'}
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* LOADING STATE */}
          {isLoadingMessages && (
            <div className="p-8 text-center bg-white border border-stone-200 rounded-xl space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-[#059669] mx-auto" />
              <div className="text-xs font-bold text-stone-800">Reading Inbox Messages...</div>
              <p className="text-[11px] text-slate-500">
                Fetching MIME headers and message snippets via Google Gmail API.
              </p>
            </div>
          )}

          {/* LIVE MESSAGES LIST */}
          {!isLoadingMessages && (
            <div className="space-y-2.5">
              {liveMessages.length === 0 ? (
                <div className="p-8 text-center bg-white border border-slate-200 rounded-xl space-y-3 text-slate-500 text-xs">
                  <Mail className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="font-semibold text-slate-700">No messages found matching the current filter.</p>
                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('in:inbox')}
                      className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-bold text-xs cursor-pointer"
                    >
                      Reset to Main Inbox
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('label:all')}
                      className="px-3 py-1.5 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg font-bold text-xs cursor-pointer"
                    >
                      View All Mail
                    </button>
                  </div>
                </div>
              ) : (
                liveMessages.map(msg => {
                  const isCurrent = analyzingMessageId === msg.id;
                  const isAnalyzed = analysisResult?.gmail_metadata?.id === msg.id;
                  const verdict = isAnalyzed ? analysisResult.verdict : null;
                  return (
                    <div
                      key={msg.id}
                      className={`p-3.5 bg-white border rounded-xl transition-all shadow-xs hover:shadow-sm space-y-2 ${
                        isAnalyzed
                          ? verdict === 'LEGITIMATE'
                            ? 'border-emerald-400 ring-2 ring-emerald-200/60 bg-emerald-50/10'
                            : verdict === 'SPOOFED'
                            ? 'border-rose-400 ring-2 ring-rose-200/60 bg-rose-50/10'
                            : 'border-amber-400 ring-2 ring-amber-200/60 bg-amber-50/10'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                              {msg.subject}
                            </h4>
                            {isAnalyzed && (
                              <span className={`shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                                verdict === 'LEGITIMATE'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : verdict === 'SPOOFED'
                                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                                  : 'bg-amber-100 text-amber-800 border-amber-300'
                              }`}>
                                {verdict}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-600 truncate">
                            From: <span className="font-mono text-slate-800 font-semibold">{msg.from}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isAnalyzed && onScrollToResult && (
                            <button
                              type="button"
                              onClick={onScrollToResult}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                            >
                              <span>View Verdict ↓</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleAnalyzeLiveMessage(msg)}
                            disabled={isAnalyzing || isCurrent}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs ${
                              isAnalyzed
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                                : 'bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white'
                            }`}
                          >
                            {isCurrent ? (
                              <>
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                <span>Scanning...</span>
                              </>
                            ) : isAnalyzed ? (
                              <>
                                <span>Re-scan</span>
                                <ArrowRight className="w-3 h-3" />
                              </>
                            ) : (
                              <>
                                <span>Analyze Verdict</span>
                                <ArrowRight className="w-3 h-3" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                        {msg.snippet || '(No snippet available)'}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                        <span className="truncate max-w-xs">{msg.date}</span>
                        <span className="font-mono text-[10px]">
                          DKIM: {msg.dkimHeader ? 'Signed' : 'None'} | Return-Path: {msg.returnPath ? 'Present' : 'None'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Bottom Pagination Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-xs text-xs gap-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePreviousPage}
                disabled={currentPage <= 1 || isLoadingMessages}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <span className="text-xs font-bold text-slate-700 px-1">
                Page {currentPage} {nextPageToken ? '(More Available)' : '(End of Results)'}
              </span>

              <button
                type="button"
                onClick={handleNextPage}
                disabled={!nextPageToken || isLoadingMessages}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Also allow changing page size at bottom */}
            <div className="flex items-center gap-2">
              {renderPageSizeSelector()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
