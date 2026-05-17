import React, { useState, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import CustomerCard from '../components/customer/CustomerCard';
import { useAuth } from '../hooks/useAuth';
import clsx from 'clsx';
import FieldHeader from '../components/field/FieldHeader';
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
    <div className="pb-24 flex flex-col min-h-screen bg-transparent">
      <FieldHeader 
        user={user}
        customMonth={customMonth}
        onMonthChange={onMonthChange}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isLoggingOut={isLoggingOut}
        onLogout={handleLogout}
      />

      {/* Customer List */}
      <div className="flex-1 px-5 py-10 animate-fade-in-up">
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
