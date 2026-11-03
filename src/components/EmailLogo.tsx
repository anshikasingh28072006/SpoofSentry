import React from 'react';

interface EmailLogoProps {
  className?: string;
  size?: number;
}

export const EmailLogo: React.FC<EmailLogoProps> = ({ className = 'w-9 h-9', size = 36 }) => {
  return (
    <div
      className={`relative shrink-0 rounded-xl overflow-hidden shadow-xs transition-transform duration-200 hover:scale-105 ${className}`}
      style={{ width: size, height: size }}
      title="SpoofSentry Email Protection"
    >
      <svg
        viewBox="0 0 128 128"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full block"
      >
        <defs>
          {/* Bold Cool Sassy Emerald Squircle Gradient */}
          <linearGradient id="emailLogoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06241b" />
            <stop offset="50%" stopColor="#047857" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          {/* Warm Peach & Mint Rim Highlight */}
          <linearGradient id="emailLogoPeachRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0.4" />
          </linearGradient>

          {/* Envelope paper gradient */}
          <linearGradient id="emailPaperGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#faf5ee" />
          </linearGradient>

          {/* Envelope flap gradient */}
          <linearGradient id="emailFlapGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fff8f2" />
            <stop offset="100%" stopColor="#eddcd0" />
          </linearGradient>

          {/* Bold Electric Mint & Emerald security shield */}
          <linearGradient id="emailShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          {/* Drop shadows */}
          <filter id="mailDropShadow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#031f16" floodOpacity="0.4" />
          </filter>
          <filter id="shieldGlowShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#022c22" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Rounded Background Squircle in Bold Emerald */}
        <rect x="4" y="4" width="120" height="120" rx="28" fill="url(#emailLogoBgGrad)" />
        <rect x="4" y="4" width="120" height="120" rx="28" fill="none" stroke="url(#emailLogoPeachRim)" strokeWidth="1.8" />

        {/* Crisp Email Envelope */}
        <g filter="url(#mailDropShadow)">
          {/* Envelope Base Body */}
          <rect x="22" y="36" width="84" height="56" rx="8" fill="url(#emailPaperGrad)" />

          {/* Subtle interior mail folds */}
          <path d="M 23 88 L 56 60" stroke="#d5c7b7" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          <path d="M 105 88 L 72 60" stroke="#d5c7b7" strokeWidth="2" strokeLinecap="round" opacity="0.7" />

          {/* Bottom envelope pocket fold */}
          <path d="M 22 92 L 64 63 L 106 92 Z" fill="#f5ede3" opacity="0.95" />

          {/* Top envelope flap */}
          <path d="M 23 37 Q 64 72 64 72 Q 64 72 105 37 Z" fill="url(#emailFlapGrad)" />
          <path d="M 23 37 L 64 72 L 105 37" fill="none" stroke="#d5c7b7" strokeWidth="1.5" opacity="0.6" />
        </g>

        {/* Cybersecurity Sentry Shield Badge */}
        <g filter="url(#shieldGlowShadow)">
          {/* White Border Ring */}
          <path d="M 82 55 C 82 55 97 51 106 47 C 106 68 102 85 82 96 C 62 85 58 68 58 47 C 67 51 82 55 82 55 Z" fill="#ffffff" />
          
          {/* Electric Mint & Emerald Shield Surface */}
          <path d="M 82 58 C 82 58 95 54.5 103 51 C 103 68.5 99.5 82.5 82 92 C 64.5 82.5 61 68.5 61 51 C 69 54.5 82 58 82 58 Z" fill="url(#emailShieldGrad)" />

          {/* Verified Checkmark Symbol */}
          <path d="M 73 72 L 79 78 L 92 65" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
};
