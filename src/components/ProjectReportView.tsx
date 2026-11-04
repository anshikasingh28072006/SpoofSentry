import React, { useState } from 'react';
import {
  Download,
  Printer,
  ArrowLeft,
  FileText,
  FileCode,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Share2,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { generateReportHtml, generateWordDocString, getReportBodyHtml, REPORT_STYLES_CSS } from '../reportTemplate';

interface ProjectReportViewProps {
  onBack: () => void;
}

export const ProjectReportView: React.FC<ProjectReportViewProps> = ({ onBack }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'book' | 'single'>('book');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const reportBodyHtml = getReportBodyHtml();

  const handleDownloadWordDoc = () => {
    try {
      const docContent = generateWordDocString();
      const blob = new Blob([docContent], { type: 'application/msword;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'SpoofSentry_BTech_Mini_Project_Report.doc';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.warn('Blob download failed, using direct static file:', err);
      const link = document.createElement('a');
      link.href = '/SpoofSentry_Project_Report.doc';
      link.download = 'SpoofSentry_BTech_Mini_Project_Report.doc';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadHtml = () => {
    try {
      const htmlContent = generateReportHtml();
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'SpoofSentry_Project_Report.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.warn('HTML blob generation failed, using direct link:', err);
      const link = document.createElement('a');
      link.href = '/report.html';
      link.download = 'SpoofSentry_Project_Report.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleNativePrint = () => {
    // If user is currently in single page mode, toggle to book mode first so all 36 pages are printed
    if (viewMode === 'single') {
      setViewMode('book');
      setTimeout(() => {
        window.print();
      }, 150);
    } else {
      window.print();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + '/SpoofSentry_Mini_Project_Report.pdf');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const jumpToPage = (pageNum: number) => {
    setCurrentPage(pageNum);
    if (viewMode === 'book') {
      const el = document.getElementById(`page-${pageNum}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const majorSections = [
    { label: 'Page 1: Title & Cover', page: 1 },
    { label: 'Page 2: Student Declaration', page: 2 },
    { label: 'Page 3: Faculty Certificate', page: 3 },
    { label: 'Page 4: Acknowledgement', page: 4 },
    { label: 'Page 5: Abstract & Keywords', page: 5 },
    { label: 'Page 6: Contents (TOC)', page: 6 },
    { label: 'Page 8: Chapter 1 Introduction', page: 8 },
    { label: 'Page 10: Chapter 2 Web Tech (Table 1)', page: 10 },
    { label: 'Page 12: Chapter 3 TypeScript Code', page: 12 },
    { label: 'Page 14: Chapter 4 System Architecture', page: 14 },
    { label: 'Page 16: Chapter 5 SpoofSentry (Fig 1-12)', page: 16 },
    { label: 'Page 27: Chapter 5.9 Testing (Table 2)', page: 27 },
    { label: 'Page 28: Chapter 6 Conclusion', page: 28 },
    { label: 'Page 29: References (RFCs & Docs)', page: 29 },
    { label: 'Page 30: Appendix 1 React UI Code', page: 30 },
    { label: 'Page 33: Appendix 2 Server Engine Code', page: 33 },
    { label: 'Page 35: Appendix 3 Tailwind CSS Code', page: 35 },
  ];

  return (
    <div className="space-y-4">
      {/* Inject report CSS styles so report pages render identically to the print output */}
      <style>{REPORT_STYLES_CSS}</style>

      {/* Main Top Header and Action Bar */}
      <header className="bg-slate-900 border border-slate-800 text-white p-4 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide">
                B.Tech Mini Project Report (BCC351)
              </h2>
              <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-semibold rounded-full">
                Complete 36 Pages
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Department of CSE-AIML • Ashoka Institute of Technology & Management, Varanasi
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Direct 1-Click PDF Download Button */}
          <a
            href="/SpoofSentry_Mini_Project_Report.pdf"
            download="SpoofSentry_BTech_Mini_Project_Report.pdf"
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-950/40 transition-all transform hover:scale-105"
            title="Download complete 36-page PDF document file directly to your laptop or phone"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF (.pdf)</span>
          </a>

          {/* Direct Word Document Download Button */}
          <button
            type="button"
            onClick={handleDownloadWordDoc}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
            title="Download Microsoft Word .doc formatted report file"
          >
            <Download className="w-4 h-4" />
            <span>Word File (.doc)</span>
          </button>

          {/* Native Print / Save PDF Button */}
          <button
            type="button"
            onClick={handleNativePrint}
            className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
            title="Print or Save as PDF via native browser dialog"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>

          {/* Standalone HTML Report */}
          <button
            type="button"
            onClick={handleDownloadHtml}
            className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Download standalone HTML document"
          >
            <FileCode className="w-4 h-4" />
            <span>HTML File</span>
          </button>

          {/* Guide Helper */}
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer transition-colors"
            title="Download & Print instructions for mobile and laptop"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Back Button */}
          <button
            type="button"
            onClick={onBack}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>
      </header>

      {/* Quick Navigation and View Mode Bar */}
      <div className="bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 print:hidden">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-400">Jump to Chapter:</span>
          <select
            value={currentPage}
            onChange={(e) => jumpToPage(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {majorSections.map((sec) => (
              <option key={sec.page} value={sec.page}>
                {sec.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('book')}
              className={`px-3 py-1 rounded-md font-medium text-xs transition-colors ${
                viewMode === 'book' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Continuous Book (All 36 Pages)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('single')}
              className={`px-3 py-1 rounded-md font-medium text-xs transition-colors ${
                viewMode === 'single' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Page-by-Page View
            </button>
          </div>

          {viewMode === 'single' && (
            <div className="flex items-center gap-1 pl-2">
              <button
                type="button"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono px-2 text-slate-300">
                Page {currentPage} of 36
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage(Math.min(36, currentPage + 1))}
                disabled={currentPage >= 36}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleCopyLink}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1 transition-colors"
            title="Copy Direct PDF Download Link"
          >
            {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy PDF Link'}</span>
          </button>
        </div>
      </div>

      {/* Helpful Download Instructions Modal / Card */}
      {showGuide && (
        <div className="bg-slate-800/95 border border-slate-700 p-4 rounded-xl text-xs text-slate-300 space-y-3 shadow-lg print:hidden">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              How to Save and Download the Report File on Any Device:
            </h4>
            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="text-slate-400 hover:text-white text-sm"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700/60">
              <span className="px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 rounded font-bold text-[10px] uppercase block mb-1">
                Direct PDF File
              </span>
              <p className="text-slate-300 text-xs">
                Click <strong>"Download PDF (.pdf)"</strong> above. The full 36-page document will be saved directly into your device downloads folder.
              </p>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700/60">
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded font-bold text-[10px] uppercase block mb-1">
                Word Document
              </span>
              <p className="text-slate-300 text-xs">
                Click <strong>"Word File (.doc)"</strong> to download an editable Microsoft Word document. You can customize student names, signatures, or add institutional notes.
              </p>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700/60">
              <span className="px-2 py-0.5 bg-blue-950 text-blue-300 border border-blue-800 rounded font-bold text-[10px] uppercase block mb-1">
                Native Browser Print
              </span>
              <p className="text-slate-300 text-xs">
                Click <strong>"Print / Save PDF"</strong> or press <kbd className="bg-slate-800 px-1 py-0.5 rounded border border-slate-600 font-mono">Ctrl+P</kbd> to open Chrome/Edge's print dialog and select "Save as PDF" with A4 layout.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Authentic Academic Report Display (Rendered directly in DOM) */}
      <div className="report-book-wrapper w-full bg-slate-300 py-6 px-2 md:px-4 rounded-2xl overflow-x-auto shadow-2xl border border-slate-400/80">
        <div
          className={`report-content-container mx-auto ${
            viewMode === 'single' ? 'single-page-active' : ''
          }`}
          dangerouslySetInnerHTML={{ __html: reportBodyHtml }}
        />
      </div>

      {/* Script to handle single-page view styling */}
      {viewMode === 'single' && (
        <style>{`
          .single-page-active .report-page {
            display: none !important;
          }
          .single-page-active #page-${currentPage} {
            display: block !important;
          }
        `}</style>
      )}
    </div>
  );
};
