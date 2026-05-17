import React from 'react';
import { RefreshCcw, Download } from 'lucide-react';
import clsx from 'clsx';

export default function LaporanActions({ onSync, isSyncing }) {
  return (
    <div className="space-y-4 px-1">
      <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 px-1">Integrasi Google Sheets</h3>
      <button
        onClick={onSync}
        disabled={isSyncing}
        className={clsx(
          "w-full flex items-center justify-center gap-3 py-4.5 rounded-[22px] font-black uppercase tracking-widest transition-all",
          isSyncing 
            ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed" 
            : "bg-emerald-600 dark:bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 active:scale-95"
        )}
      >
        <RefreshCcw className={clsx("w-5 h-5", isSyncing && "animate-spin")} />
        {isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Ulang ke Excel'}
      </button>
      
      <button className="w-full flex items-center justify-center gap-3 py-4.5 rounded-[22px] font-black uppercase tracking-widest border-2 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all">
        <Download className="w-5 h-5" />
        Download Rekap PDF
      </button>
    </div>
  );
}
