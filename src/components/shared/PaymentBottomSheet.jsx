import React, { useState, useEffect } from 'react';
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

  if (!isOpen || !customer) return null;

  const paymentMethods = [
    { id: 'Keliling', label: 'Bayar Keliling', icon: Bike, color: 'bg-orange-100 text-orange-600 border-orange-200' },
    { id: 'Transfer', label: 'Bayar Transfer', icon: CreditCard, color: 'bg-blue-100 text-blue-600 border-blue-200' },
    { id: 'Kantor', label: 'Bayar Kantor', icon: Building2, color: 'bg-purple-100 text-purple-600 border-purple-200' },
  ];

  const handleSubmit = async () => {
    if (isSubmitting || isSuccess) return;
    
    setIsSubmitting(true);
    
    // Simulate network delay for loading animation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSuccess(true);
    
    // Call actual pay handler
    onPay(customer.id, selectedMethod);
    
    // Wait a bit showing success then close
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop Overlay (Flat Solid) */}
      <div
        onClick={(!isSubmitting && !isSuccess) ? onClose : undefined}
        className="absolute inset-0 bg-slate-950/70"
      />
      
      {/* Bottom Sheet Container */}
      <div className="relative w-full max-w-lg bg-[var(--bg-secondary)] rounded-t-[32px] sm:rounded-[28px] p-6 pb-safe shadow-2xl border-t sm:border border-[var(--border-color)] transition-colors duration-500 max-h-[90vh] overflow-y-auto scrollbar-hide z-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight transition-colors uppercase">Konfirmasi Bayar</h2>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">Untuk <span className="text-brand font-black">{customer.name}</span></p>
          </div>
          <button 
            onClick={onClose}
            disabled={isSubmitting || isSuccess}
            className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Amount Tag */}
        <div className="mb-6 flex justify-center">
          <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 px-8 py-4 rounded-2xl text-center shadow-md transition-colors">
            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest block mb-1 opacity-80">Total Tagihan</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              Rp {customer.price.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.id;
            
            return (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                disabled={isSubmitting || isSuccess}
                className={`w-full flex items-center p-3.5 rounded-2xl transition-all text-left border-2 duration-200 cursor-pointer ${
                  isSelected 
                    ? `border-brand bg-brand/10 dark:bg-brand/20 shadow-md` 
                    : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--border-color)]'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 border transition-colors ${
                  isSelected ? 'bg-brand text-white border-brand' : method.color
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className={`font-black text-xs uppercase tracking-wider ${isSelected ? 'text-brand' : 'text-[var(--text-primary)]'}`}>{method.label}</div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected ? 'border-brand bg-brand scale-105' : 'border-slate-300 dark:border-slate-700'
                }`}>
                  {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Giant Action Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || isSuccess}
          className={`w-full h-14 flex items-center justify-center rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 cursor-pointer ${
            isSuccess 
              ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
              : 'bg-brand text-white shadow-brand/20 hover:brightness-110'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <Loader2 className="w-5 h-5 mr-2.5 animate-spin" />
              MEMPROSES...
            </div>
          ) : isSuccess ? (
            <div className="flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2.5" />
              LUNAS SUKSES!
            </div>
          ) : (
            <div>KONFIRMASI LUNAS</div>
          )}
        </button>
      </div>
    </div>
  );
}
