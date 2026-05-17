import React, { useState, useMemo } from 'react';
import { Wifi, LogOut, Loader2, ChevronDown, Calendar, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopBar({ customMonth, isAdmin, onMonthChange, isDarkMode, toggleDarkMode }) {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  
  const currentMonth = customMonth;

  // Generate last 6 months + next month
  const months = useMemo(() => {
    const list = [];
    const date = new Date();
    date.setMonth(date.getMonth() + 1); // Start from next month
    
    for (let i = 0; i < 8; i++) {
      list.push(new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(date).toUpperCase());
      date.setMonth(date.getMonth() - 1);
    }
    return list;
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
  };

  const handleMonthSelect = (m) => {
    onMonthChange(m);
    setShowPicker(false);
  };

  return (
    <header className="sticky top-0 z-50 glass border-b-0 shadow-sm transition-all duration-500">
      <div className="flex items-center justify-between px-5 h-20">
        <div className="flex items-center gap-3">
          <div className="bg-brand text-white p-2.5 rounded-2xl shadow-lg shadow-brand/30">
            <Wifi className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight text-[var(--text-primary)] leading-none transition-colors">SAFA.NET</h1>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Billing System</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleDarkMode}
            className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-yellow-400 rounded-xl transition-all hover:scale-110 active:scale-95"
            title={isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Month Selector Button */}
          <div className="relative">
            <button 
              onClick={() => setShowPicker(!showPicker)}
              className="flex items-center gap-2 bg-brand/10 dark:bg-brand/20 px-3 py-1.5 rounded-xl text-[11px] font-black text-brand border border-brand/20 uppercase tracking-wide transition-all active:scale-95"
            >
              <Calendar className="w-3.5 h-3.5" />
              {currentMonth}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showPicker ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showPicker && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)}></div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-[var(--bg-secondary)] rounded-2xl shadow-2xl border border-[var(--border-color)] overflow-hidden z-50 py-2 transition-colors"
                  >
                    <div className="px-4 py-2 border-b border-[var(--border-color)] mb-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilih Bulan</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto scrollbar-hide">
                      {months.map(m => (
                        <button
                          key={m}
                          onClick={() => handleMonthSelect(m)}
                          className={`w-full px-4 py-3 text-left text-xs font-bold transition-colors flex items-center justify-between ${
                            currentMonth === m ? 'bg-brand/5 text-brand' : 'text-[var(--text-primary)] hover:bg-[var(--border-color)]'
                          }`}
                        >
                          {m}
                          {currentMonth === m && <div className="w-1.5 h-1.5 rounded-full bg-brand"></div>}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-10 h-10 flex items-center justify-center bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-500 rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            title="Keluar"
          >
            {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
