import React, { useState, useRef, useEffect } from 'react';
import {
  Image as ImageIcon,
  Upload,
  RefreshCw,
  AlertCircle,
  FileText,
  CheckCircle2,
  Sparkles,
  Trash2,
  X,
  ExternalLink,
  ShieldAlert,
  SlidersHorizontal,
  Copy,
  Check,
  Code
} from 'lucide-react';
import { validateEmailInput } from '../utils/emailValidator';

interface ExtractedEmailFields {
  from: string;
  subject: string;
  date: string;
  body: string;
  links: string[];
  full_text: string;
  detected_platform?: string;
  summary?: string;
}

interface ScreenshotIntakeTabProps {
  onAnalyzeText: (
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
  ) => Promise<void>;
  isAnalyzing: boolean;
}

declare global {
  interface Window {
    Tesseract?: any;
  }
}

let tesseractLoadPromise: Promise<void> | null = null;
function loadTesseractScript(): Promise<void> {
  if (typeof window.Tesseract !== 'undefined') return Promise.resolve();
  if (tesseractLoadPromise) return tesseractLoadPromise;

  tesseractLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="tesseract.min.js"]');
    if (existing && typeof window.Tesseract !== 'undefined') {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/5.0.4/tesseract.min.js';
    const timer = setTimeout(() => {
      reject(new Error('OCR engine download timed out.'));
    }, 15000);
    script.onload = () => {
      clearTimeout(timer);
      resolve();
    };
    script.onerror = () => {
      clearTimeout(timer);
      reject(new Error('Failed to load OCR script.'));
    };
    document.head.appendChild(script);
  });
  return tesseractLoadPromise;
}

export const ScreenshotIntakeTab: React.FC<ScreenshotIntakeTabProps> = ({ onAnalyzeText, isAnalyzing }) => {
  const [ocrStatus, setOcrStatus] = useState<string | null>(null);
  const [ocrEngine, setOcrEngine] = useState<'gemini' | 'tesseract' | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [extractedFields, setExtractedFields] = useState<ExtractedEmailFields | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [fileSizeBytes, setFileSizeBytes] = useState<number | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'structured' | 'raw'>('structured');
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Non-email validation state
  const [isNotEmail, setIsNotEmail] = useState<boolean>(false);
  const [nonEmailReason, setNonEmailReason] = useState<string | null>(null);
  const [detectedContentType, setDetectedContentType] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up preview URL when component unmounts or image changes
  useEffect(() => {
    return () => {
      if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  /**
   * Complete Delete/Clear function requested by user:
   * "how i can delete the selected item"
   */
  const handleDeleteSelectedItem = () => {
    if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(null);
    setSelectedFileName(null);
    setFileSizeBytes(null);
    setExtractedText('');
    setExtractedFields(null);
    setIsNotEmail(false);
    setNonEmailReason(null);
    setDetectedContentType(null);
    setOcrStatus(null);
    setOcrEngine(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Process uploaded screenshot using high-accuracy Gemini Vision AI
   * with automatic on-device Tesseract fallback
   */
  const processImageFile = async (file: File) => {
    setError(null);
    setIsNotEmail(false);
    setNonEmailReason(null);
    setDetectedContentType(null);
    setSelectedFileName(file.name);
    setFileSizeBytes(file.size);

    // Create thumbnail preview URL
    if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    const previewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(previewUrl);

    setOcrStatus('Scanning screenshot with Gemini Vision AI...');

    try {
      // 1. Send file directly to server-side AI OCR endpoint
      const formData = new FormData();
      formData.append('screenshot', file);

      const response = await fetch('/api/ocr-screenshot', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const resData = await response.json();
        if (resData.success && resData.data) {
          // Check if server or AI determined this is NOT an email
          if (resData.is_email === false || resData.data.is_email === false) {
            setIsNotEmail(true);
            setNonEmailReason(
              resData.rejection_reason ||
              resData.data.rejection_reason ||
              'This image appears to be programming source code or a non-email window. SpoofSentry only performs forensics on email messages.'
            );
            setDetectedContentType(resData.detected_type || resData.data.detected_type || 'source_code');
            setExtractedFields(null);
            setExtractedText(resData.data.full_text || resData.data.body || '');
            setOcrEngine('gemini');
            setOcrStatus(null);
            return;
          }

          const d = resData.data;
          const fields: ExtractedEmailFields = {
            from: d.from || '',
            subject: d.subject || '',
            date: d.date || '',
            body: d.body || '',
            links: Array.isArray(d.links) ? d.links : [],
            full_text: d.full_text || `${d.from}\n${d.subject}\n${d.body}`,
            detected_platform: d.detected_platform || 'Detected Screenshot',
            summary: d.summary || ''
          };

          const formattedRaw = [
            fields.from ? `From: ${fields.from}` : '',
            fields.date ? `Date: ${fields.date}` : '',
            fields.subject ? `Subject: ${fields.subject}` : '',
            '',
            fields.body
          ]
            .filter(line => line !== null && line !== undefined)
            .join('\n')
            .trim();

          setExtractedFields(fields);
          setExtractedText(formattedRaw);
          setOcrEngine('gemini');
          setOcrStatus(null);
          return;
        }
      }

      // If server AI OCR is not configured or failed, fall back to browser Tesseract
      console.warn('AI OCR not available, falling back to local Tesseract OCR.');
      await runLocalTesseractFallback(file);
    } catch (err: any) {
      console.warn('AI OCR request failed, trying local Tesseract fallback:', err);
      await runLocalTesseractFallback(file);
    }
  };

  /**
   * Browser-based local Tesseract OCR fallback
   */
  const runLocalTesseractFallback = async (file: File) => {
    setOcrStatus('Initializing local OCR engine fallback...');

    try {
      await loadTesseractScript();
      setOcrStatus('Scanning screenshot locally (0%)...');

      const result = await window.Tesseract.recognize(file, 'eng', {
        logger: (m: any) => {
          if (m.status === 'recognizing text' && m.progress !== undefined) {
            setOcrStatus(`Scanning screenshot locally (${Math.round(m.progress * 100)}%)...`);
          }
        }
      });

      const rawText = result?.data?.text?.trim() || '';
      if (!rawText) {
        setOcrStatus(null);
        setError('No legible text was found in this screenshot. You can type or paste details manually.');
        return;
      }

      // Check if text is source code or not an email
      const validation = validateEmailInput({ text: rawText });
      if (!validation.isEmail) {
        setIsNotEmail(true);
        setNonEmailReason(validation.reason);
        setDetectedContentType(validation.detectedType);
        setExtractedText(rawText);
        setExtractedFields(null);
        setOcrEngine('tesseract');
        setOcrStatus(null);
        return;
      }

      // Parse headers from local text
      const fromMatch = rawText.match(/from:?\s*([^\n]+)/i) || rawText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      const subjectMatch = rawText.match(/subject:?\s*([^\n]+)/i);
      const dateMatch = rawText.match(/date:?\s*([^\n]+)/i);
      const matches = rawText.match(/https?:\/\/[^\s<>"')]+|\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?::\d+)?(?:\/[^\s<>"')]+)?/g) || [];
      const urlsFound: string[] = Array.from(new Set<string>(matches));

      const fields: ExtractedEmailFields = {
        from: fromMatch ? fromMatch[1].trim() : '',
        subject: subjectMatch ? subjectMatch[1].trim() : '',
        date: dateMatch ? dateMatch[1].trim() : '',
        body: rawText,
        links: urlsFound,
        full_text: rawText,
        detected_platform: 'Local Browser OCR',
        summary: 'Extracted using local browser OCR engine'
      };

      setExtractedFields(fields);
      setExtractedText(rawText);
      setOcrEngine('tesseract');
      setOcrStatus(null);
    } catch (tessErr: any) {
      console.error('Tesseract fallback failed:', tessErr);
      setOcrStatus(null);
      setError(`OCR could not extract text: ${tessErr.message || 'Engine error'}. Please try another screenshot or paste text.`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleRunAnalysis = async () => {
    if (isNotEmail) {
      setError('Cannot analyze: This screenshot is not an email message. SpoofSentry only evaluates email messages.');
      return;
    }
    setError(null);

    await onAnalyzeText(extractedText, {
      source: 'screenshot',
      headersUnavailable: true,
      extractedFields: extractedFields
        ? {
            from: extractedFields.from,
            subject: extractedFields.subject,
            date: extractedFields.date,
            body: extractedFields.body,
            links: extractedFields.links
          }
        : undefined
    });
  };

  const handleCopyText = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="p-1 text-rose-600 hover:text-rose-800 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* SELECTED ITEM PREVIEW CARD (When a screenshot or preset is active) */}
      {selectedFileName ? (
        <div className="border border-slate-200 bg-white rounded-xl shadow-xs overflow-hidden">
          <div className="p-3.5 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Thumbnail or Icon */}
              {imagePreviewUrl ? (
                <div className="relative w-12 h-12 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={imagePreviewUrl}
                    alt="Screenshot thumbnail"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-[#e8fbf3] border border-[#a7f3d0] flex items-center justify-center text-[#059669] shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 truncate max-w-[200px] sm:max-w-[320px]">
                    {selectedFileName}
                  </span>
                  {ocrEngine === 'gemini' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e8fbf3] text-[#047857] border border-[#a7f3d0]">
                      <Sparkles className="w-2.5 h-2.5 text-[#059669]" />
                      Gemini Vision OCR
                    </span>
                  )}
                  {ocrEngine === 'tesseract' && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      Browser OCR
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                  {fileSizeBytes && (
                    <span>{(fileSizeBytes / 1024).toFixed(1)} KB</span>
                  )}
                  <span>•</span>
                  <span>{extractedFields?.detected_platform || 'Ready for evaluation'}</span>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS: Delete / Remove Item & Replace */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="screenshot-replace-input"
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Change Image</span>
              </label>
              <input
                id="screenshot-replace-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* USER REQUESTED: Delete / Clear Selected Item Button */}
              <button
                type="button"
                id="delete-screenshot-button"
                onClick={handleDeleteSelectedItem}
                className="px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                title="Delete the currently selected screenshot and clear extracted text"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Delete Item</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* DRAG & DROP UPLOAD BOX (Shown when no item is selected) */
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-[#e2d8cd] hover:border-[#10b981] bg-[#fcfaf7] hover:bg-[#e8fbf3]/60 p-6 sm:p-8 rounded-xl text-center transition-all relative cursor-pointer group"
        >
          <input
            ref={fileInputRef}
            type="file"
            id="screenshot-file-input"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="flex flex-col items-center justify-center gap-2.5 pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-stone-200 flex items-center justify-center text-slate-700 group-hover:scale-105 group-hover:border-[#10b981] transition-all">
              <ImageIcon className="w-6 h-6 text-[#059669]" />
            </div>
            <div>
              <span className="text-sm font-bold text-stone-800 block">
                Drop your email screenshot here, or click to browse
              </span>
              <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                Supports PNG, JPG, WebP, or mobile screenshots. Automatically extracted with high-accuracy Gemini Vision AI.
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-stone-400 font-medium mt-1">
              <span>✓ Sender header extraction</span>
              <span>•</span>
              <span>✓ Link &amp; IP detection</span>
              <span>•</span>
              <span>✓ One-click threat analysis</span>
            </div>
          </div>
        </div>
      )}

      {/* OCR SCANNING PROGRESS */}
      {ocrStatus && (
        <div className="flex items-center gap-3 text-xs text-[#047857] bg-[#e8fbf3] border border-[#a7f3d0] p-3.5 rounded-xl font-medium shadow-xs">
          <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-[#059669]" />
          <div className="flex-1">
            <span className="font-bold">{ocrStatus}</span>
            <p className="text-[11px] text-[#059669] font-normal mt-0.5">
              Extracting sender addresses, urgency patterns, and suspicious link destinations...
            </p>
          </div>
        </div>
      )}

      {/* EXTRACTED CONTENT PRESENTATION */}
      {extractedText && (
        <div className="border border-slate-200 bg-white rounded-xl shadow-xs overflow-hidden space-y-0">
          {/* Header & View Switcher */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {isNotEmail ? (
                <>
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="text-xs font-bold text-rose-900">
                    Non-Email Content Detected
                  </span>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-md uppercase">
                    {detectedContentType === 'source_code' ? 'Programming Code' : 'Non-Email Window'}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-800">
                    Extracted Screenshot Content
                  </span>
                  {ocrEngine === 'gemini' && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      High-Precision Extraction
                    </span>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {!isNotEmail && (
                <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-[11px]">
                  <button
                    type="button"
                    onClick={() => setActiveTab('structured')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      activeTab === 'structured'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Structured Fields
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('raw')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      activeTab === 'raw'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Editable Text
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleCopyText}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
                title="Copy extracted text to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={handleDeleteSelectedItem}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                title="Clear and remove screenshot"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-3.5">
            {/* 1. NON-EMAIL / SOURCE CODE WARNING BANNER */}
            {isNotEmail ? (
              <div className="space-y-3.5">
                <div className="p-4 bg-rose-50/90 border border-rose-300 rounded-xl space-y-2.5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700 shrink-0 mt-0.5">
                      <Code className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-rose-950">
                          This is not an email — Analysis Disabled
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-200 text-rose-800 rounded-full border border-rose-300">
                          {detectedContentType === 'source_code' ? 'Code Editor / Script' : 'Non-Email Document'}
                        </span>
                      </div>
                      <p className="text-xs text-rose-900 leading-relaxed">
                        {nonEmailReason || 'The uploaded screenshot shows programming source code rather than an email message.'}
                      </p>
                      <p className="text-[11px] text-rose-700 font-medium">
                        SpoofSentry is an email security engine specifically designed to inspect RFC-822 headers, DKIM cryptographic keys, SPF records, DMARC policies, and phishing hooks. It cannot evaluate source code or classify it as a legitimate email.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-rose-200/80 flex flex-wrap items-center gap-2">
                    <label
                      htmlFor="screenshot-retry-upload"
                      className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload an Email Screenshot</span>
                    </label>
                    <input
                      id="screenshot-retry-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={handleDeleteSelectedItem}
                      className="px-3 py-1.5 text-slate-600 hover:text-slate-900 text-xs font-semibold cursor-pointer"
                    >
                      Clear Screenshot
                    </button>
                  </div>
                </div>

                {/* Extracted Code View */}
                <div className="p-3 bg-slate-900 text-slate-200 rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pb-1 border-b border-slate-800">
                    <span>Extracted Text from Image (Source Code Detected):</span>
                    <span>{extractedText.length} characters</span>
                  </div>
                  <pre className="text-xs font-mono max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed text-slate-300">
                    {extractedText}
                  </pre>
                </div>

                {/* Disabled Button */}
                <button
                  type="button"
                  disabled
                  className="w-full py-2.5 bg-slate-200 border border-slate-300 text-slate-500 font-bold text-xs rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                  <span>Cannot Verdict: Screenshot is Not an Email Message</span>
                </button>
              </div>
            ) : (
              /* 2. VALID EMAIL PRESENTATION */
              <>
                {/* Structured Card View */}
                {activeTab === 'structured' && extractedFields ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Sender (From)
                        </span>
                        <span className="text-xs font-bold text-slate-800 font-mono break-all">
                          {extractedFields.from || '(Not detected)'}
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Date / Timestamp
                        </span>
                        <span className="text-xs font-semibold text-slate-700">
                          {extractedFields.date || '(Not visible in capture)'}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Subject Line
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {extractedFields.subject || '(No Subject header found)'}
                      </span>
                    </div>

                    {/* Detected Links or IPs */}
                    {extractedFields.links && extractedFields.links.length > 0 && (
                      <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg space-y-1">
                        <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                          Detected Links &amp; Addresses ({extractedFields.links.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {extractedFields.links.map((link, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-white border border-amber-300 text-amber-900 text-[11px] font-mono rounded-md break-all"
                            >
                              {link}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Body Preview */}
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Message Body
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto font-mono">
                        {extractedFields.body}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Raw Textarea Editor */
                  <div className="space-y-1.5">
                    <textarea
                      value={extractedText}
                      onChange={e => setExtractedText(e.target.value)}
                      className="w-full min-h-[140px] bg-slate-50 border border-slate-200 text-slate-800 p-3 text-xs font-mono rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white resize-y"
                      placeholder="Extracted email text will appear here..."
                    />
                    <p className="text-[11px] text-slate-400">
                      Tip: You can edit or append details in the text box above before analyzing.
                    </p>
                  </div>
                )}

                {/* Scope Information */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 leading-relaxed flex items-start gap-2">
                  <span className="font-bold text-slate-700 shrink-0">ℹ Forensics Note:</span>
                  <span>
                    Screenshot analysis inspects visible content heuristics (sender domain lookalikes, wire fraud demands, fake urgency, and raw IP destinations). Raw cryptographic DNS header proofs (SPF &amp; DKIM signatures) can be retrieved via <strong>Connect Gmail</strong> or <strong>Paste Headers</strong>.
                  </span>
                </div>

                {/* Run Threat Analysis Button */}
                <button
                  type="button"
                  id="analyze-screenshot-button"
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing}
                  className="w-full py-2.5 bg-[#059669] hover:bg-[#047857] disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Running Forensic Security Evaluation...</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Run Threat Forensics on Extracted Content</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
