import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function LaporanProgress({ summary }) {
  return (
    <div className="bg-[var(--bg-secondary)] rounded-[32px] p-8 shadow-xl border border-[var(--border-color)] mb-8 relative overflow-hidden transition-colors">
      <div className="absolute top-0 right-0 w-48 h-48 bg-brand/5 dark:bg-brand/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      
      <div className="flex justify-between items-end mb-6 relative z-10">
        <div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] mb-2 px-1">Progress Penagihan</p>
          <h3 className="text-4xl font-black text-[var(--text-primary)] tracking-tighter transition-colors">{summary.persentase.toFixed(1)}%</h3>
        </div>
        <div className="bg-brand/10 dark:bg-brand/20 p-3 rounded-2xl">
          <CheckCircle2 className="w-8 h-8 text-brand" />
        </div>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-full overflow-hidden relative z-10 shadow-inner transition-colors">
        <div 
          className="bg-gradient-to-r from-brand-light to-brand h-full transition-all duration-1000 ease-out rounded-full shadow-lg shadow-brand/20"
          style={{ width: `${summary.persentase}%` }}
        />
      </div>
    </div>
  );
}
