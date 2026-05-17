import { MapPin, Phone, User, CheckCircle2, Clock, Edit2 } from 'lucide-react';
import clsx from 'clsx';

export default function CustomerCard({ customer, onClick, onEdit }) {
  const isPaid = customer.status === 'Lunas';

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(customer.price);

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) onEdit(customer);
  };

  return (
    <div 
      onClick={() => onClick(customer)}
      className="bg-[var(--bg-secondary)] rounded-[32px] p-6 shadow-sm border border-[var(--border-color)] hover:shadow-xl hover:border-brand/40 active:scale-[0.98] transition-all duration-500 cursor-pointer relative overflow-hidden group"
    >
      {/* Decorative gradient for paid customers */}
      {isPaid && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
      )}

      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-5">
          <div className={clsx(
            "w-16 h-16 rounded-[22px] flex items-center justify-center flex-shrink-0 transition-all duration-500",
            isPaid 
              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
              : "bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-brand/10 group-hover:text-brand"
          )}>
            <User className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-black text-[var(--text-primary)] text-xl leading-tight mb-1.5 transition-colors">{customer.name}</h3>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 bg-brand/10 dark:bg-brand/20 text-brand text-[10px] font-black rounded-lg tracking-[0.15em] uppercase">
                {customer.package}
              </span>
              <button 
                onClick={handleEditClick}
                className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg hover:bg-brand hover:text-white dark:hover:bg-brand dark:hover:text-white transition-all shadow-sm active:scale-90"
                title="Edit Pelanggan"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-end justify-between pt-6 border-t border-[var(--border-color)] transition-colors">
        <div className="space-y-2.5 flex-1 pr-4">
          <div className="flex items-center gap-3 text-[13px] font-bold text-slate-500 dark:text-slate-400 transition-colors">
            <MapPin className="w-4 h-4 text-slate-400 group-hover:text-brand transition-colors" />
            <span className="truncate max-w-[150px]">{customer.address}</span>
          </div>
          <div className="flex items-center gap-3 text-[13px] font-bold text-slate-500 dark:text-slate-400 transition-colors">
            <Phone className="w-4 h-4 text-slate-400 group-hover:text-brand transition-colors" />
            <span>{customer.phone}</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5 transition-colors">Tagihan</div>
          <div className="font-black text-[var(--text-primary)] text-xl leading-none mb-3 transition-colors">{formattedPrice}</div>
          <div className={clsx(
            "inline-flex items-center justify-end gap-2 px-3 py-1.5 rounded-xl text-[11px] font-black tracking-wider transition-all duration-500",
            isPaid 
              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
              : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
          )}>
            {isPaid ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            {customer.status.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}
