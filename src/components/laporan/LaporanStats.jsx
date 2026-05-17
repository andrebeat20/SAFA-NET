import React from 'react';
import clsx from 'clsx';

export default function LaporanStats({ summary }) {
  const stats = [
    { label: 'Total Pelanggan', value: summary.totalCustomers, color: 'text-brand', isCount: true },
    { label: 'Total Penagihan', value: summary.totalTagihan, color: 'text-gray-900' },
    { label: 'Total Terkumpul', value: summary.terkumpul, color: 'text-green-600' },
    { label: 'Sisa Belum Bayar', value: summary.sisaPiutang, color: 'text-red-600' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 mb-8 px-1">
      {stats.map((stat, i) => (
        <div key={i} className="flex justify-between items-center p-5 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all group">
          <span className="text-[14px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{stat.label}</span>
          <span className={clsx("font-black text-xl transition-colors", stat.color.includes('gray-900') ? 'text-[var(--text-primary)]' : stat.color)}>
            {stat.isCount ? `${stat.value} User` : `Rp ${stat.value.toLocaleString('id-ID')}`}
          </span>
        </div>
      ))}
    </div>
  );
}
