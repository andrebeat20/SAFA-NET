import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  if (!customer) return null;

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
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md z-[80]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-[var(--bg-primary)] rounded-t-[40px] p-0 z-[90] h-[92vh] flex flex-col shadow-2xl overflow-hidden border-t border-[var(--border-color)]"
          >
            {/* Header Area */}
            <div className="bg-brand p-8 text-white relative">
               <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
               <div className="flex justify-between items-start relative z-10">
                 <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-[22px] flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black tracking-tight">{formData.name || 'Detail Pelanggan'}</h2>
                      <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1">ID: {customer.id}</p>
                    </div>
                 </div>
                 <button 
                  onClick={onClose}
                  className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center transition-all"
                 >
                   <X className="w-6 h-6" />
                 </button>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-10 space-y-8 scrollbar-hide">
               <form id="customer-form" onSubmit={handleSubmit} className="space-y-8 pb-10">
                  {/* Basic Info Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1 h-4 bg-brand rounded-full"></div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Informasi Dasar</h3>
                    </div>
                    
                    <div className="grid gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Nama Lengkap</label>
                        <div className="relative group">
                          <User className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-brand transition-colors" />
                          <input 
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl text-[15px] font-bold text-[var(--text-primary)] focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all outline-none"
                            placeholder="Contoh: Budi Santoso"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Alamat Pemasangan</label>
                        <div className="relative group">
                          <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-brand transition-colors" />
                          <textarea 
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows="2"
                            className="w-full pl-12 pr-4 py-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl text-[15px] font-bold text-[var(--text-primary)] focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all outline-none"
                            placeholder="Jl. Merdeka No. 123..."
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Nomor WhatsApp</label>
                        <div className="relative group">
                          <Phone className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-brand transition-colors" />
                          <input 
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl text-[15px] font-bold text-[var(--text-primary)] focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all outline-none"
                            placeholder="0812..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Service Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1 h-4 bg-brand rounded-full"></div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Layanan & Paket</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Paket Internet</label>
                        <div className="relative group">
                          <Package className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-brand transition-colors" />
                          <input 
                            name="package"
                            value={formData.package}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl text-[15px] font-bold text-[var(--text-primary)] focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all outline-none"
                            placeholder="10 Mbps"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Harga (Rp)</label>
                        <div className="relative group">
                          <CreditCard className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-brand transition-colors" />
                          <input 
                            name="price"
                            type="number"
                            value={formData.price}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl text-[15px] font-bold text-[var(--text-primary)] focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all outline-none"
                            placeholder="150000"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Card (Read Only) */}
                  <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 flex justify-between items-center transition-colors">
                     <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${customer.status === 'Lunas' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                           <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Pembayaran</p>
                          <p className="text-[15px] font-black text-[var(--text-primary)] transition-colors">{customer.status}</p>
                        </div>
                     </div>
                  </div>
               </form>
            </div>

            {/* Footer Actions */}
            <div className="p-8 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] flex gap-4 transition-colors">
               <button 
                type="button"
                onClick={() => onDelete(customer.id)}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-[22px] bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-black uppercase tracking-widest hover:bg-rose-100 active:scale-95 transition-all"
               >
                 <Trash2 className="w-5 h-5" />
                 Hapus
               </button>
               <button 
                form="customer-form"
                type="submit"
                className="flex-[2] flex items-center justify-center gap-3 py-4 rounded-[22px] bg-brand text-white font-black uppercase tracking-widest shadow-xl shadow-brand/30 hover:bg-brand-dark active:scale-95 transition-all"
               >
                 <Save className="w-5 h-5" />
                 Simpan Perubahan
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
