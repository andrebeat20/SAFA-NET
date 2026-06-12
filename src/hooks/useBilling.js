import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export function useBilling() {
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('JUNI 2026');

  const currentMonthName = selectedMonth;

  // Fetch data from Supabase
  const fetchData = async () => {
    setIsLoading(true);
    
    // Fetch customers
    const { data: customersData, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .order('no_urut_excel', { ascending: true });
      
    if (customersError) {
      toast.error('Gagal memuat data pelanggan');
      console.error(customersError);
    } else {
      setCustomers(customersData || []);
    }

    // Fetch transactions
    const { data: txData, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
      
    if (txError) {
      console.error(txError);
    } else {
      setTransactions(txData || []);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    if (selectedMonth) {
      manualSync(selectedMonth);
    } else {
      fetchData();
    }
  }, [selectedMonth]);

  const handlePayment = async (customerId, paymentMethod) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    // Optimistic UI Update
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, status: 'Lunas' } : c));

    // 1. Update customer status in Supabase
    const { error: updateError } = await supabase
      .from('customers')
      .update({ status: 'Lunas' })
      .eq('id', customerId);

    if (updateError) {
      toast.error('Gagal memperbarui status');
      fetchData(); // revert
      return;
    }

    // 2. Insert transaction record
    const newTransaction = {
      customer_id: customer.id,
      customer_name: customer.name,
      amount: customer.price,
      method: paymentMethod,
      bulan_tagihan: currentMonthName,
      date: new Date().toISOString()
    };

    const { error: insertError } = await supabase
      .from('transactions')
      .insert([newTransaction]);

    if (insertError) {
      toast.error('Gagal mencatat transaksi');
      return;
    }

    // Fetch latest transactions to get the UUID
    fetchData();

    toast.success('Pembayaran Berhasil Dicatat', {
      description: `${customer.name} - ${paymentMethod} (${currentMonthName})`
    });

    // 3. Background Sync to Google Sheets Web App
    const syncUrl = import.meta.env.VITE_SHEETS_SYNC_URL;
    if (syncUrl) {
      fetch(syncUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8' // Avoid CORS preflight block on Google Apps Script
        },
        body: JSON.stringify({
          no_urut_excel: customer.no_urut_excel,
          amount: customer.price,
          method: paymentMethod,
          bulan_tagihan: currentMonthName,
          customer_name: customer.name
        })
      })
      .then(res => res.json())
      .then(resData => {
        if (resData.status === 'success') {
          toast.success('Google Sheets Berhasil Diperbarui!');
        } else {
          console.error('Sheets Sync Error:', resData.message);
          toast.error('Gagal Sinkronisasi Google Sheets: ' + resData.message);
        }
      })
      .catch(err => {
        console.error('Google Sheets Sync Failed:', err);
        toast.error('Gagal terhubung ke Google Sheets');
      });
    }
  };

  const cancelPayment = async (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    // Optimistic UI Update
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, status: 'Belum Bayar' } : c));

    // 1. Update customer status in Supabase
    const { error: updateError } = await supabase
      .from('customers')
      .update({ status: 'Belum Bayar' })
      .eq('id', customerId);

    if (updateError) {
      toast.error('Gagal membatalkan pembayaran');
      fetchData(); // revert
      return;
    }

    // 2. Delete transaction record for this month
    const { data: txData } = await supabase
      .from('transactions')
      .select('id')
      .eq('customer_id', customerId)
      .eq('bulan_tagihan', currentMonthName)
      .order('date', { ascending: false })
      .limit(1);

    if (txData && txData.length > 0) {
      await supabase
        .from('transactions')
        .delete()
        .eq('id', txData[0].id);
    }

    fetchData();

    toast.success('Pembayaran Berhasil Dibatalkan', {
      description: `${customer.name} dikembalikan ke Belum Bayar`
    });

    // 3. Background Sync to Google Sheets Web App
    const syncUrl = import.meta.env.VITE_SHEETS_SYNC_URL;
    if (syncUrl) {
      fetch(syncUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action: 'cancel_payment',
          no_urut_excel: customer.no_urut_excel,
          bulan_tagihan: currentMonthName
        })
      })
      .then(res => res.json())
      .then(resData => {
        if (resData.status === 'success') {
          toast.success('Google Sheets Berhasil Diperbarui (Batal Bayar)!');
        } else {
          console.error('Sheets Sync Error:', resData.message);
          toast.error('Gagal Sinkronisasi Google Sheets: ' + resData.message);
        }
      })
      .catch(err => {
        console.error('Google Sheets Sync Failed:', err);
        toast.error('Gagal terhubung ke Google Sheets');
      });
    }
  };

  const manualSync = async (monthName) => {
    const targetMonth = typeof monthName === 'string' ? monthName : selectedMonth;
    setIsSyncing(true);
    const syncUrl = import.meta.env.VITE_SHEETS_SYNC_URL;
    if (!syncUrl) {
      toast.error('URL Sinkronisasi Google Sheets tidak ditemukan di .env', { id: 'sheet-sync' });
      setIsSyncing(false);
      return;
    }

    toast.loading(`Menyelaraskan data untuk ${targetMonth}...`, { id: 'sheet-sync' });

    try {
      const res = await fetch(syncUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action: "fetch_sheet",
          sheet_name: targetMonth
        })
      });

      if (!res.ok) throw new Error('Gagal menghubungi Google Sheets Web App');
      const result = await res.json();

      if (result.status === "error") {
        throw new Error(result.message || 'Gagal mengambil data dari Google Sheets');
      }

      const customersToInsert = result.data || [];

      // 1. Hapus pelanggan lama di Supabase
      const { error: deleteCustomersError } = await supabase
        .from('customers')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (deleteCustomersError) throw deleteCustomersError;

      // Hapus transaksi lama juga agar selaras
      await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // 2. Masukkan data asli baru dari Google Sheets (jika ada)
      if (customersToInsert.length > 0) {
        // Strip 'keterangan' property to prevent potential database schema errors
        const dbCustomers = customersToInsert.map(({ keterangan, ...c }) => ({
          no_urut_excel: c.no_urut_excel,
          name: c.name,
          address: c.address,
          package: c.package,
          price: c.price,
          phone: c.phone,
          status: c.status
        }));

        const { error: insertError } = await supabase
          .from('customers')
          .insert(dbCustomers);

        if (insertError) throw insertError;

        // 3. Reconstruct transaction history in Supabase based on Google Sheet data
        const { data: newCustData, error: fetchNewError } = await supabase
          .from('customers')
          .select('id, name, no_urut_excel, price');

        if (!fetchNewError && newCustData) {
          const transactionsToInsert = [];
          
          customersToInsert.forEach(sheetCust => {
            if (sheetCust.status === 'Lunas') {
              const dbCust = newCustData.find(dc => dc.no_urut_excel === sheetCust.no_urut_excel);
              if (dbCust) {
                let method = 'Transfer'; // Default fallback
                const ket = (sheetCust.keterangan || '').toUpperCase();
                if (ket.includes('KELILING')) {
                  method = 'Keliling';
                } else if (ket.includes('KANTOR') || ket.includes('TUNAI')) {
                  method = 'Tunai Kantor';
                } else if (ket.includes('TRANSFER')) {
                  method = 'Transfer';
                } else {
                  method = 'Keliling'; // fallback
                }

                transactionsToInsert.push({
                  customer_id: dbCust.id,
                  customer_name: dbCust.name,
                  amount: dbCust.price,
                  method: method,
                  bulan_tagihan: targetMonth,
                  date: new Date().toISOString()
                });
              }
            }
          });

          if (transactionsToInsert.length > 0) {
            const { error: txInsertError } = await supabase
              .from('transactions')
              .insert(transactionsToInsert);
            
            if (txInsertError) {
              console.error('Failed to insert auto-transactions:', txInsertError);
            }
          }
        }
      }

      // 3. Muat ulang data terbaru agar UI langsung ter-update secara instan
      await fetchData();

      if (customersToInsert.length > 0) {
        toast.success('Sinkronisasi Sukses!', {
          id: 'sheet-sync',
          description: `Telah menyelaraskan ${customersToInsert.length} data pelanggan bulan ${targetMonth} ke database.`
        });
      } else {
        toast.success(`Tab bulan ${targetMonth} kosong, data dikosongkan.`, {
          id: 'sheet-sync'
        });
      }

    } catch (error) {
      console.error(error);
      toast.error('Gagal Sinkronisasi: ' + error.message, { id: 'sheet-sync' });
    } finally {
      setIsSyncing(false);
    }
  };

  const generateMonthlyTagihan = async (monthName) => {
    const targetMonth = typeof monthName === 'string' ? monthName : selectedMonth;
    setIsSyncing(true);
    const syncUrl = import.meta.env.VITE_SHEETS_SYNC_URL;
    if (!syncUrl) {
      toast.error('URL Sinkronisasi Google Sheets tidak ditemukan di .env', { id: 'sheet-gen' });
      setIsSyncing(false);
      return false;
    }

    toast.loading(`Sedang mengenerate tagihan bulan ${targetMonth}...`, { id: 'sheet-gen' });

    try {
      const res = await fetch(syncUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action: "generate_month",
          sheet_name: targetMonth
        })
      });

      if (!res.ok) throw new Error('Gagal menghubungi Google Sheets Web App');
      const result = await res.json();

      if (result.status === "error") {
        throw new Error(result.message || 'Gagal mengenerate data dari Google Sheets');
      }

      const customersToInsert = result.data || [];

      // 1. Hapus pelanggan lama di Supabase
      const { error: deleteCustomersError } = await supabase
        .from('customers')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (deleteCustomersError) throw deleteCustomersError;

      // Hapus transaksi lama juga agar selaras
      await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // 2. Masukkan data asli baru dari Google Sheets (jika ada)
      if (customersToInsert.length > 0) {
        const dbCustomers = customersToInsert.map(({ keterangan, ...c }) => ({
          no_urut_excel: c.no_urut_excel,
          name: c.name,
          address: c.address,
          package: c.package,
          price: c.price,
          phone: c.phone,
          status: c.status
        }));

        const { error: insertError } = await supabase
          .from('customers')
          .insert(dbCustomers);

        if (insertError) throw insertError;
      }

      // 3. Muat ulang data terbaru agar UI langsung ter-update secara instan
      await fetchData();

      toast.success('Sukses Generate!', {
        id: 'sheet-gen',
        description: `Berhasil mengenerate dan menyelaraskan ${customersToInsert.length} data tagihan baru untuk bulan ${targetMonth}.`
      });
      return true;

    } catch (error) {
      console.error(error);
      toast.error('Gagal Generate: ' + error.message, { id: 'sheet-gen' });
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  const getFinancialSummary = () => {
    const totalTagihan = customers.reduce((sum, c) => sum + c.price, 0);
    const terkumpul = customers.filter(c => c.status === 'Lunas').reduce((sum, c) => sum + c.price, 0);
    const sisaPiutang = totalTagihan - terkumpul;
    const persentase = totalTagihan > 0 ? (terkumpul / totalTagihan) * 100 : 0;

    const breakdown = {
      keliling: transactions.filter(t => t.method === 'Keliling').reduce((sum, t) => sum + t.amount, 0),
      kantor: transactions.filter(t => t.method === 'Tunai Kantor' || t.method === 'Kantor').reduce((sum, t) => sum + t.amount, 0),
      transfer: transactions.filter(t => t.method === 'Transfer').reduce((sum, t) => sum + t.amount, 0),
    };

    const totalCustomers = customers.length;

    return { totalTagihan, terkumpul, sisaPiutang, persentase, breakdown, totalCustomers };
  };

  const updateCustomer = async (customerId, updatedFields) => {
    const originalCustomer = customers.find(c => c.id === customerId);
    if (!originalCustomer) return false;

    // Optimistic UI Update
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, ...updatedFields } : c));

    const { error } = await supabase
      .from('customers')
      .update(updatedFields)
      .eq('id', customerId);

    if (error) {
      toast.error('Gagal menyimpan perubahan');
      fetchData(); // revert
      return false;
    }

    toast.success('Perubahan pelanggan berhasil disimpan');
    fetchData(); // sync

    // Background Sync Edit to Google Sheets
    const syncUrl = import.meta.env.VITE_SHEETS_SYNC_URL;
    if (syncUrl) {
      fetch(syncUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'edit',
          no_urut_excel: originalCustomer.no_urut_excel,
          name: updatedFields.name,
          address: updatedFields.address,
          package: updatedFields.package,
          price: updatedFields.price,
          phone: updatedFields.phone
        })
      })
      .then(res => res.json())
      .then(resData => {
        if (resData.status === 'success') {
          toast.success('Perubahan disinkronkan ke Google Sheets!');
        } else {
          console.error('Sheets Edit Sync Error:', resData.message);
        }
      })
      .catch(err => console.error('Failed to sync edit to Sheets:', err));
    }

    return true;
  };

  const deleteCustomer = async (customerId) => {
    const originalCustomer = customers.find(c => c.id === customerId);
    if (!originalCustomer) return false;

    toast.loading('Menghapus pelanggan...', { id: 'delete-customer' });

    // Hapus transaksi pelanggan terlebih dahulu untuk menjaga relasi data
    const { error: txError } = await supabase
      .from('transactions')
      .delete()
      .eq('customer_id', customerId);

    if (txError) {
      toast.error('Gagal menghapus riwayat transaksi', { id: 'delete-customer' });
      return false;
    }

    // Hapus pelanggan dari tabel customers
    const { error: custError } = await supabase
      .from('customers')
      .delete()
      .eq('id', customerId);

    if (custError) {
      toast.error('Gagal menghapus pelanggan', { id: 'delete-customer' });
      return false;
    }

    toast.success('Pelanggan berhasil dihapus', { id: 'delete-customer' });
    fetchData();

    // Background Sync Delete to Google Sheets
    const syncUrl = import.meta.env.VITE_SHEETS_SYNC_URL;
    if (syncUrl) {
      fetch(syncUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'delete',
          no_urut_excel: originalCustomer.no_urut_excel
        })
      })
      .then(res => res.json())
      .then(resData => {
        if (resData.status === 'success') {
          toast.success('Penghapusan disinkronkan ke Google Sheets!');
        } else {
          console.error('Sheets Delete Sync Error:', resData.message);
        }
      })
      .catch(err => console.error('Failed to sync delete to Sheets:', err));
    }

    return true;
  };

  return {
    customers,
    transactions,
    isSyncing,
    isLoading,
    currentMonth: selectedMonth,
    setSelectedMonth,
    handlePayment,
    cancelPayment,
    manualSync,
    getFinancialSummary,
    updateCustomer,
    deleteCustomer,
    generateMonthlyTagihan
  };
}
