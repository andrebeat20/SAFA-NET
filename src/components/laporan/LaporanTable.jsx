import React from 'react';

export default function LaporanTable({ customers, transactions }) {
  return (
    <div className="mt-12 mb-8 bg-[var(--bg-secondary)] rounded-[32px] shadow-xl border border-[var(--border-color)] overflow-hidden transition-colors">
      <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center transition-colors">
        <h3 className="font-black text-[var(--text-primary)] uppercase tracking-wider text-sm">Tabel Rekapitulasi Tagihan</h3>
      </div>
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full text-left text-[13px] whitespace-nowrap">
          <thead className="bg-brand/10 dark:bg-brand/20 text-brand font-black border-b border-brand/10 transition-colors">
            <tr className="uppercase tracking-widest text-[11px]">
              <th className="py-5 px-5 text-center">No</th>
              <th className="py-5 px-5">Nama</th>
              <th className="py-5 px-5">Alamat</th>
              <th className="py-5 px-5">Paket</th>
              <th className="py-5 px-5 text-right">Harga</th>
              <th className="py-5 px-5">Keterangan</th>
              <th className="py-5 px-5 text-right text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-500/10">KELILING</th>
              <th className="py-5 px-5 text-right text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-500/10">KANTOR</th>
              <th className="py-5 px-5 text-right text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-500/10">TRANSFER</th>
              <th className="py-5 px-5 text-right text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-500/10 font-black">BELUM BAYAR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)] transition-colors">
            {customers?.map((c, i) => {
              const tx = transactions?.find(t => t.customer_id === c.id);
              const isKeliling = tx?.method === 'Keliling';
              const isKantor = tx?.method === 'Kantor' || tx?.method === 'Tunai Kantor';
              const isTransfer = tx?.method === 'Transfer';
              const isBelumBayar = c.status === 'Belum Bayar';
              
              return (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 px-5 text-center text-slate-400 dark:text-slate-500 font-bold">{c.no_urut_excel || i + 1}</td>
                  <td className="py-4 px-5 font-black text-[var(--text-primary)]">{c.name}</td>
                  <td className="py-4 px-5 text-slate-500 dark:text-slate-400 font-medium truncate max-w-[150px]">{c.address || '-'}</td>
                  <td className="py-4 px-5 font-bold text-slate-600 dark:text-slate-400">{c.package}</td>
                  <td className="py-4 px-5 text-right text-[var(--text-primary)] font-black">Rp {c.price.toLocaleString('id-ID')}</td>
                  <td className="py-4 px-5 text-slate-400 dark:text-slate-500">-</td>
                  <td className="py-4 px-5 text-right text-orange-600 dark:text-orange-400 font-black bg-orange-50/30 dark:bg-orange-500/5">{isKeliling ? c.price.toLocaleString('id-ID') : ''}</td>
                  <td className="py-4 px-5 text-right text-purple-600 dark:text-purple-400 font-black bg-purple-50/30 dark:bg-purple-500/5">{isKantor ? c.price.toLocaleString('id-ID') : ''}</td>
                  <td className="py-4 px-5 text-right text-blue-600 dark:text-blue-400 font-black bg-blue-50/30 dark:bg-blue-500/5">{isTransfer ? c.price.toLocaleString('id-ID') : ''}</td>
                  <td className="py-4 px-5 text-right text-red-600 dark:text-red-400 font-black bg-red-50/30 dark:bg-red-500/5">{isBelumBayar ? c.price.toLocaleString('id-ID') : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
