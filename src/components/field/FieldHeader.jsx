import React, { useState, useMemo } from 'react';
import { Search, LogOut, Loader2, Calendar, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FieldHeader({ 
  user, 
  customMonth, 
  onMonthChange, 
  searchTerm, 
  setSearchTerm,
  isLoggingOut,
  onLogout
}) {
  const [showPicker, setShowPicker] = useState(false);

  // Daftar periode bulan MEI - DESEMBER 2026
  const months = useMemo(() => {
    return [
      'MEI 2026',
      'JUNI 2026',
      'JULI 2026',
      'AGUSTUS 2026',
      'SEPTEMBER 2026',
      'OKTOBER 2026',
      'NOVEMBER 2026',
      'DESEMBER 2026'
    ];
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-brand dark:bg-brand-dark text-white shadow-xl rounded-b-[40px] overflow-hidden transition-colors duration-500">
      {/* Abstract background blobs for header */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 dark:bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-light/20 dark:bg-brand-light/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="relative px-6 pt-12 pb-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-brand-light text-[11px] font-black mb-1.5 tracking-[0.2em] uppercase opacity-90">Halo, {user?.name}</p>
            <h1 className="text-4xl font-black tracking-tighter leading-none">Tugas Hari Ini</h1>
          </div>
          <button 
            onClick={onLogout}
            disabled={isLoggingOut}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all backdrop-blur-md disabled:opacity-50 active:scale-90"
          >
            {isLoggingOut ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <LogOut className="w-5 h-5 text-white" />}
          </button>
        </div>

        {/* Month Selector Pill */}
        <div className="relative mb-8">
          <button 
            onClick={() => setShowPicker(!showPicker)}
            className="flex items-center gap-2 bg-white/10 dark:bg-white/5 px-5 py-2.5 rounded-full text-[11px] font-black text-white border border-white/20 uppercase tracking-[0.15em] transition-all active:scale-95"
          >
            <Calendar className="w-4 h-4" />
            Bulan: {customMonth}
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showPicker ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)}></div>
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute left-0 mt-3 w-64 bg-[var(--bg-secondary)] rounded-[32px] shadow-2xl border border-[var(--border-color)] overflow-hidden z-50 p-2 transition-colors"
                >
                  <div className="px-4 py-3 mb-1 border-b border-[var(--border-color)]">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilih Periode Tagihan</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto scrollbar-hide space-y-1 py-1">
                    {months.map(m => (
                      <button
                        key={m}
                        onClick={() => {
                          onMonthChange(m);
                          setShowPicker(false);
                        }}
                        className={`w-full px-4 py-4 text-left text-[13px] font-black transition-all rounded-2xl flex items-center justify-between uppercase tracking-wider ${
                          customMonth === m ? 'bg-brand text-white shadow-xl shadow-brand/30' : 'text-[var(--text-primary)] hover:bg-[var(--border-color)]'
                        }`}
                      >
                        {m}
                        {customMonth === m && <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Large Search Bar */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-brand/60 group-focus-within:text-brand transition-colors" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-16 pr-6 py-5 bg-white dark:bg-slate-900 border-0 text-slate-900 dark:text-white rounded-[24px] shadow-2xl ring-4 ring-transparent focus:ring-brand-light/30 placeholder:text-slate-400 text-lg transition-all font-bold"
            placeholder="Cari nama pelanggan..."
          />
        </div>
      </div>
    </header>
  );
}
