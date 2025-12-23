import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg 
    viewBox="0 0 100 100" 
    className={className} 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="logoGradient" x1="0" y1="0" x2="100" y2="100">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    {/* Background Container */}
    <rect width="100" height="100" rx="24" fill="url(#logoGradient)" />
    
    {/* Abstract Structure Symbol */}
    <g transform="translate(0, 2)">
      {/* Connecting Lines */}
      <path 
        d="M50 28 L28 72 H72 L50 28" 
        stroke="white" 
        strokeWidth="6" 
        strokeLinejoin="round" 
        strokeLinecap="round"
        fill="none" 
        opacity="0.9"
      />
      
      {/* Nodes */}
      <circle cx="50" cy="28" r="7" fill="white" />
      <circle cx="28" cy="72" r="7" fill="white" />
      <circle cx="72" cy="72" r="7" fill="white" />
      
      {/* Central Core (AI Brain) */}
      <circle cx="50" cy="54" r="5" fill="white" opacity="0.4" />
    </g>
  </svg>
);