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
    
    // Find all transactions recorded for the current selected month
    const activeMonthTx = transactions.filter(t => t.bulan_tagihan === currentMonthName);
    
    if (activeMonthTx.length === 0) {
      toast.info('Tidak ada transaksi untuk disinkronkan bulan ini');
      setIsSyncing(false);
      return;
    }

    const syncUrl = import.meta.env.VITE_SHEETS_SYNC_URL;
    if (!syncUrl) {
      toast.error('URL Sinkronisasi Google Sheets belum dikonfigurasi');
      setIsSyncing(false);
      return;
    }

    try {
      let successCount = 0;
      await Promise.all(activeMonthTx.map(async (t) => {
        const c = customers.find(cust => cust.id === t.customer_id);
        if (!c) return;

        try {
          const res = await fetch(syncUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
              no_urut_excel: c.no_urut_excel,
              amount: t.amount,
              method: t.method,
              bulan_tagihan: currentMonthName
            })
          });
          const resData = await res.json();
          if (resData.status === 'success') {
            successCount++;
          }
        } catch (e) {
          console.error(e);
        }
      }));

      toast.success('Sinkronisasi Selesai', {
        description: `Berhasil memperbarui ${successCount} baris di Google Sheets.`
      });
    } catch (err) {
      toast.error('Gagal menjalankan sinkronisasi');
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

  return {
    customers,
    transactions,
    isSyncing,
    isLoading,
    currentMonth: selectedMonth,
    setSelectedMonth,
    handlePayment,
    manualSync,
    getFinancialSummary
  };
}
