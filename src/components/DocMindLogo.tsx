'use client';

import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export function DocMindLogoIcon({ className = 'w-5 h-5', size }: LogoProps) {
  const dimensions = size ? { width: size, height: size } : {};
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...dimensions}
    >
      {/* Speech Bubble Pointer (bottom-left) */}
      <path
        d="M8 13.5L4.5 17L5.8 12.2"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      {/* Magnifying Glass Outer Circle */}
      <circle
        cx="11.5"
        cy="9.5"
        r="5.5"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      {/* Magnifying Glass Handle (bottom-right) */}
      <path
        d="M15.4 13.4L19.5 17.5"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      {/* Tiny PDF document inside lens */}
      <path
        d="M9.5 7H12.2L13.5 8.3V12H9.5V7Z"
        fill="currentColor"
        fillOpacity="0.25"
        stroke="currentColor"
        strokeWidth="1"
      />
      {/* Fold lines & document text lines */}
      <path d="M12.2 7V8.3H13.5" stroke="currentColor" strokeWidth="1" />
      <line x1="10.5" y1="9.5" x2="12.5" y2="9.5" stroke="currentColor" strokeWidth="0.8" />
      <line x1="10.5" y1="10.7" x2="12.5" y2="10.7" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  );
}

export function DocMindLogoFull({ className = 'w-10.5 h-10.5', iconClassName = 'w-5.5 h-5.5', size }: LogoProps & { iconClassName?: string }) {
  const dimensions = size ? { width: size, height: size } : {};
  return (
    <div
      className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-primary via-accent-violet to-accent-cyan text-white shadow-md shadow-primary/20 hover:scale-105 transition-transform duration-300 ${className}`}
      style={dimensions}
    >
      <DocMindLogoIcon className={iconClassName} />
    </div>
  );
}
