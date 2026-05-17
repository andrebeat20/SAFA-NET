import React from 'react';
import clsx from 'clsx';

export default function StatCard({ title, amount, type }) {
  const isPositive = type === 'terkumpul';
  const isNeutral = type === 'total';
  
  const gradients = {
    total: 'from-indigo-600 to-indigo-700 dark:from-indigo-500 dark:to-indigo-600 shadow-indigo-500/30 dark:shadow-indigo-500/10',
    terkumpul: 'from-emerald-500 to-teal-600 dark:from-emerald-400 dark:to-teal-500 shadow-emerald-500/30 dark:shadow-emerald-500/10',
    sisa: 'from-rose-500 to-red-600 dark:from-rose-400 dark:to-red-500 shadow-rose-500/30 dark:shadow-rose-500/10'
  };

  const bgGradient = isNeutral ? gradients.total : isPositive ? gradients.terkumpul : gradients.sisa;

  const formattedAmount = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);

  return (
    <div className={clsx(
      "p-6 rounded-[28px] min-w-[240px] flex-shrink-0 snap-center shadow-xl border border-white/20 dark:border-white/10 relative overflow-hidden transition-all duration-500",
      "bg-gradient-to-br text-white",
      bgGradient
    )}>
      {/* Decorative Blur */}
      <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
      
      <div className="relative z-10">
        <h3 className="text-sm font-semibold text-white/80 tracking-wide uppercase mb-3">{title}</h3>
        <p className="text-2xl font-black tracking-tight">{formattedAmount}</p>
      </div>
    </div>
  );
}
