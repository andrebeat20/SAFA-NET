import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bike, CreditCard, Building2, CheckCircle2, Loader2 } from 'lucide-react';

export default function PaymentBottomSheet({ isOpen, onClose, customer, onPay }) {
  const [selectedMethod, setSelectedMethod] = useState('Keliling');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedMethod('Keliling');
      setIsSubmitting(false);
      setIsSuccess(false);
    }
  }, [isOpen]);

  if (!customer) return null;

  const paymentMethods = [
    { id: 'Keliling', label: 'Bayar Keliling', icon: Bike, color: 'bg-orange-100 text-orange-600 border-orange-200' },
    { id: 'Transfer', label: 'Bayar Transfer', icon: CreditCard, color: 'bg-blue-100 text-blue-600 border-blue-200' },
    { id: 'Kantor', label: 'Bayar Kantor', icon: Building2, color: 'bg-purple-100 text-purple-600 border-purple-200' },
  ];

  const handleSubmit = async () => {
    if (isSubmitting || isSuccess) return;
    
    setIsSubmitting(true);
    
    // Simulate network delay for loading animation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSuccess(true);
    
    // Call actual pay handler
    onPay(customer.id, selectedMethod);
    
    // Wait a bit showing success then close
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(!isSubmitting && !isSuccess) ? onClose : undefined}
            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md z-[60]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-[var(--bg-secondary)] rounded-t-[40px] p-8 z-[70] pb-safe shadow-2xl border-t border-[var(--border-color)] transition-colors duration-500"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight transition-colors uppercase tracking-widest">Konfirmasi Bayar</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-2 uppercase tracking-[0.1em]">Untuk <span className="text-brand font-black">{customer.name}</span></p>
              </div>
              <button 
                onClick={onClose}
                disabled={isSubmitting || isSuccess}
                className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Total Amount Tag */}
            <div className="mb-10 flex justify-center">
              <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 px-10 py-6 rounded-[32px] text-center shadow-xl shadow-emerald-500/5 transition-colors">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-[0.2em] block mb-2 opacity-80">Total Tagihan</span>
                <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">
                  Rp {customer.price.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="space-y-4 mb-10">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;
                
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    disabled={isSubmitting || isSuccess}
                    className={`w-full flex items-center p-5 rounded-[24px] transition-all text-left border-2 duration-300 ${
                      isSelected 
                        ? `border-brand bg-brand/10 dark:bg-brand/20 shadow-xl shadow-brand/10` 
                        : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--border-color)]'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-5 border transition-colors ${
                      isSelected ? 'bg-brand text-white border-brand' : method.color.replace('bg-', 'bg-').replace('text-', 'text-')
                    }`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <div className={`font-black text-[15px] uppercase tracking-wider ${isSelected ? 'text-brand' : 'text-[var(--text-primary)]'}`}>{method.label}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 opacity-70">Pilih metode ini</div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'border-brand bg-brand scale-110' : 'border-slate-300 dark:border-slate-700'
                    }`}>
                      {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Giant Action Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isSuccess}
              className={`w-full h-18 flex items-center justify-center rounded-[24px] text-[16px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-[0.98] ${
                isSuccess 
                  ? 'bg-emerald-500 text-white shadow-emerald-500/40' 
                  : 'bg-brand text-white shadow-brand/40 hover:bg-brand-dark'
              }`}
            >
              <AnimatePresence mode="wait">
                {isSubmitting ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center"
                  >
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    MEMPROSES...
                  </motion.div>
                ) : isSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center"
                  >
                    <CheckCircle2 className="w-8 h-8 mr-3" />
                    LUNAS SUKSES!
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    KONFIRMASI LUNAS
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
