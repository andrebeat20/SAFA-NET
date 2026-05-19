import React, { useState, useEffect } from 'react';
import { X, User, MapPin, Phone, Package, CreditCard, Save, Trash2, Calendar } from 'lucide-react';

export default function CustomerDetailSheet({ isOpen, onClose, customer, onUpdate, onDelete }) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    package: '',
    price: 0
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        address: customer.address || '',
        phone: customer.phone || '',
        package: customer.package || '',
        price: customer.price || 0
      });
    }
  }, [customer]);

  if (!isOpen || !customer) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({ ...customer, ...formData });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop (Flat Overlay - No Blur) */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 transition-opacity duration-200"
      />
      
      {/* Sheet Container */}
      <div className="relative w-full max-w-lg bg-[var(--bg-primary)] rounded-t-[32px] sm:rounded-[28px] shadow-2xl overflow-hidden border-t sm:border border-[var(--border-color)] max-h-[92vh] sm:max-h-[85vh] flex flex-col transition-all duration-200 translate-y-0">
        
        {/* Simplified Header */}
        <div className="bg-brand p-5 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">{formData.name || 'Edit Pelanggan'}</h2>
              <p className="text-white/60 text-[9px] font-bold uppercase tracking-wider mt-0.5">ID: {customer.id}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 bg-white/15 hover:bg-white/25 rounded-lg flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-hide">
          <form id="customer-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Informasi Dasar */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-3 bg-brand rounded-full"></div>
                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Informasi Dasar</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nama Lengkap</label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-brand" />
                    <input 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-xs font-bold text-[var(--text-primary)] focus:border-brand transition-colors outline-none"
                      placeholder="Contoh: Budi Santoso"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Alamat Pemasangan</label>
                  <div className="relative group">
                    <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-brand" />
                    <textarea 
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="2"
                      className="w-full pl-10 pr-3 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-xs font-bold text-[var(--text-primary)] focus:border-brand transition-colors outline-none resize-none"
                      placeholder="Jl. Merdeka No. 123..."
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nomor WhatsApp</label>
                  <div className="relative group">
                    <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-brand" />
                    <input 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-xs font-bold text-[var(--text-primary)] focus:border-brand transition-colors outline-none"
                      placeholder="0812..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Layanan & Paket */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-3 bg-brand rounded-full"></div>
                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Layanan & Paket</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Paket Internet</label>
                  <div className="relative group">
                    <Package className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-brand" />
                    <input 
                      name="package"
                      value={formData.package}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-xs font-bold text-[var(--text-primary)] focus:border-brand transition-colors outline-none"
                      placeholder="10 Mbps"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Harga (Rp)</label>
                  <div className="relative group">
                    <CreditCard className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-brand" />
                    <input 
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-xs font-bold text-[var(--text-primary)] focus:border-brand transition-colors outline-none"
                      placeholder="150000"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Status Card (Read Only) */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${customer.status === 'Lunas' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status Pembayaran</p>
                  <p className="text-xs font-black text-[var(--text-primary)] transition-colors">{customer.status}</p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] flex gap-3 shrink-0">
          <button 
            type="button"
            onClick={() => onDelete(customer.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider hover:bg-rose-100 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Hapus
          </button>
          <button 
            form="customer-form"
            type="submit"
            className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl bg-brand text-white text-xs font-bold uppercase tracking-wider hover:brightness-110 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}
