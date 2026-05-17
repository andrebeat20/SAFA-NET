import React from 'react';

export default function LaporanBreakdown({ summary }) {
  return (
    <div className="mb-10 px-1">
      <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 px-1">Rincian Metode Terkumpul</h3>
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] text-center hover:scale-[1.02] hover:shadow-md transition-all flex flex-col justify-between min-h-[90px]">
          <p className="text-[10px] text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider leading-tight">Tunai Keliling</p>
          <p className="font-black text-[13px] text-[var(--text-primary)] mt-2">Rp {(summary.breakdown?.keliling || 0).toLocaleString('id-ID')}</p>
        </div>
        
        <div className="p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] text-center hover:scale-[1.02] hover:shadow-md transition-all flex flex-col justify-between min-h-[90px]">
          <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider leading-tight">Tunai Kantor</p>
          <p className="font-black text-[13px] text-[var(--text-primary)] mt-2">Rp {(summary.breakdown?.kantor || 0).toLocaleString('id-ID')}</p>
        </div>
        
        <div className="p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] text-center hover:scale-[1.02] hover:shadow-md transition-all flex flex-col justify-between min-h-[90px]">
          <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider leading-tight">Total Transfer</p>
          <p className="font-black text-[13px] text-[var(--text-primary)] mt-2">Rp {(summary.breakdown?.transfer || 0).toLocaleString('id-ID')}</p>
        </div>
      </div>
    </div>
  );
}
