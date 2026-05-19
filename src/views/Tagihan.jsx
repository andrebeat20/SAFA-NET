import React, { useState, useMemo } from 'react';
import CustomerCard from '../components/customer/CustomerCard';
import { AlertCircle, Bike, CreditCard, Building2, Search, X } from 'lucide-react';

export default function Tagihan({ customers, onPayment, currentMonth, onGenerate, isSyncing, isAdmin }) {
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Get all static unpaid customers for empty check
  const unpaidCustomers = useMemo(() => {
    return customers.filter(c => c.status === 'Belum Bayar');
  }, [customers]);

  // 2. Dynamically filter unpaid customers by search term
  const filteredUnpaid = useMemo(() => {
    if (!searchTerm) return unpaidCustomers;
    const lowerSearch = searchTerm.toLowerCase();
    return unpaidCustomers.filter(c => 
      c.name.toLowerCase().includes(lowerSearch) || 
      (c.address && c.address.toLowerCase().includes(lowerSearch)) ||
      (c.phone && c.phone.includes(lowerSearch))
    );
  }, [unpaidCustomers, searchTerm]);

  if (customers.length === 0) {
    return (
      <div className="pb-24 pt-6 px-4 font-outfit">
        <div className="px-5 py-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-rose-100 dark:bg-rose-500/20 p-3 rounded-2xl text-rose-500">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-3xl font-black text-[var(--text-primary)] transition-colors">Tagihan</h2>
          </div>

          <div className="flex flex-col items-center justify-center py-20 text-center transition-all animate-fade-in-up">
            <div className="w-28 h-28 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-rose-500/5">
              <span className="text-5xl">📅</span>
            </div>
            <h3 className="text-2xl font-black text-[var(--text-primary)] transition-colors">Belum Ada Tagihan</h3>
            <p className="text-[14px] font-bold text-slate-500 dark:text-slate-400 max-w-[280px] mt-3 leading-relaxed">
              Data tagihan untuk periode <span className="text-rose-500 font-extrabold">{currentMonth}</span> belum dibuat di Google Spreadsheet.
            </p>
            
            {onGenerate && (
              <button
                onClick={() => onGenerate(currentMonth)}
                disabled={isSyncing}
                className="mt-8 px-8 py-4 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white rounded-[24px] font-black uppercase tracking-wider text-xs shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 active:scale-95 transition-all flex items-center gap-3"
              >
                {isSyncing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  `Generate Tagihan ${currentMonth}`
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-6 px-4 font-outfit">
      <div className="px-5 py-6">
        
        {/* Title and Generator Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-rose-100 dark:bg-rose-500/20 p-3 rounded-2xl text-rose-500">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-3xl font-black text-[var(--text-primary)] transition-colors">Daftar Tunggakan</h2>
          </div>
          
          {onGenerate && (
            <button
              onClick={() => {
                const confirmGen = window.confirm(`Apakah Anda yakin ingin mengenerate ulang / menyelaraskan tagihan periode ${currentMonth}?`);
                if (confirmGen) onGenerate(currentMonth);
              }}
              disabled={isSyncing}
              className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95"
            >
              {isSyncing ? 'Loading...' : 'Generate'}
            </button>
          )}
        </div>

        {unpaidCustomers.length > 0 ? (
          <div className="space-y-6">
            
            {/* Unpaid Counter Info */}
            <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 p-4 rounded-2xl transition-colors">
              <p className="text-[12px] text-rose-800 dark:text-rose-400 font-bold">
                Ada {unpaidCustomers.length} pelanggan yang belum melakukan pembayaran bulan ini.
              </p>
            </div>

            {/* Premium Search Box */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-brand transition-colors" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-10 py-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 text-[var(--text-primary)] rounded-2xl focus:ring-4 focus:ring-brand/10 focus:border-brand focus:bg-white dark:focus:bg-slate-950 transition-all text-xs font-semibold outline-none"
                placeholder="Cari nama, alamat, atau no HP..."
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Unpaid Filtered List */}
            {filteredUnpaid.length > 0 ? (
              <div className="space-y-8 pt-2">
                {filteredUnpaid.map(customer => (
                  <div key={customer.id} className="space-y-4">
                    <CustomerCard 
                      customer={customer} 
                      onClick={() => {}} // Disabled click since we have buttons
                    />
                    <div className="grid grid-cols-3 gap-3 px-1">
                      <button 
                        onClick={() => onPayment(customer.id, 'Keliling')}
                        className="flex flex-col items-center gap-2 py-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-[24px] text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-all active:scale-95 cursor-pointer"
                      >
                        <Bike className="w-6 h-6" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Keliling</span>
                      </button>
                      <button 
                        onClick={() => onPayment(customer.id, 'Transfer')}
                        className="flex flex-col items-center gap-2 py-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-[24px] text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all active:scale-95 cursor-pointer"
                      >
                        <CreditCard className="w-6 h-6" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Transfer</span>
                      </button>
                      <button 
                        onClick={() => onPayment(customer.id, 'Tunai Kantor')}
                        className="flex flex-col items-center gap-2 py-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-[24px] text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all active:scale-95 cursor-pointer"
                      >
                        <Building2 className="w-6 h-6" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Tunai</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="text-4xl mb-3">🔍</span>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tidak Ada Hasil Pencarian</p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">Coba cari dengan kata kunci nama atau detail lain.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-28 text-center transition-all animate-fade-in-up">
            <div className="w-28 h-28 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/10">
              <span className="text-5xl">🎉</span>
            </div>
            <h3 className="text-2xl font-black text-[var(--text-primary)] transition-colors">Semua Lunas!</h3>
            <p className="text-[15px] font-bold text-slate-500 dark:text-slate-400 max-w-[240px] mt-3">
              Tidak ada tunggakan untuk bulan ini. Kerja bagus!
            </p>
            
            {onGenerate && (
              <button
                onClick={() => {
                  const confirmGen = window.confirm(`Apakah Anda yakin ingin mengenerate ulang / menyelaraskan tagihan periode ${currentMonth}?`);
                  if (confirmGen) onGenerate(currentMonth);
                }}
                disabled={isSyncing}
                className="mt-6 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-2xl font-black uppercase tracking-wider text-[10px] transition-all active:scale-95"
              >
                {isSyncing ? 'Loading...' : 'Generate Ulang'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
