import React, { useState } from 'react';
import { X, Lock, User, Building, ArrowRight } from 'lucide-react';
import { OperatorUser } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: OperatorUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = mode === 'login' 
      ? { username, password }
      : { username, password, companyName };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#F2F1ED] border-2 border-[#1A1A1B] max-w-md w-full p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#1A1A1B] hover:opacity-70 cursor-pointer p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <span className="font-mono text-[10px] font-black px-2 py-0.5 bg-[#1A1A1B] text-white tracking-wider uppercase">
            {mode === 'login' ? 'OPERATOR SIGN-IN' : 'INITIALIZE WORKSPACE'}
          </span>
          <h2 className="font-serif font-bold text-2xl text-[#1A1A1B] mt-2">
            {mode === 'login' ? 'Analyst Authentication' : 'Create Operator Account'}
          </h2>
          <p className="text-xs text-[#1A1A1B]/80 font-sans mt-1 font-medium">
            {mode === 'login'
              ? 'Access saved forensics audit trails and custom security telemetry.'
              : 'Register your security lab or institutional identity.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-white border-2 border-[#B22222] text-[#B22222] font-mono text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block font-mono text-xs font-bold text-[#1A1A1B] mb-1">
                Organization / Lab Name
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-[#1A1A1B]/50 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. CyberSec Defense Labs"
                  className="w-full bg-white border-2 border-[#1A1A1B] pl-9 pr-3 py-2 text-xs font-mono font-medium text-[#1A1A1B] focus:outline-none focus:bg-[#FAF9F5]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-mono text-xs font-bold text-[#1A1A1B] mb-1">
              Operator Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#1A1A1B]/50 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. analyst_01"
                className="w-full bg-white border-2 border-[#1A1A1B] pl-9 pr-3 py-2 text-xs font-mono font-medium text-[#1A1A1B] focus:outline-none focus:bg-[#FAF9F5]"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs font-bold text-[#1A1A1B] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#1A1A1B]/50 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border-2 border-[#1A1A1B] pl-9 pr-3 py-2 text-xs font-mono font-medium text-[#1A1A1B] focus:outline-none focus:bg-[#FAF9F5]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 bg-[#1A1A1B] hover:bg-[#333] disabled:opacity-50 text-white font-mono font-black text-xs border-2 border-[#1A1A1B] flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
          >
            <span>{mode === 'login' ? 'AUTHENTICATE & ENTER' : 'CREATE ACCOUNT'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-4 pt-3 border-t-2 border-[#1A1A1B]/20 text-center font-mono text-xs text-[#1A1A1B]">
          {mode === 'login' ? (
            <span>
              Need a new workspace?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-[#1A1A1B] font-bold underline hover:opacity-75 cursor-pointer ml-1"
              >
                Register here
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-[#1A1A1B] font-bold underline hover:opacity-75 cursor-pointer ml-1"
              >
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

