import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export function useBilling() {
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(
    new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date()).toUpperCase()
  );

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
    fetchData();
  }, []);

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
          bulan_tagihan: currentMonthName
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

  const manualSync = async () => {
    setIsSyncing(true);
    toast.loading('Menyelaraskan data dari Google Sheets...', { id: 'sheet-sync' });

    const sheetId = '1a3fOlaFFxjZzWG-ycD4GPlHmjTgkd7djcfmJ_E3NKJM';
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Gagal mengunduh data Google Sheets');

      const csvText = await res.text();
      const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');

      if (lines.length < 2) {
        toast.error('Data Google Sheets kosong atau tidak valid', { id: 'sheet-sync' });
        setIsSyncing(false);
        return;
      }

      const parsedLines = [];
      let headerIndex = -1;

      // Parse seluruh baris terlebih dahulu
      for (let i = 0; i < lines.length; i++) {
        const columns = [];
        let current = '';
        let inQuotes = false;
        const line = lines[i];

        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            columns.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        columns.push(current.trim());
        parsedLines.push(columns);

        // Cari baris header utama yang kolom pertamanya adalah "No"
        if (columns[0] && columns[0].toLowerCase() === 'no') {
          headerIndex = i;
        }
      }

      if (headerIndex === -1) {
        toast.error('Format tabel tidak valid: Kolom "No" tidak ditemukan', { id: 'sheet-sync' });
        setIsSyncing(false);
        return;
      }

      const customersToInsert = [];

      // Mulai membaca data hanya dari baris setelah header utama
      for (let i = headerIndex + 1; i < parsedLines.length; i++) {
        const columns = parsedLines[i];

        // Lewati jika kolom Nama (indeks 1) kosong atau berisi kata "TOTAL"
        if (!columns[1]) continue;
        if (columns[1].toLowerCase().includes('total')) continue;

        const noUrut = parseInt(columns[0]) || (i - headerIndex);
        const nama = columns[1];
        const alamat = columns[2] || '';
        const paket = columns[3] || '10 Mbps';
        const hargaRaw = columns[4] || '0';
        const harga = parseInt(hargaRaw.replace(/[^\d]/g, '')) || 0;
        const noHp = columns[5] || '';
        const keterangan = (columns[6] || '').toUpperCase();
        const status = keterangan.includes('BELUM BAYAR') ? 'Belum Bayar' : 'Lunas';

        customersToInsert.push({
          no_urut_excel: noUrut,
          name: nama,
          address: alamat,
          package: paket,
          price: harga,
          phone: noHp,
          status: status
        });
      }

      // 1. Hapus pelanggan lama di Supabase
      const { error: deleteCustomersError } = await supabase
        .from('customers')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (deleteCustomersError) throw deleteCustomersError;

      // Hapus transaksi lama juga agar selaras
      await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // 2. Masukkan data asli baru dari Google Sheets
      const { error: insertError } = await supabase
        .from('customers')
        .insert(customersToInsert);

      if (insertError) throw insertError;

      // 3. Muat ulang data terbaru agar UI langsung ter-update secara instan
      await fetchData();

      toast.success('Sinkronisasi Sukses!', {
        id: 'sheet-sync',
        description: `Telah menyelaraskan ${customersToInsert.length} data pelanggan asli ke database Supabase Anda.`
      });

    } catch (error) {
      console.error(error);
      toast.error('Gagal Sinkronisasi: ' + error.message, { id: 'sheet-sync' });
    } finally {
      setIsSyncing(false);
    }
  };

  const getFinancialSummary = () => {
    const totalTagihan = customers.reduce((sum, c) => sum + c.price, 0);
    const terkumpul = customers.filter(c => c.status === 'Lunas').reduce((sum, c) => sum + c.price, 0);
    const sisaPiutang = totalTagihan - terkumpul;
    const persentase = totalTagihan > 0 ? (terkumpul / totalTagihan) * 100 : 0;

    // Supabase returns columns exactly as they are. In mockData they were camelCase, 
    // now we map to the exact Supabase columns if we want, or use our frontend object.
    // Wait, transactions from Supabase have 'customer_id'. In the frontend table we mapped 'customerId'.
    // Let's ensure the transactions mapped here use the correct column names from Supabase.
    
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
    manualSync,
    getFinancialSummary,
    updateCustomer,
    deleteCustomer
  };
}
