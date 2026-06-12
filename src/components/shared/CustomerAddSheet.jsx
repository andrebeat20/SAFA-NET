import React, { useState, useEffect } from 'react';
import { X, User, MapPin, Phone, Package, CreditCard, Save } from 'lucide-react';

export default function CustomerAddSheet({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    package: '10 Mbps',
    price: 150000
  });

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        address: '',
        phone: '',
        package: '10 Mbps',
        price: 150000
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onAdd(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop Overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
      />
      
      {/* Bottom Sheet Container */}
      <div className="relative w-full max-w-lg bg-[var(--bg-secondary)] rounded-t-[32px] sm:rounded-[28px] overflow-hidden shadow-2xl border-t sm:border border-[var(--border-color)] transition-colors duration-500 max-h-[90vh] flex flex-col z-10">
        
        {/* Header (Sticky) */}
        <div className="p-5 flex justify-between items-center border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/90 backdrop-blur-md z-20 shrink-0">
          <div>
            <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight transition-colors">Tambah Pelanggan</h2>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">Masukkan data pelanggan baru</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto scrollbar-hide flex-1">
          <form id="customer-add-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Informasi Utama */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-3 bg-brand rounded-full"></div>
                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Data Diri</h3>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nama Lengkap *</label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-brand" />
                    <input 
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-xs font-bold text-[var(--text-primary)] focus:border-brand transition-colors outline-none"
                      placeholder="Nama Pelanggan"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Alamat Pemasangan</label>
                  <div className="relative group">
                    <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-brand" />
                    <input 
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-xs font-bold text-[var(--text-primary)] focus:border-brand transition-colors outline-none"
                      placeholder="Contoh: RT 01 RW 02"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nomor WhatsApp</label>
                  <div className="relative group">
                    <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-brand" />
                    <input 
                      name="phone"
                      type="tel"
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

          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] flex gap-3 shrink-0">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button 
            form="customer-add-form"
            type="submit"
            className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl bg-brand text-white text-xs font-bold uppercase tracking-wider hover:brightness-110 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Simpan Pelanggan Baru
          </button>
        </div>
      </div>
    </div>
  );
}
