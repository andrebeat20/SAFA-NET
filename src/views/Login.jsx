import React, { useState } from 'react';
import { Wifi, LogIn, Lock, User, Loader2, Sun, Moon, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Login({ isDarkMode, toggleDarkMode }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, appName, appLogo, isDemoMode } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await login(username, password);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col justify-center px-6 py-12 relative overflow-hidden font-outfit transition-colors duration-500">
      {/* Floating Theme Toggle */}
      <button
        type="button"
        onClick={toggleDarkMode}
        className="absolute top-6 right-6 p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 text-slate-600 dark:text-slate-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 backdrop-blur-md z-50 cursor-pointer"
        aria-label="Toggle Theme"
      >
        {isDarkMode ? <Sun className="w-5 h-5 text-amber-500 animate-spin" style={{ animationDuration: '10s' }} /> : <Moon className="w-5 h-5 text-indigo-600" />}
      </button>

      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-80 h-80 bg-brand/10 dark:bg-brand/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-brand-light/20 dark:bg-brand-light/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse-slow" style={{animationDelay: '2s'}}></div>
      
      <div className="relative z-10 w-full max-w-sm mx-auto">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-[500px] h-[500px] max-w-full mb-5 overflow-hidden bg-transparent">
            {appLogo ? (
              <img src={appLogo} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <Wifi className="w-40 h-40 text-brand animate-pulse" style={{ animationDuration: '2s' }} />
            )}
          </div>
          
          <h1 className="text-4xl font-extrabold text-[var(--text-primary)] tracking-tight transition-colors uppercase">
            {appName}
          </h1>
          
          <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.25em]">
            Billing Management System
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/70 dark:bg-slate-900/60 py-9 px-8 shadow-2xl rounded-[32px] border border-slate-200/30 dark:border-slate-800/30 backdrop-blur-xl transition-all">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* ID Petugas / Username Field */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
                Username / ID Pengguna
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 group-focus-within:text-brand transition-colors" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 text-[var(--text-primary)] rounded-2xl focus:ring-4 focus:ring-brand/10 focus:border-brand focus:bg-white dark:focus:bg-slate-950 transition-all text-[15px] font-medium disabled:opacity-50 outline-none"
                  placeholder="Masukkan username Anda..."
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
                Kata Sandi
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-brand transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="block w-full pl-11 pr-12 py-3.5 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 text-[var(--text-primary)] rounded-2xl focus:ring-4 focus:ring-brand/10 focus:border-brand focus:bg-white dark:focus:bg-slate-950 transition-all text-[15px] font-medium disabled:opacity-50 outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3.5 px-4 rounded-2xl shadow-lg shadow-brand/10 dark:shadow-none text-[15px] font-bold tracking-wider text-white bg-gradient-to-r from-brand to-brand-dark hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-3" />
                    MASUK SISTEM
                  </>
                )}
              </button>
            </div>
          </form>
          
          {/* Elegant Dynamic Hints */}
          {isDemoMode ? (
            <div className="mt-8 text-center p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <span className="inline-block text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest leading-relaxed">
                ⚠️ MODE DEMO AKTIF:<br />ketik <span className="text-brand font-extrabold">"admin"</span> / <span className="text-brand font-extrabold">"teknisi"</span> untuk demo.<br />
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 normal-case mt-1 block">Silakan jalankan file `init_db.sql` di Supabase SQL Editor Anda untuk masuk mode riil.</span>
              </span>
            </div>
          ) : (
            <div className="mt-8 text-center">
              <span className="inline-block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-relaxed">
                🔐 SILAKAN MASUK MENGGUNAKAN KREDENSIAL AKUN YANG TELAH DIBUAT OLEH ADMINISTRATOR.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
