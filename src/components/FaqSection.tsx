import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Camera,
  FileText,
  Mail,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  Shield,
  X,
  Copy,
  Check
} from 'lucide-react';

interface FaqItem {
  id: string;
  category: 'general' | 'screenshot' | 'paste' | 'google';
  question: string;
  answer: React.ReactNode;
}

interface FaqSectionProps {
  onSwitchTab?: (tab: 'gmail' | 'screenshot' | 'paste') => void;
  onOpenVerificationGuide?: () => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({
  onSwitchTab,
  onOpenVerificationGuide
}) => {
  // All FAQ answers closed by default; only opens when clicked
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const [showVerificationModal, setShowVerificationModal] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleOpenGuide = () => {
    if (onOpenVerificationGuide) {
      onOpenVerificationGuide();
    } else {
      setShowVerificationModal(true);
    }
  };

  const faqItems: FaqItem[] = [
    {
      id: 'faq-google-warning',
      category: 'google',
      question: 'Why does Google show "Google hasn\'t verified this app" during sign-in?',
      answer: (
        <div className="space-y-2.5 text-xs leading-relaxed text-stone-700">
          <p>
            Google flags apps requesting read-only mailbox permissions (<code className="font-mono bg-stone-100 text-[#059669] px-1 py-0.5 rounded text-[11px]">gmail.readonly</code>) with a standard safety screen until public third-party assessment is complete.
          </p>

          <div className="bg-[#fff8f2] border border-[#fed7aa] rounded-xl p-3 space-y-1.5 text-[11px] text-stone-800">
            <div className="font-bold text-[#9a3412] flex items-center justify-between">
              <span>Quick 2-click sign-in:</span>
              <button
                type="button"
                onClick={handleOpenGuide}
                className="text-xs text-[#059669] hover:text-[#047857] font-bold underline cursor-pointer"
              >
                Verification Guide →
              </button>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-stone-700 font-medium pl-0.5">
              <li>Click <span className="font-bold text-[#047857] underline">"Advanced"</span> in the bottom-left corner of the Google warning screen.</li>
              <li>Click <span className="font-bold text-rose-700">"Go to SpoofSentry (unsafe)"</span> and select <span className="font-bold text-emerald-700">"Continue"</span> to connect.</li>
            </ol>
          </div>

          <p className="text-[11px] text-stone-500">
            Prefer not to sign in? You can analyze emails with zero login via{' '}
            <button
              type="button"
              onClick={() => onSwitchTab?.('screenshot')}
              className="text-[#059669] hover:text-[#047857] font-bold underline cursor-pointer"
            >
              Screenshot (OCR)
            </button>{' '}
            or{' '}
            <button
              type="button"
              onClick={() => onSwitchTab?.('paste')}
              className="text-[#059669] hover:text-[#047857] font-bold underline cursor-pointer"
            >
              Paste Text
            </button>.
          </p>
        </div>
      )
    },
    {
      id: 'faq-how-screenshot',
      category: 'screenshot',
      question: 'How do I analyze an email from a Screenshot?',
      answer: (
        <div className="space-y-2.5 text-xs leading-relaxed text-stone-700">
          <p>
            Inspect suspicious emails with <strong>zero sign-in</strong>. Upload an image and let AI vision extract sender details, URLs, and social engineering risks:
          </p>

          <div className="bg-stone-50/80 border border-stone-200 rounded-xl p-3 space-y-1.5 text-[11px] text-stone-700">
            <ol className="list-decimal list-inside space-y-1.5 pl-0.5">
              <li><strong>Capture Screenshot:</strong> Take a legible screenshot showing sender, date, subject, and body.</li>
              <li><strong>Upload Image:</strong> Drag &amp; drop into the <button type="button" onClick={() => onSwitchTab?.('screenshot')} className="text-[#059669] font-bold underline cursor-pointer">Screenshot (OCR)</button> tab (<code className="font-mono text-[10px] bg-white px-1 py-0.5 rounded border border-stone-200">.png</code>, <code className="font-mono text-[10px] bg-white px-1 py-0.5 rounded border border-stone-200">.jpg</code>, <code className="font-mono text-[10px] bg-white px-1 py-0.5 rounded border border-stone-200">.webp</code>).</li>
              <li><strong>Run Forensics:</strong> Gemini AI parses envelope details and evaluates sender alignment and threat triggers.</li>
            </ol>
          </div>

          <button
            type="button"
            onClick={() => onSwitchTab?.('screenshot')}
            className="px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Open Screenshot Tab →</span>
          </button>
        </div>
      )
    },
    {
      id: 'faq-how-paste',
      category: 'paste',
      question: 'How do I analyze an email by Pasting Text / Raw Headers?',
      answer: (
        <div className="space-y-2.5 text-xs leading-relaxed text-stone-700">
          <p>
            Pasting raw RFC-822 headers enables <strong>cryptographic DNS verification</strong> for SPF records, DKIM public keys, and DMARC enforcement:
          </p>

          <div className="bg-stone-50/80 border border-stone-200 rounded-xl p-3 space-y-1.5 text-[11px] text-stone-700">
            <ol className="list-decimal list-inside space-y-1.5 pl-0.5">
              <li><strong>Copy Original Headers:</strong> In Gmail, click <span className="font-semibold">More (⋮) &rarr; "Show original" &rarr; Copy</span>. In Outlook, view <span className="font-semibold">Properties &rarr; Internet headers</span>. In Apple Mail, choose <span className="font-semibold">Raw Source</span>.</li>
              <li><strong>Paste into SpoofSentry:</strong> Open the <button type="button" onClick={() => onSwitchTab?.('paste')} className="text-[#059669] font-bold underline cursor-pointer">Paste Text</button> tab and paste the headers (or load a quick sample).</li>
              <li><strong>Live DNS Inspection:</strong> Click <span className="font-semibold">"Analyze Raw Headers"</span> to query live DNS TXT records for SPF, DKIM, and DMARC.</li>
            </ol>
          </div>

          <button
            type="button"
            onClick={() => onSwitchTab?.('paste')}
            className="px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Open Paste Text Tab →</span>
          </button>
        </div>
      )
    },
    {
      id: 'faq-privacy-security',
      category: 'general',
      question: 'Does SpoofSentry store, save, or share any of my emails?',
      answer: (
        <div className="space-y-2 text-xs leading-relaxed text-slate-700">
          <p>
            <strong>No, absolutely not.</strong> Privacy and security are core design principles of SpoofSentry:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-[11px] text-slate-600">
            <li><strong>Zero Permanent Message Storage:</strong> Email contents and images are processed in-memory during your active session only.</li>
            <li><strong>No Model Training:</strong> Your private email correspondence is never used to train machine learning models.</li>
            <li><strong>Ephemeral DNS Verification:</strong> Only the sender domain and cryptographic DKIM selector tags are transmitted to public DNS resolvers to verify SPF, DKIM, and DMARC.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'faq-only-emails',
      category: 'general',
      question: 'Can I analyze source code, code screenshots, or non-email files?',
      answer: (
        <div className="space-y-2.5 text-xs leading-relaxed text-slate-700">
          <p>
            <strong>No. SpoofSentry is strictly an Email Cybersecurity Forensics Engine.</strong> Only genuine email messages, headers, and inboxes can be evaluated for spoofing or classified with a security verdict.
          </p>
          <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-3 space-y-1.5 text-[11px] text-rose-900">
            <div className="font-bold flex items-center gap-1.5 text-rose-950">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Strict Non-Email Detection:</span>
            </div>
            <p>
              If you upload a screenshot of programming source code (such as VSCode, Python/JS scripts, or terminal output) or paste non-email text, SpoofSentry's automated validation engine will detect that the input is not an email and will decline to classify it.
            </p>
            <p className="text-slate-600 pt-1">
              This prevents false verdicts and ensures that only authentic email messages are assessed against cryptographic DNS standards (SPF, DKIM, DMARC) and social engineering patterns.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'faq-dns-records',
      category: 'general',
      question: 'What do SPF, DKIM, and DMARC mean in the assessment report?',
      answer: (
        <div className="space-y-2.5 text-xs leading-relaxed text-slate-700">
          <p>
            These three internet standards represent the defensive foundation against domain impersonation:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-1">
              <span className="font-bold text-slate-900 text-[11px] block">SPF (Sender Policy)</span>
              <p className="text-[10px] text-slate-600 leading-snug">
                Published in the domain's TXT record. Lists all authorized IP addresses allowed to send mail on behalf of the domain.
              </p>
            </div>
            <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-1">
              <span className="font-bold text-slate-900 text-[11px] block">DKIM (Crypto Signatures)</span>
              <p className="text-[10px] text-slate-600 leading-snug">
                Uses public-key cryptography to digitally sign message headers and body, ensuring the email was not modified en route.
              </p>
            </div>
            <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-1">
              <span className="font-bold text-slate-900 text-[11px] block">DMARC (Policy &amp; Alignment)</span>
              <p className="text-[10px] text-slate-600 leading-snug">
                Ensures the visible "From:" address aligns with SPF and DKIM. Instructs recipient mailboxes to reject or quarantine impostors.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'faq-detection-capabilities',
      category: 'general',
      question: 'What cybersecurity detection capabilities and threat signals does SpoofSentry evaluate?',
      answer: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-700">
          <p>
            SpoofSentry operates a multi-layer forensic engine combining real-time cryptographic domain validation with heuristic behavioural risk modeling:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1.5">
              <span className="font-bold text-stone-900 text-[11px] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
                Cryptographic DNS Protocols
              </span>
              <p className="text-[11px] text-stone-600 leading-snug">
                Resolves live public DNS TXT records to confirm <strong>SPF authorization</strong>, verifies <strong>DKIM cryptographic RSA public keys</strong>, and checks <strong>DMARC policy enforcement</strong> (<code className="font-mono text-[10px] bg-white px-1 py-0.5 rounded border border-stone-200">p=reject</code> / <code className="font-mono text-[10px] bg-white px-1 py-0.5 rounded border border-stone-200">quarantine</code> / <code className="font-mono text-[10px] bg-white px-1 py-0.5 rounded border border-stone-200">none</code>).
              </p>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1.5">
              <span className="font-bold text-stone-900 text-[11px] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                Social Engineering Triggers
              </span>
              <p className="text-[11px] text-stone-600 leading-snug">
                Calculates weighted threat scores across psychological hooks: artificial 24-hour urgency, unauthorized wire transfer / bank routing requests, account lockout threats, and executive impersonation (CEO fraud).
              </p>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1.5">
              <span className="font-bold text-stone-900 text-[11px] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                Network &amp; URL Infrastructure
              </span>
              <p className="text-[11px] text-stone-600 leading-snug">
                Detects raw IPv4/IPv6 hyperlink destinations bypassing domain reputation, flags lookalike character permutations (typosquatting), and compares envelope Return-Path routing against visible From headers.
              </p>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1.5">
              <span className="font-bold text-stone-900 text-[11px] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                Temporal &amp; Header Alignment
              </span>
              <p className="text-[11px] text-stone-600 leading-snug">
                Audits RFC-822 header syntax integrity, evaluates off-hours delivery stamps, and cross-references Received hop relays to identify external open-relay injection points.
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <>
      <div className="bg-white border border-[#e8ded3] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        {/* Header */}
        <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
          <div className="w-8 h-8 rounded-lg bg-[#e8fbf3] border border-[#a7f3d0] flex items-center justify-center text-[#059669] shrink-0">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-stone-900">
              Frequently Asked Questions &amp; How-To Guides
            </h2>
            <p className="text-xs text-stone-500">
              Step-by-step guides for screenshot analysis, raw header forensics, and Google verification.
            </p>
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {faqItems.map(item => {
            const isOpen = Boolean(openItems[item.id]);
            return (
              <div
                key={item.id}
                className={`border rounded-xl transition-all ${
                  isOpen
                    ? 'border-[#a7f3d0] bg-[#e8fbf3]/40 shadow-2xs'
                    : 'border-stone-200 bg-stone-50/40 hover:bg-stone-50 hover:border-stone-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="w-full py-3.5 px-4 text-left flex items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#059669] shrink-0"></span>
                    <span className="font-bold text-stone-900 text-xs sm:text-sm">
                      {item.question}
                    </span>
                  </div>
                  <div className="text-stone-400 shrink-0 p-1">
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#059669]" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-stone-100 animate-fadeIn">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* OFFICIAL GOOGLE VERIFICATION MODAL */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8 border border-stone-200">
            <div className="flex items-start justify-between pb-3 border-b border-stone-100">
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
              {/* Phase 1 */}
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

              {/* Phase 2 */}
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
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowVerificationModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
