import React from 'react';

export default function MeshBackground() {
  return (
    <div className="absolute inset-0 bg-[var(--bg-primary)] z-0 overflow-hidden pointer-events-none transition-colors duration-500" />
  );
}
