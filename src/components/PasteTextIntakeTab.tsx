import React, { useState } from 'react';
import { ChevronDown, ChevronUp, RefreshCw, AlertCircle, HelpCircle, Sparkles, Sliders, CheckCircle2, ShieldAlert } from 'lucide-react';
import { validateEmailInput } from '../utils/emailValidator';

interface PasteTextIntakeTabProps {
  onAnalyze: (data: {
    from: string;
    return_path?: string;
    dkim_header?: string;
    date?: string;
    subject?: string;
    body?: string;
    source: 'raw-paste' | 'manual';
    headersUnavailable?: boolean;
  }) => Promise<void>;
  isAnalyzing: boolean;
}

const RAW_SAMPLES = {
  legit: {
    label: '🟢 Google Security Notice',
    desc: 'Legitimate authenticated alert',
    raw: `From: "Google Security" <no-reply@accounts.google.com>
Return-Path: <no-reply@accounts.google.com>
Date: Mon, 31 Aug 2026 14:30:00 +0000
Subject: Security review for your account
DKIM-Signature: v=1; a=rsa-sha256; d=accounts.google.com; s=20230601; c=relaxed/relaxed

A new sign-in on your Google Account was detected on an authorized Windows session in Mumbai. If this was you, no action is needed.`
  },
  spoof: {
    label: '🔴 Wire Transfer Scam',
    desc: 'Urgent CFO spoof with IP link',
    raw: `From: "Wire Transfer Dept" <finance@examplecorp.com>
Return-Path: <bounce@random-phishing-site42.net>
Date: Mon, 31 Aug 2026 03:15:00 +0000
Subject: Urgent: Wire Transfer Approval Needed

Please process the wire transfer immediately. Confirm the bank routing number and account details within 24 hours. Failure to comply will result in delayed payment. Verify at http://185.23.11.9/confirm`
  },
  paypal: {
    label: '🟡 PayPal Limited Notice',
    desc: 'Account suspension phishing hook',
    raw: `From: "PayPal Security" <security@paypal.com>
Return-Path: <bounce@random-phishing-site42.net>
Date: Mon, 31 Aug 2026 02:47:00 +0000
Subject: Your account has been limited

We noticed unusual activity. Please confirm your billing details and payment method immediately within 24 hours or your account will be suspended. Click here to verify now.`
  }
};

export function parseRawEmail(raw: string) {
  const fromMatch = raw.match(/^From:\s*(.+)$/im);
  const rpMatch = raw.match(/^Return-Path:\s*(.+)$/im);
  const dkimMatch = raw.match(/^DKIM-Signature:\s*(.+)$/im);
  const dateMatch = raw.match(/^Date:\s*(.+)$/im);
  const subjectMatch = raw.match(/^Subject:\s*(.+)$/im);

  const headerBlockEnd = raw.search(/\n\s*\n/);
  const body = headerBlockEnd !== -1 ? raw.slice(headerBlockEnd).trim() : raw.trim();
  const noHeadersFound = !fromMatch && !rpMatch && !dkimMatch;

  let looseFrom = '';
  if (noHeadersFound) {
    const looseMatch = raw.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (looseMatch) looseFrom = looseMatch[0];
  }

  return {
    from: fromMatch ? fromMatch[1].trim() : looseFrom,
    return_path: rpMatch ? rpMatch[1].trim() : '',
    dkim: dkimMatch ? dkimMatch[1].trim() : '',
    date: dateMatch ? dateMatch[1].trim() : '',
    subject: subjectMatch ? subjectMatch[1].trim() : '',
    body: body,
    headersFound: !noHeadersFound
  };
}

export const PasteTextIntakeTab: React.FC<PasteTextIntakeTabProps> = ({ onAnalyze, isAnalyzing }) => {
  const [rawText, setRawText] = useState<string>('');
  const [showHowto, setShowHowto] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Advanced individual fields
  const [advFrom, setAdvFrom] = useState('');
  const [advReturnPath, setAdvReturnPath] = useState('');
  const [advDkim, setAdvDkim] = useState('');
  const [advDate, setAdvDate] = useState('');
  const [advSubject, setAdvSubject] = useState('');
  const [advBody, setAdvBody] = useState('');

  const loadRawSample = (type: keyof typeof RAW_SAMPLES) => {
    setRawText(RAW_SAMPLES[type].raw);
    setError(null);
  };

  const handleAnalyzeRaw = async () => {
    if (!rawText.trim()) {
      setError('Please paste an email or select a sample preset first.');
      return;
    }

    // Strict validation: check if pasted text is source code or non-email
    const validation = validateEmailInput({ text: rawText });
    if (!validation.isEmail) {
      setError(`This is not an email. ${validation.reason} SpoofSentry only evaluates email messages and RFC-822 headers. Programming code or non-email text cannot be evaluated.`);
      return;
    }

    const parsed = parseRawEmail(rawText);
    if (!parsed.from) {
      setError('Could not identify a sender email address in the text. Try copying the From header or using the Advanced fields below.');
      return;
    }

    setError(null);
    await onAnalyze({
      from: parsed.from,
      return_path: parsed.return_path,
      dkim_header: parsed.dkim,
      date: parsed.date,
      subject: parsed.subject,
      body: parsed.body,
      source: 'raw-paste',
      headersUnavailable: !parsed.headersFound
    });
  };

  const handleAnalyzeManual = async () => {
    if (!advFrom.trim()) {
      setError('Please provide at least the From Header address.');
      return;
    }

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    if (!emailRegex.test(advFrom.trim())) {
      setError('Please provide a valid sender email address (e.g. name@domain.com). Code variables or line numbers are not valid sender addresses.');
      return;
    }

    const validation = validateEmailInput({
      from: advFrom,
      subject: advSubject,
      body: advBody,
      text: [advFrom, advSubject, advBody].join('\n')
    });

    if (!validation.isEmail) {
      setError(`This is not an email. ${validation.reason} Only email messages can be analyzed.`);
      return;
    }

    setError(null);
    await onAnalyze({
      from: advFrom.trim(),
      return_path: advReturnPath.trim(),
      dkim_header: advDkim.trim(),
      date: advDate.trim(),
      subject: advSubject.trim(),
      body: advBody.trim(),
      source: 'manual',
      headersUnavailable: false
    });
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Sample Presets */}
      <div className="space-y-1.5">
        <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Load instant sample:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {(Object.keys(RAW_SAMPLES) as (keyof typeof RAW_SAMPLES)[]).map(key => (
            <button
              key={key}
              type="button"
              onClick={() => loadRawSample(key)}
              className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg text-left transition-all shadow-xs cursor-pointer"
            >
              <div className="text-xs font-bold text-slate-800">{RAW_SAMPLES[key].label}</div>
              <div className="text-[10px] text-slate-500">{RAW_SAMPLES[key].desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Text Area */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700">Paste Full Email Content</label>
          <button
            type="button"
            onClick={() => setShowHowto(!showHowto)}
            className="text-[11px] text-[#059669] hover:text-[#047857] font-bold flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3 h-3 text-[#059669]" />
            <span>How to get full email headers</span>
          </button>
        </div>

        <textarea
          value={rawText}
          onChange={e => setRawText(e.target.value)}
          placeholder="Paste raw email message here (including headers like 'From:', 'Return-Path:', 'Date:', or standard body text)..."
          className="w-full min-h-[160px] bg-stone-50/60 border border-stone-200 text-stone-800 p-3 text-xs font-mono rounded-lg focus:outline-none focus:ring-1 focus:ring-[#059669] focus:bg-white resize-y"
        />
      </div>

      {/* Guide Accordion */}
      {showHowto && (
        <div className="p-4 bg-[#fff8f2] border border-[#fed7aa] rounded-xl text-xs text-stone-700 space-y-2 leading-relaxed">
          <div className="font-bold text-[#9a3412] pb-1 border-b border-[#fed7aa]/60">
            How to export raw email headers:
          </div>
          <div>
            <strong>Gmail:</strong> Open message → click ⋮ (More) on the right → click <strong>"Show original"</strong> → copy all text.
          </div>
          <div>
            <strong>Outlook:</strong> Open email → File → Properties → copy the box titled <strong>"Internet headers"</strong>.
          </div>
          <div>
            <strong>Apple Mail:</strong> View → Message → <strong>"All Headers"</strong> or "Raw Source".
          </div>
          <div className="text-[11px] text-stone-500 pt-1 border-t border-[#fed7aa]/60">
            💡 If you only have visible email text without headers, simply paste it — content threats and link risks will still be evaluated!
          </div>
        </div>
      )}

      {/* Execute Analysis Button */}
      <button
        type="button"
        onClick={handleAnalyzeRaw}
        disabled={isAnalyzing}
        className="w-full py-2.5 bg-[#059669] hover:bg-[#047857] disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
      >
        {isAnalyzing ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Scanning Message Signatures...</span>
          </>
        ) : (
          <span>Run Email Forensics</span>
        )}
      </button>

      {/* Advanced Granular Fields Toggle */}
      <div className="pt-2 border-t border-slate-200">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-between text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>Advanced: Enter Individual Technical Headers</span>
          </span>
          {showAdvanced ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {showAdvanced && (
          <div className="mt-2.5 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">From Header Address</label>
              <input
                type="text"
                value={advFrom}
                onChange={e => setAdvFrom(e.target.value)}
                placeholder='"Google Security" <no-reply@accounts.google.com>'
                className="w-full bg-white border border-slate-200 p-2 text-xs font-mono rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Return-Path (Envelope Sender)</label>
              <input
                type="text"
                value={advReturnPath}
                onChange={e => setAdvReturnPath(e.target.value)}
                placeholder="<bounce-handler@accounts.google.com>"
                className="w-full bg-white border border-slate-200 p-2 text-xs font-mono rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">DKIM-Signature Header</label>
              <textarea
                value={advDkim}
                onChange={e => setAdvDkim(e.target.value)}
                placeholder="v=1; a=rsa-sha256; d=accounts.google.com; s=20230601; ..."
                className="w-full min-h-[60px] bg-white border border-slate-200 p-2 text-xs font-mono rounded-lg text-slate-800 resize-y"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Date Header</label>
              <input
                type="text"
                value={advDate}
                onChange={e => setAdvDate(e.target.value)}
                placeholder="Mon, 31 Aug 2026 14:30:00 +0000"
                className="w-full bg-white border border-slate-200 p-2 text-xs font-mono rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Subject Line</label>
              <input
                type="text"
                value={advSubject}
                onChange={e => setAdvSubject(e.target.value)}
                placeholder="Security review for your account"
                className="w-full bg-white border border-slate-200 p-2 text-xs font-mono rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Message Body</label>
              <textarea
                value={advBody}
                onChange={e => setAdvBody(e.target.value)}
                placeholder="Paste the plain-text message contents..."
                className="w-full min-h-[70px] bg-white border border-slate-200 p-2 text-xs font-mono rounded-lg text-slate-800 resize-y"
              />
            </div>

            <button
              type="button"
              onClick={handleAnalyzeManual}
              disabled={isAnalyzing}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Analyze Custom Headers
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
