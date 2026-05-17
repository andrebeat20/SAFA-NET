import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import CustomerCard from '../components/customer/CustomerCard';
import { toast } from 'sonner';

export default function Customers({ customers, onCustomerClick }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('Semua'); // Semua, Lunas, Belum Bayar

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'Semua' ? true : c.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="pb-24">
      {/* Static Header with Search */}
      <div className="bg-transparent px-5 py-6 space-y-5">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand transition-colors" />
          <input 
            type="text" 
            placeholder="Cari nama atau alamat..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-4 bg-[var(--bg-secondary)]/80 backdrop-blur-sm border border-[var(--border-color)] rounded-[20px] shadow-sm focus:bg-[var(--bg-secondary)] focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all text-[15px] font-medium placeholder:text-slate-400 text-[var(--text-primary)]"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 -mb-2 scrollbar-hide">
          {['Semua', 'Belum Bayar', 'Lunas'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all active:scale-95 ${
                filter === f 
                  ? 'bg-brand text-white shadow-xl shadow-brand/30' 
                  : 'bg-[var(--bg-secondary)] text-slate-500 border border-[var(--border-color)] hover:bg-[var(--border-color)]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Customer List */}
      <div className="px-5 py-4 space-y-5 animate-fade-in-up">
        {filteredCustomers.map(customer => (
          <CustomerCard 
            key={customer.id} 
            customer={customer} 
            onClick={onCustomerClick}
            onEdit={(c) => onCustomerClick(c)} // Also open detail on edit icon click
          />
        ))}
        {filteredCustomers.length === 0 && (
          <div className="text-center text-slate-400 dark:text-slate-500 text-[15px] font-medium py-20">
            <div className="w-20 h-20 bg-[var(--bg-secondary)] rounded-[28px] flex items-center justify-center mx-auto mb-5 rotate-3 border border-[var(--border-color)] transition-colors">
              <Search className="w-10 h-10 text-slate-300 dark:text-slate-700" />
            </div>
            Pelanggan tidak ditemukan
          </div>
        )}
      </div>
    </div>
  );
}
