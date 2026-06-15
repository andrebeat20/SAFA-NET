import React, { useState, useMemo } from 'react';
import { Wifi, LogOut, Loader2, ChevronDown, Calendar, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function TopBar({ customMonth, isAdmin, onMonthChange, isDarkMode, toggleDarkMode }) {
  const { logout, appName, appLogo } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  
  const currentMonth = customMonth;

  // Generate dynamic month list (1 month ago to 5 months ahead)
  const months = useMemo(() => {
    const list = [];
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    
    for (let i = 0; i < 7; i++) {
      const monthName = date.toLocaleDateString('id-ID', { month: 'long' }).toUpperCase();
      const year = date.getFullYear();
      list.push(`${monthName} ${year}`);
      date.setMonth(date.getMonth() + 1);
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
          <div className="w-11 h-11 bg-brand/10 text-brand rounded-2xl border border-slate-200/40 dark:border-slate-800/40 shadow-sm flex items-center justify-center overflow-hidden p-1.5 flex-shrink-0">
            {appLogo ? (
              <img src={appLogo} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <Wifi className="w-5 h-5 text-brand" />
            )}
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tight text-[var(--text-primary)] leading-none transition-colors uppercase">{appName}</h1>
            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Billing System</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleDarkMode}
            className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-yellow-400 rounded-xl transition-all hover:scale-110 active:scale-95 cursor-pointer"
            title={isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Month Selector Button */}
          <div className="relative">
            <button 
              onClick={() => setShowPicker(!showPicker)}
              className="flex items-center gap-2 bg-brand/10 dark:bg-brand/20 px-3 py-1.5 rounded-xl text-[11px] font-black text-brand border border-brand/20 uppercase tracking-wide transition-all active:scale-95 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              {currentMonth}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showPicker ? 'rotate-180' : ''}`} />
            </button>

            {showPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)}></div>
                <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-secondary)] rounded-2xl shadow-2xl border border-[var(--border-color)] overflow-hidden z-50 py-2 transition-colors">
                  <div className="px-4 py-2 border-b border-[var(--border-color)] mb-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilih Bulan</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto scrollbar-hide">
                    {months.map(m => (
                      <button
                        key={m}
                        onClick={() => handleMonthSelect(m)}
                        className={`w-full px-4 py-3 text-left text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                          currentMonth === m ? 'bg-brand/5 text-brand' : 'text-[var(--text-primary)] hover:bg-[var(--border-color)]'
                        }`}
                      >
                        {m}
                        {currentMonth === m && <div className="w-1.5 h-1.5 rounded-full bg-brand"></div>}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-10 h-10 flex items-center justify-center bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-500 rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Keluar"
          >
            {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
