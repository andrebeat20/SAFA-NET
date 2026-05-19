import React, { useState, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import CustomerCard from '../components/customer/CustomerCard';
import { useAuth } from '../hooks/useAuth';
import clsx from 'clsx';
import { Search, X } from 'lucide-react';
import FieldEmptyState from '../components/field/FieldEmptyState';

export default function FieldDashboard({ customers, onCustomerClick, customMonth, onMonthChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Belum Bayar'); // Belum Bayar, Lunas
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout, user, isTeknisi } = useAuth();

  const filteredCustomers = useMemo(() => {
    // Jika Teknisi, gunakan filter status. Jika Petugas, default Belum Bayar.
    const baseCustomers = isTeknisi 
      ? customers.filter(c => c.status === statusFilter)
      : customers.filter(c => c.status === 'Belum Bayar');

    if (!debouncedSearchTerm) return baseCustomers;
    
    const lowerSearch = debouncedSearchTerm.toLowerCase();
    return baseCustomers.filter(c => 
      c.name.toLowerCase().includes(lowerSearch) || 
      c.id.toLowerCase().includes(lowerSearch)
    );
  }, [customers, debouncedSearchTerm, statusFilter, isTeknisi]);



  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
  };

  return (
    <div className="pb-24 px-4 font-outfit">
      <div className="px-5 py-6 animate-fade-in-up">
        
        {/* Search Bar */}
        <div className="relative group mb-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-brand transition-colors" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-10 py-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 text-[var(--text-primary)] rounded-2xl focus:ring-4 focus:ring-brand/10 focus:border-brand focus:bg-white dark:focus:bg-slate-950 transition-all text-xs font-semibold outline-none"
            placeholder="Cari nama pelanggan..."
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-[var(--text-primary)] flex items-center gap-2 transition-colors">
            {isTeknisi ? `${statusFilter.toUpperCase()}` : 'Daftar Tagihan'}
            <span className={clsx(
              "text-[10px] px-3 py-1 rounded-lg font-black tracking-tighter transition-colors",
              statusFilter === 'Belum Bayar' ? "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400" : "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
            )}>
              {filteredCustomers.length}
            </span>
          </h2>

          {isTeknisi && (
            <div className="flex bg-[var(--bg-secondary)] border border-[var(--border-color)] p-1.5 rounded-2xl transition-colors">
              <button 
                onClick={() => setStatusFilter('Belum Bayar')}
                className={clsx(
                  "px-4 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest",
                  statusFilter === 'Belum Bayar' ? "bg-brand text-white shadow-lg shadow-brand/20" : "text-slate-400"
                )}
              >
                BELUM
              </button>
              <button 
                onClick={() => setStatusFilter('Lunas')}
                className={clsx(
                  "px-4 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest",
                  statusFilter === 'Lunas' ? "bg-brand text-white shadow-lg shadow-brand/20" : "text-slate-400"
                )}
              >
                LUNAS
              </button>
            </div>
          )}
        </div>

        {filteredCustomers.length > 0 ? (
          <div className="space-y-5">
            {filteredCustomers.map(customer => (
              <CustomerCard 
                key={customer.id} 
                customer={customer} 
                onClick={onCustomerClick}
              />
            ))}
          </div>
        ) : (
          <FieldEmptyState searchTerm={searchTerm} statusFilter={statusFilter} />
        )}
      </div>
    </div>
  );
}
