import React from 'react';
import CustomerCard from '../components/customer/CustomerCard';
import { AlertCircle, Bike, CreditCard, Building2 } from 'lucide-react';

export default function Tagihan({ customers, onPayment, currentMonth, onGenerate, isSyncing, isAdmin }) {
  const unpaidCustomers = customers.filter(c => c.status === 'Belum Bayar');

  if (customers.length === 0) {
    return (
      <div className="pb-24 pt-6 px-4">
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
    <div className="pb-24 pt-6 px-4">
      <div className="px-5 py-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-rose-100 dark:bg-rose-500/20 p-3 rounded-2xl text-rose-500">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-black text-[var(--text-primary)] transition-colors">Daftar Tunggakan</h2>
        </div>

        {unpaidCustomers.length > 0 ? (
          <div className="space-y-8">
            <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 p-5 rounded-3xl transition-colors">
              <p className="text-[13px] text-rose-800 dark:text-rose-400 font-bold">
                Ada {unpaidCustomers.length} pelanggan yang belum melakukan pembayaran bulan ini.
              </p>
            </div>
            
            <div className="space-y-8">
              {unpaidCustomers.map(customer => (
                <div key={customer.id} className="space-y-4">
                  <CustomerCard 
                    customer={customer} 
                    onClick={() => {}} // Disabled click since we have buttons
                  />
                  <div className="grid grid-cols-3 gap-3 px-1">
                    <button 
                      onClick={() => onPayment(customer.id, 'Keliling')}
                      className="flex flex-col items-center gap-2 py-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-[24px] text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-all active:scale-95"
                    >
                      <Bike className="w-6 h-6" />
                      <span className="text-[10px] font-black uppercase tracking-wider">Keliling</span>
                    </button>
                    <button 
                      onClick={() => onPayment(customer.id, 'Transfer')}
                      className="flex flex-col items-center gap-2 py-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-[24px] text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all active:scale-95"
                    >
                      <CreditCard className="w-6 h-6" />
                      <span className="text-[10px] font-black uppercase tracking-wider">Transfer</span>
                    </button>
                    <button 
                      onClick={() => onPayment(customer.id, 'Tunai Kantor')}
                      className="flex flex-col items-center gap-2 py-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-[24px] text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all active:scale-95"
                    >
                      <Building2 className="w-6 h-6" />
                      <span className="text-[10px] font-black uppercase tracking-wider">Tunai</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
          </div>
        )}
      </div>
    </div>
  );
}
