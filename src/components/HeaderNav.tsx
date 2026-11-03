import React from 'react';
import { Shield, Terminal, User, FileCode, CheckCircle2, History, LogOut } from 'lucide-react';
import { OperatorUser } from '../types';

interface HeaderNavProps {
  user: OperatorUser | null;
  activeView: 'analyzer' | 'testsuite' | 'sourcecode' | 'history';
  setActiveView: (view: 'analyzer' | 'testsuite' | 'sourcecode' | 'history') => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  user,
  activeView,
  setActiveView,
  onOpenAuth,
  onLogout
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#EAE9E4] border-b-2 border-[#1A1A1B] px-4 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#1A1A1B] text-white flex items-center justify-center font-mono font-black text-sm border-2 border-[#1A1A1B]">
            ⬢
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black tracking-tight text-lg text-[#1A1A1B]">
                SPOOF<span className="text-[#B22222]">SENTRY</span>
              </span>
              <span className="font-mono text-[10px] uppercase font-bold px-1.5 py-0.5 bg-[#1A1A1B] text-white">
                v1.4 ENGINE
              </span>
            </div>
            <p className="text-[11px] text-[#1A1A1B]/70 font-mono hidden sm:block">
              DNS AUTHENTICATION (SPF / DKIM / DMARC) • CONTENT FORENSICS
            </p>
          </div>
        </div>

        {/* View Switcher Navigation */}
        <nav className="flex items-center gap-1.5 bg-[#F2F1ED] p-1 border-2 border-[#1A1A1B]">
          <button
            id="nav-btn-analyzer"
            onClick={() => setActiveView('analyzer')}
            className={`px-3 py-1.5 text-xs font-mono font-bold tracking-wide transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'analyzer'
                ? 'bg-[#1A1A1B] text-white'
                : 'text-[#1A1A1B] hover:bg-[#EAE9E4]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>ANALYZER</span>
          </button>

          <button
            id="nav-btn-testsuite"
            onClick={() => setActiveView('testsuite')}
            className={`px-3 py-1.5 text-xs font-mono font-bold tracking-wide transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'testsuite'
                ? 'bg-[#1A1A1B] text-white'
                : 'text-[#1A1A1B] hover:bg-[#EAE9E4]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>TEST SUITE</span>
          </button>

          <button
            id="nav-btn-history"
            onClick={() => setActiveView('history')}
            className={`px-3 py-1.5 text-xs font-mono font-bold tracking-wide transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'history'
                ? 'bg-[#1A1A1B] text-white'
                : 'text-[#1A1A1B] hover:bg-[#EAE9E4]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>AUDIT LOG</span>
          </button>

          <button
            id="nav-btn-sourcecode"
            onClick={() => setActiveView('sourcecode')}
            className={`px-3 py-1.5 text-xs font-mono font-bold tracking-wide transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'sourcecode'
                ? 'bg-[#1A1A1B] text-white'
                : 'text-[#1A1A1B] hover:bg-[#EAE9E4]'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>PYTHON CODE</span>
          </button>
        </nav>

        {/* User / Session Status */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="w-2.5 h-2.5 bg-[#1B4D3E] border border-[#1A1A1B]" />
              <div className="text-right">
                <span className="text-[#1A1A1B] font-bold block">{user.username}</span>
                <span className="text-[#1A1A1B]/60 text-[10px] block font-semibold">{user.companyName}</span>
              </div>
              <button
                id="btn-nav-logout"
                onClick={onLogout}
                className="ml-1 text-[11px] font-bold px-2 py-1 bg-white hover:bg-[#B22222] hover:text-white text-[#B22222] border-2 border-[#1A1A1B] transition-colors cursor-pointer flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                <span>EXIT</span>
              </button>
            </div>
          ) : (
            <button
              id="btn-nav-login"
              onClick={onOpenAuth}
              className="text-xs font-mono font-bold px-3 py-1.5 bg-[#1A1A1B] hover:bg-[#333] text-white border-2 border-[#1A1A1B] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>OPERATOR LOGIN</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
