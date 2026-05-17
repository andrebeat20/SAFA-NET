import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import LaporanProgress from '../components/laporan/LaporanProgress';
import LaporanStats from '../components/laporan/LaporanStats';
import LaporanBreakdown from '../components/laporan/LaporanBreakdown';
import LaporanActions from '../components/laporan/LaporanActions';
import LaporanTable from '../components/laporan/LaporanTable';

export default function Laporan({ summary, onSync, isSyncing, customers, transactions }) {
  return (
    <div className="pb-24">
      <div className="px-4 py-6">
        <h2 className="text-3xl font-black text-[var(--text-primary)] mb-8 transition-colors px-1">Laporan Real-Time</h2>

        <LaporanProgress summary={summary} />
        <LaporanStats summary={summary} />
        <LaporanBreakdown summary={summary} />
        
        <LaporanActions onSync={onSync} isSyncing={isSyncing} />
        
        <LaporanTable customers={customers} transactions={transactions} />

        {/* System Info */}
        <div className="mt-8 p-6 bg-brand/5 dark:bg-brand/10 rounded-3xl border border-brand/10 dark:border-brand/20 transition-colors">
          <div className="flex items-start gap-4">
            <div className="bg-brand/10 dark:bg-brand/20 p-2.5 rounded-xl">
              <FileSpreadsheet className="w-6 h-6 text-brand flex-shrink-0" />
            </div>
            <div>
              <h4 className="font-black text-brand text-sm uppercase tracking-wider">Status Sinkronisasi Otomatis</h4>
              <p className="text-[13px] text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-bold">
                Setiap kali Anda menekan tombol "Lunas", sistem secara otomatis memperbarui baris data di Google Drive melalui Supabase Edge Functions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
