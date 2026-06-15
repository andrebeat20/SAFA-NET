import React from 'react';
import StatCard from '../components/dashboard/StatCard';
import { ArrowUpRight, ArrowDownLeft, Plus } from 'lucide-react';

export default function Dashboard({ summary, transactions, onViewAll, onAddClick, isAdmin }) {
  return (
    <div className="pb-24 pt-6 px-4">
      {/* Action Buttons */}
      {isAdmin && (
        <div className="flex gap-3 px-2 mb-6">
          <button 
            onClick={onAddClick}
            className="flex-1 flex items-center justify-center gap-2 bg-brand text-white py-3.5 rounded-[20px] text-[11px] font-black uppercase tracking-wider hover:brightness-110 shadow-lg shadow-brand/20 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5" />
            Pelanggan Baru
          </button>
        </div>
      )}

      {/* Financial Summary */}
      <section className="mb-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 px-2 transition-colors">Ringkasan Bulan Ini</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 pt-2 px-2 -mx-2 snap-x snap-mandatory scrollbar-hide">
          <StatCard title="Total Tagihan" amount={summary.totalTagihan} type="total" />
          <StatCard title="Terkumpul" amount={summary.terkumpul} type="terkumpul" />
          <StatCard title="Sisa Belum Bayar" amount={summary.sisaPiutang} type="sisa" />
        </div>
      </section>

      {/* Payment Method Breakdown Grid */}
      <div className="grid grid-cols-3 gap-3 mb-8 px-2">
        <div className="bg-[var(--bg-secondary)] p-3 py-4 rounded-2xl border border-[var(--border-color)] shadow-sm text-center transition-colors">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Keliling</p>
          <p className="text-[13px] font-black text-[var(--text-primary)] leading-tight transition-colors">
            Rp {summary.breakdown.keliling.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-[var(--bg-secondary)] p-3 py-4 rounded-2xl border border-[var(--border-color)] shadow-sm text-center transition-colors">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Kantor</p>
          <p className="text-[13px] font-black text-[var(--text-primary)] leading-tight transition-colors">
            Rp {summary.breakdown.kantor.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-[var(--bg-secondary)] p-3 py-4 rounded-2xl border border-[var(--border-color)] shadow-sm text-center transition-colors">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Transfer</p>
          <p className="text-[13px] font-black text-[var(--text-primary)] leading-tight transition-colors">
            Rp {summary.breakdown.transfer.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <section className="px-2 pb-6">
        <div className="flex justify-between items-end mb-5">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)] transition-colors">Aktivitas Terbaru</h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Pembayaran yang masuk</p>
          </div>
          <button 
            onClick={onViewAll}
            className="text-sm font-bold text-brand hover:text-brand-dark transition-colors"
          >
            Lihat Semua
          </button>
        </div>
        
        <div className="space-y-3">
          {transactions.map(tx => (
            <div key={tx.id} className="bg-[var(--bg-secondary)] p-4 rounded-[20px] border border-[var(--border-color)] flex justify-between items-center shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <ArrowDownLeft className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h4 className="font-bold text-[var(--text-primary)] text-[15px] mb-0.5 transition-colors">{tx.customer_name}</h4>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                    {new Date(tx.date + (!tx.date.includes('Z') && !tx.date.includes('+') ? 'Z' : '')).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} • {tx.method}
                  </p>
                </div>
              </div>
              <div className="font-black text-emerald-500 text-base">
                +Rp {tx.amount.toLocaleString('id-ID')}
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="text-center py-10 bg-[var(--bg-secondary)]/50 backdrop-blur-sm rounded-[24px] border border-[var(--border-color)] border-dashed transition-colors">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors">
                <ArrowDownLeft className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Belum ada aktivitas</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
