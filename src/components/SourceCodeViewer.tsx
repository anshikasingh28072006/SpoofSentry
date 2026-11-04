import React, { useState, useEffect } from 'react';
import { FileCode, Copy, Check, Download } from 'lucide-react';

export const SourceCodeViewer: React.FC = () => {
  const [files, setFiles] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<string>('detector.py');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/source-files')
      .then(res => {
        const ct = res.headers.get('content-type') || '';
        if (res.ok && ct.includes('application/json')) {
          return res.json();
        }
        return { files: {} };
      })
      .then(data => {
        if (data.files && Object.keys(data.files).length > 0) {
          setFiles(data.files);
        } else {
          // Fallback minimal template
          setFiles({
            'detector.py': `# SpoofSentry Rule-Based Email Forensics Engine\n# Download and run locally with Python 3.9+\n\nimport re\nimport dns.resolver\n\nclass SpoofDetector:\n    @staticmethod\n    def evaluate(from_address, return_path='', dkim_header='', subject='', body='', date_str=''):\n        # Real-time DNS lookups and heuristic scoring\n        pass\n`,
            'requirements.txt': `Flask>=2.3.0\ndnspython>=2.4.0\nWerkzeug>=2.3.0\n`,
            'README.md': `# SpoofSentry\nEmail spoofing and DNS authentication forensic analysis system.\n`
          });
        }
      })
      .catch(err => {
        console.warn('Failed to load source files from API, using fallback:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = () => {
    const content = files[selectedFile] || '';
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = files[selectedFile] || '';
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fileDescriptions: Record<string, string> = {
    'detector.py': 'Core rule-based detection classes: EmailParser, AuthenticationValidator (DNS SPF/DKIM/DMARC), ContentAnalyzer, TimingAnalyzer, and SpoofDetector.',
    'app.py': 'Flask web server with SQLite database models (users, analysis_history), session auth decorator, and REST API endpoints.',
    'test_detector.py': 'Automated test suite executing real DNS lookups against legitimate (Google) and spoofed phish samples.',
    'requirements.txt': 'Python dependencies: Flask, dnspython, and Werkzeug.',
    'README.md': 'Project setup instructions, architecture breakdown, and explicit limitation disclosures (SPF sending IP / DKIM crypto signature).'
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#F2F1ED] border-2 border-[#1A1A1B] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-black text-base text-[#1A1A1B] flex items-center gap-2">
            <FileCode className="w-4 h-4 text-[#1A1A1B]" />
            STANDALONE PYTHON SOURCE FILES & ARTIFACTS
          </h2>
          <p className="text-xs text-[#1A1A1B]/80 font-sans font-medium mt-0.5">
            Student mini-project files ready to run on any standard Python 3.9+ environment with <code>python3 app.py</code>.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <button
            id="btn-copy-source"
            onClick={handleCopy}
            className="px-3 py-1.5 bg-white hover:bg-[#EAE9E4] text-[#1A1A1B] text-xs font-mono font-bold border-2 border-[#1A1A1B] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#1B4D3E]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'COPIED TO CLIPBOARD' : 'COPY FILE'}</span>
          </button>

          <button
            id="btn-download-source"
            onClick={handleDownload}
            className="px-3 py-1.5 bg-[#1A1A1B] hover:bg-[#333] text-white text-xs font-mono font-bold border-2 border-[#1A1A1B] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>DOWNLOAD</span>
          </button>
        </div>
      </div>

      {/* File Selector Tabs */}
      <div className="flex flex-wrap gap-1.5 pb-1">
        {['detector.py', 'app.py', 'test_detector.py', 'requirements.txt', 'README.md'].map(filename => (
          <button
            key={filename}
            id={`tab-file-${filename.replace('.', '-')}`}
            onClick={() => setSelectedFile(filename)}
            className={`px-3 py-1.5 font-mono text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border-2 border-[#1A1A1B] ${
              selectedFile === filename
                ? 'bg-[#1A1A1B] text-white'
                : 'text-[#1A1A1B] hover:bg-[#DCDAD4] bg-[#F2F1ED]'
            }`}
          >
            <span>{filename}</span>
          </button>
        ))}
      </div>

      {/* Description */}
      <div className="text-xs font-mono text-[#1A1A1B] bg-white p-3 border-2 border-[#1A1A1B]">
        <strong className="text-[#1A1A1B] font-bold uppercase tracking-wider">File Purpose:</strong>{' '}
        <span className="font-medium">{fileDescriptions[selectedFile]}</span>
      </div>

      {/* Code Box */}
      <div className="bg-[#1A1A1B] text-[#EAE9E4] border-2 border-[#1A1A1B]">
        <div className="bg-[#111111] px-4 py-2 border-b border-white/10 flex items-center justify-between text-xs font-mono text-white/70">
          <span className="font-bold text-white">{selectedFile}</span>
          <span>{files[selectedFile]?.split('\n').length || 0} lines</span>
        </div>
        <div className="p-4 font-mono text-xs overflow-x-auto max-h-[600px] leading-relaxed text-[#EAE9E4] select-text">
          {loading ? (
            <div className="text-white/40 py-8 text-center font-medium">Loading file contents...</div>
          ) : (
            <pre className="whitespace-pre">{files[selectedFile] || '(File empty or not found)'}</pre>
          )}
        </div>
      </div>
    </div>
  );
};
