import React from 'react';
import { Search } from 'lucide-react';
import clsx from 'clsx';

export default function FieldEmptyState({ searchTerm, statusFilter }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      {searchTerm ? (
        <>
          <div className="w-24 h-24 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[32px] flex items-center justify-center mb-6 rotate-3 transition-colors shadow-sm">
            <Search className="w-12 h-12 text-slate-400 dark:text-slate-600" />
          </div>
          <h3 className="text-2xl font-black text-[var(--text-primary)] transition-colors">Tidak ditemukan</h3>
          <p className="text-[15px] font-bold text-slate-500 dark:text-slate-400 mt-2">Coba kata kunci pencarian lain.</p>
        </>
      ) : (
         <>
          <div className={clsx(
            "w-28 h-28 rounded-full flex items-center justify-center mb-8 shadow-2xl transition-all duration-500",
            statusFilter === 'Belum Bayar' ? "bg-emerald-100 dark:bg-emerald-500/10 shadow-emerald-500/20" : "bg-slate-100 dark:bg-slate-800 shadow-slate-500/10"
          )}>
            <span className="text-5xl">{statusFilter === 'Belum Bayar' ? '🎉' : '📂'}</span>
          </div>
          <h3 className="text-3xl font-black text-[var(--text-primary)] transition-colors">
            {statusFilter === 'Belum Bayar' ? 'Semua Lunas!' : 'Kosong'}
          </h3>
          <p className="text-[15px] font-bold text-slate-500 dark:text-slate-400 max-w-[240px] mt-3">
            {statusFilter === 'Belum Bayar' 
              ? 'Tidak ada tunggakan untuk bulan ini. Kerja bagus!' 
              : 'Belum ada pelanggan yang melunasi tagihan.'}
          </p>
        </>
      )}
    </div>
  );
}
