import React from 'react';
import {
  Shield,
  Lock,
  Mail,
  Link as LinkIcon,
  AlertTriangle,
  Compass,
  Check,
  ArrowRight,
  ChevronDown,
  ShieldCheck,
  Eye,
  ExternalLink
} from 'lucide-react';

interface EducationalGuideProps {
  onStartAnalysis: () => void;
}

export const EducationalGuide: React.FC<EducationalGuideProps> = ({ onStartAnalysis }) => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-14 sm:space-y-20 pt-2 pb-6">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Page 1)                                                  */}
      {/* ========================================================================= */}
      <section className="relative pt-6 sm:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Hero Copy (Col 1-8) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Top Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#edece6] border border-[#dedcd4] text-[#425248] text-xs font-medium">
              <Lock className="w-3.5 h-3.5 text-[#2f4236]" />
              <span>Private by design · runs in your browser</span>
            </div>

            {/* Giant Display Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-bold tracking-tight text-[#15241d] leading-[1.12]">
              Understand <br className="hidden sm:block" />
              suspicious emails <br className="hidden sm:block" />
              before you trust <br className="hidden sm:block" />
              them.
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-[#4d5b54] max-w-xl leading-relaxed">
              A calm, plain-language guide for the moment an email feels just a
              little off. No account, no upload, no false certainty.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={onStartAnalysis}
                className="px-6 py-3 rounded-full bg-[#14382c] hover:bg-[#1d4a3b] text-white text-sm font-semibold tracking-wide shadow-xs flex items-center gap-2 cursor-pointer transition-all group"
              >
                <span>Start an email analysis</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('the-basics')}
                className="text-xs sm:text-sm font-semibold text-[#32453b] hover:text-[#14382c] flex items-center gap-1.5 py-2.5 px-3 rounded-full hover:bg-[#edece6] transition-colors cursor-pointer"
              >
                <span>See how it works</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Hero Accompanying Card & Focus Graphic (Col 9-12) */}
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-end lg:items-end gap-6 justify-between lg:justify-start">
            {/* Subtle Dotted Scanner Target / Reticle */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-2 border-dashed border-[#d4d2c8] flex items-center justify-center text-[#9ca89f] relative self-end">
              <div className="w-8 h-8 rounded-full border border-[#b8c2ba] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#4a6354]" />
              </div>
              <span className="absolute top-1.5 left-2 text-[10px] font-mono text-[#8a968e]">+</span>
              <span className="absolute top-1.5 right-2 text-[10px] font-mono text-[#8a968e]">+</span>
              <span className="absolute bottom-1.5 left-2 text-[10px] font-mono text-[#8a968e]">+</span>
              <span className="absolute bottom-1.5 right-2 text-[10px] font-mono text-[#8a968e]">+</span>
            </div>

            {/* "YOUR DATA" Info Box */}
            <div className="w-full max-w-[240px] bg-[#fbfaf7] border border-[#e4e2d8] rounded-xl p-4 space-y-1.5 shadow-2xs">
              <div className="text-[10px] font-bold tracking-widest text-[#718077] uppercase">
                YOUR DATA
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1f3127]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                <span>stays in memory</span>
              </div>
              <p className="text-[11px] text-[#63726a] leading-tight">
                Cleared when you leave or reset.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. SECTION: THE USEFUL BASICS (Page 1)                                    */}
      {/* ========================================================================= */}
      <section id="the-basics" className="pt-8 border-t border-[#e2dfd5]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
          {/* Left Column */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-mono font-bold tracking-widest uppercase text-[#54675c]">
              — THE USEFUL BASICS
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#16251e] leading-snug">
              Security language, translated for real life.
            </h2>
            <p className="text-xs sm:text-sm text-[#4d5c54] leading-relaxed">
              You do not need to be a security professional to pause at the right
              moment. Learn the patterns, then make your own call.
            </p>
          </div>

          {/* Right Column: 2x2 Grid of 4 Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 01: Spoofing */}
            <div className="bg-white border border-[#e4e2d8] rounded-2xl p-5 space-y-3 shadow-2xs hover:border-[#ced6d0] transition-all">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-[#eef4f0] text-[#1c4737] flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-bold text-[#86958d]">01</span>
              </div>
              <h3 className="text-base font-bold text-[#17251e]">Spoofing</h3>
              <p className="text-xs text-[#526159] leading-relaxed">
                An email can make its sender name look familiar while the actual
                address belongs somewhere else.
              </p>
            </div>

            {/* Card 02: Phishing */}
            <div className="bg-white border border-[#e4e2d8] rounded-2xl p-5 space-y-3 shadow-2xs hover:border-[#ced6d0] transition-all">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-[#eef4f0] text-[#1c4737] flex items-center justify-center">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-bold text-[#86958d]">02</span>
              </div>
              <h3 className="text-base font-bold text-[#17251e]">Phishing</h3>
              <p className="text-xs text-[#526159] leading-relaxed">
                Phishing is a social trick: a message designed to move you toward
                a link, download, payment, or secret.
              </p>
            </div>

            {/* Card 03: Signals, not verdicts */}
            <div className="bg-white border border-[#e4e2d8] rounded-2xl p-5 space-y-3 shadow-2xs hover:border-[#ced6d0] transition-all">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-[#eef4f0] text-[#1c4737] flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-bold text-[#86958d]">03</span>
              </div>
              <h3 className="text-base font-bold text-[#17251e]">Signals, not verdicts</h3>
              <p className="text-xs text-[#526159] leading-relaxed">
                One odd detail is not conclusive. Several details together are a
                reason to slow down and verify.
              </p>
            </div>

            {/* Card 04: Your next step */}
            <div className="bg-white border border-[#e4e2d8] rounded-2xl p-5 space-y-3 shadow-2xs hover:border-[#ced6d0] transition-all">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-[#eef4f0] text-[#1c4737] flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-bold text-[#86958d]">04</span>
              </div>
              <h3 className="text-base font-bold text-[#17251e]">Your next step</h3>
              <p className="text-xs text-[#526159] leading-relaxed">
                The safest answer is usually simple: do not reply or click yet.
                Find a trusted way to confirm.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SECTION: WHAT WE CHECK (Dark Forest Green Card, Page 1)               */}
      {/* ========================================================================= */}
      <section id="what-we-check">
        <div className="bg-[#142e23] border border-[#1d4233] text-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Header */}
            <div className="lg:col-span-4 space-y-3">
              <div className="text-xs font-mono font-bold tracking-widest uppercase text-[#5eead4]">
                — WHAT WE CHECK
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
                A short checklist, not a black box.
              </h2>
              <p className="text-xs sm:text-sm text-[#b2c4ba] leading-relaxed">
                Email Detector looks for recognizable patterns and shows its work.
                It never searches the internet or claims a message is safe.
              </p>
            </div>

            {/* Right Checklist (2 columns of 4 items) */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 text-xs sm:text-sm font-medium">
              <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-[#e2ece6]">
                  <span className="text-[#688a77] font-mono mr-2 text-xs">01</span>
                  Urgency and threats
                </span>
                <Check className="w-4 h-4 text-[#4ade80] shrink-0" />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-[#e2ece6]">
                  <span className="text-[#688a77] font-mono mr-2 text-xs">02</span>
                  Password, code, or payment asks
                </span>
                <Check className="w-4 h-4 text-[#4ade80] shrink-0" />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-[#e2ece6]">
                  <span className="text-[#688a77] font-mono mr-2 text-xs">03</span>
                  Links and visible URL mismatches
                </span>
                <Check className="w-4 h-4 text-[#4ade80] shrink-0" />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-[#e2ece6]">
                  <span className="text-[#688a77] font-mono mr-2 text-xs">04</span>
                  Unexpected attachments
                </span>
                <Check className="w-4 h-4 text-[#4ade80] shrink-0" />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-[#e2ece6]">
                  <span className="text-[#688a77] font-mono mr-2 text-xs">05</span>
                  Sender and reply-to differences
                </span>
                <Check className="w-4 h-4 text-[#4ade80] shrink-0" />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-[#e2ece6]">
                  <span className="text-[#688a77] font-mono mr-2 text-xs">06</span>
                  SPF, DKIM, and DMARC results
                </span>
                <Check className="w-4 h-4 text-[#4ade80] shrink-0" />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-[#e2ece6]">
                  <span className="text-[#688a77] font-mono mr-2 text-xs">07</span>
                  Requests to bypass normal process
                </span>
                <Check className="w-4 h-4 text-[#4ade80] shrink-0" />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-[#e2ece6]">
                  <span className="text-[#688a77] font-mono mr-2 text-xs">08</span>
                  A clear explanation of each signal
                </span>
                <Check className="w-4 h-4 text-[#4ade80] shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SECTION: RISK SCORE (Page 2)                                           */}
      {/* ========================================================================= */}
      <section id="risk-score" className="pt-8 border-t border-[#e2dfd5]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-start">
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-mono font-bold tracking-widest uppercase text-[#54675c]">
              — RISK SCORE
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#16251e] leading-snug">
              A number to help you pause, never a permission slip.
            </h2>
            <p className="text-xs sm:text-sm text-[#4d5c54] leading-relaxed">
              The score combines multiple signals into a 0–100 guide. A high score means
              verify before acting. A low score means this particular check found fewer
              common patterns—not that the email is safe.
            </p>
          </div>

          {/* Right Column: Score Bands Table Card */}
          <div className="lg:col-span-7 bg-white border border-[#e4e2d8] rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e9e7df] text-xs font-bold text-[#687a71] uppercase tracking-wider">
              <span>SCORE BANDS</span>
              <span className="font-mono text-[11px] font-normal text-[#8c9c93]">0 to 100</span>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Band 1: Low risk */}
              <div className="grid grid-cols-12 items-center gap-3">
                <div className="col-span-4 flex items-center gap-2 font-medium text-[#1c2921]">
                  <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
                  <span>Low risk</span>
                </div>
                <div className="col-span-2 font-mono text-[#73847a]">0–19</div>
                <div className="col-span-6 h-2 bg-[#f0eee6] rounded-full overflow-hidden">
                  <div className="h-full bg-[#16a34a] rounded-full" style={{ width: '22%' }} />
                </div>
              </div>

              {/* Band 2: Caution */}
              <div className="grid grid-cols-12 items-center gap-3">
                <div className="col-span-4 flex items-center gap-2 font-medium text-[#1c2921]">
                  <span className="w-2 h-2 rounded-full bg-[#65a30d]" />
                  <span>Caution</span>
                </div>
                <div className="col-span-2 font-mono text-[#73847a]">20–39</div>
                <div className="col-span-6 h-2 bg-[#f0eee6] rounded-full overflow-hidden">
                  <div className="h-full bg-[#65a30d] rounded-full" style={{ width: '42%' }} />
                </div>
              </div>

              {/* Band 3: Moderate risk */}
              <div className="grid grid-cols-12 items-center gap-3">
                <div className="col-span-4 flex items-center gap-2 font-medium text-[#1c2921]">
                  <span className="w-2 h-2 rounded-full bg-[#d97706]" />
                  <span>Moderate risk</span>
                </div>
                <div className="col-span-2 font-mono text-[#73847a]">40–59</div>
                <div className="col-span-6 h-2 bg-[#f0eee6] rounded-full overflow-hidden">
                  <div className="h-full bg-[#d97706] rounded-full" style={{ width: '62%' }} />
                </div>
              </div>

              {/* Band 4: High risk */}
              <div className="grid grid-cols-12 items-center gap-3">
                <div className="col-span-4 flex items-center gap-2 font-medium text-[#1c2921]">
                  <span className="w-2 h-2 rounded-full bg-[#ea580c]" />
                  <span>High risk</span>
                </div>
                <div className="col-span-2 font-mono text-[#73847a]">60–79</div>
                <div className="col-span-6 h-2 bg-[#f0eee6] rounded-full overflow-hidden">
                  <div className="h-full bg-[#ea580c] rounded-full" style={{ width: '80%' }} />
                </div>
              </div>

              {/* Band 5: Very high risk */}
              <div className="grid grid-cols-12 items-center gap-3">
                <div className="col-span-4 flex items-center gap-2 font-medium text-[#1c2921]">
                  <span className="w-2 h-2 rounded-full bg-[#b91c1c]" />
                  <span>Very high risk</span>
                </div>
                <div className="col-span-2 font-mono text-[#73847a]">80–100</div>
                <div className="col-span-6 h-2 bg-[#f0eee6] rounded-full overflow-hidden">
                  <div className="h-full bg-[#b91c1c] rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SECTION: SAFETY TIPS (Page 2)                                          */}
      {/* ========================================================================= */}
      <section id="safety-tips" className="pt-8 border-t border-[#e2dfd5]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-start">
          {/* Left Column */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-mono font-bold tracking-widest uppercase text-[#54675c]">
              — SAFETY TIPS
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#16251e] leading-snug">
              The human move wins.
            </h2>
            <p className="text-xs sm:text-sm text-[#4d5c54] leading-relaxed">
              Tools can point at clues. You still own the decision.
            </p>
          </div>

          {/* Right Column: 2x3 Grid of 6 Numbered Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            {/* Tip 01 */}
            <div className="bg-white border border-[#e4e2d8] rounded-xl p-4 flex items-start gap-3.5 shadow-2xs">
              <span className="font-mono font-bold text-sm text-[#14382c] bg-[#eef3ef] px-2 py-0.5 rounded shrink-0">
                01
              </span>
              <p className="text-[#3c4a42] leading-snug font-medium pt-0.5">
                Pause when a message changes your normal routine.
              </p>
            </div>

            {/* Tip 02 */}
            <div className="bg-white border border-[#e4e2d8] rounded-xl p-4 flex items-start gap-3.5 shadow-2xs">
              <span className="font-mono font-bold text-sm text-[#14382c] bg-[#eef3ef] px-2 py-0.5 rounded shrink-0">
                02
              </span>
              <p className="text-[#3c4a42] leading-snug font-medium pt-0.5">
                Open a new browser tab instead of using a message link.
              </p>
            </div>

            {/* Tip 03 */}
            <div className="bg-white border border-[#e4e2d8] rounded-xl p-4 flex items-start gap-3.5 shadow-2xs">
              <span className="font-mono font-bold text-sm text-[#14382c] bg-[#eef3ef] px-2 py-0.5 rounded shrink-0">
                03
              </span>
              <p className="text-[#3c4a42] leading-snug font-medium pt-0.5">
                Call a known number, not a number supplied in the email.
              </p>
            </div>

            {/* Tip 04 */}
            <div className="bg-white border border-[#e4e2d8] rounded-xl p-4 flex items-start gap-3.5 shadow-2xs">
              <span className="font-mono font-bold text-sm text-[#14382c] bg-[#eef3ef] px-2 py-0.5 rounded shrink-0">
                04
              </span>
              <p className="text-[#3c4a42] leading-snug font-medium pt-0.5">
                Never share a password or one-time code by email.
              </p>
            </div>

            {/* Tip 05 */}
            <div className="bg-white border border-[#e4e2d8] rounded-xl p-4 flex items-start gap-3.5 shadow-2xs">
              <span className="font-mono font-bold text-sm text-[#14382c] bg-[#eef3ef] px-2 py-0.5 rounded shrink-0">
                05
              </span>
              <p className="text-[#3c4a42] leading-snug font-medium pt-0.5">
                Ask a colleague before paying an unexpected invoice.
              </p>
            </div>

            {/* Tip 06 */}
            <div className="bg-white border border-[#e4e2d8] rounded-xl p-4 flex items-start gap-3.5 shadow-2xs">
              <span className="font-mono font-bold text-sm text-[#14382c] bg-[#eef3ef] px-2 py-0.5 rounded shrink-0">
                06
              </span>
              <p className="text-[#3c4a42] leading-snug font-medium pt-0.5">
                If you clicked, tell your IT or bank quickly. No shame, just speed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. CALLOUT BANNER: PRIVATE BY DEFAULT (Page 2)                            */}
      {/* ========================================================================= */}
      <section id="privacy">
        <div className="bg-[#edebe4] border border-[#dedcd4] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#14382c]" />
              <h3 className="text-base sm:text-lg font-bold text-[#15241d]">
                Private by default.
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#4d5c54] leading-relaxed">
              Your pasted text, screenshot, and headers stay in your browser memory.
              They are not stored, sent to a server, or used to train anything. Reset
              clears the current analysis.
            </p>
          </div>

          <button
            type="button"
            onClick={onStartAnalysis}
            className="px-6 py-2.5 rounded-full bg-[#14382c] hover:bg-[#1d4a3b] text-white text-xs sm:text-sm font-semibold tracking-wide shadow-2xs flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0"
          >
            <span>Check an email</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FOOTER (Page 2)                                                        */}
      {/* ========================================================================= */}
      <footer className="pt-6 border-t border-[#e2dfd5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#718077]">
        <div>
          <span>© Email Detector: an educational tool</span>
        </div>
        <div>
          <span>Not a security guarantee. When in doubt, verify through a trusted channel.</span>
        </div>
      </footer>
    </div>
  );
};
