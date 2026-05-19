import React from 'react';

export default function MeshBackground() {
  return (
    <div className="absolute inset-0 bg-[var(--bg-primary)] z-0 overflow-hidden pointer-events-none transition-colors duration-500">
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-brand/10 dark:bg-brand/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-brand-light/20 dark:bg-brand-light/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse-slow" style={{animationDelay: '2s'}}></div>
    </div>
  );
}
