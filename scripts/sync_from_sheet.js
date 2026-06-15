import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Kredensial Supabase tidak ditemukan di .env.local!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fungsi pembantu untuk memproses baris CSV dengan kutip koma (misal: "Rp350,000")
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function sync() {
  console.log('🔄 Memulai sinkronisasi data dari Google Sheets ke Supabase...');
  
  const sheetId = '1a3fOlaFFxjZzWG-ycD4GPlHmjTgkd7djcfmJ_E3NKJM';
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Gagal mendownload Google Sheets CSV: ' + res.statusText);
    
    const csvText = await res.text();
    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
    
    if (lines.length < 2) {
      console.log('⚠️ Spreadsheet kosong atau tidak valid.');
      return;
    }
    
    const parsedLines = [];
    let headerIndex = -1;
    
    // Parse seluruh baris terlebih dahulu
    for (let i = 0; i < lines.length; i++) {
      const columns = parseCSVLine(lines[i]);
      parsedLines.push(columns);
      
      // Cari baris header utama yang kolom pertamanya adalah "No" (case-insensitive)
      if (columns[0] && columns[0].toLowerCase() === 'no') {
        headerIndex = i;
      }
    }
    
    if (headerIndex === -1) {
      console.error('❌ Format tabel tidak valid: Kolom "No" tidak ditemukan.');
      return;
    }
    
    const customersToInsert = [];
    
    // Mulai membaca data hanya dari baris setelah header utama
    for (let i = headerIndex + 1; i < parsedLines.length; i++) {
      const columns = parsedLines[i];
      
      // Jika kolom Nama (indeks 1) kosong atau berisi kata "TOTAL", lewati baris ini
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
    
    console.log(`\n📋 Ditemukan ${customersToInsert.length} data pelanggan asli di Google Sheets.`);
    
    // 1. Bersihkan tabel customers di Supabase terlebih dahulu
    console.log('🧹 Menghapus data pelanggan lama di Supabase...');
    const { error: deleteCustomersError } = await supabase
      .from('customers')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
      
    if (deleteCustomersError) {
      throw new Error('Gagal menghapus data lama: ' + deleteCustomersError.message);
    }
    
    console.log('🧹 Menghapus histori transaksi lama di Supabase...');
    const { data: existingTxData } = await supabase.from('transactions').select('*');
    await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 2. Masukkan data asli baru ke tabel customers
    console.log('📤 Memasukkan data pelanggan asli ke Supabase...');
    const dbCustomers = customersToInsert.map(({ keterangan, ...c }) => c);
    
    const { error: insertError } = await supabase
      .from('customers')
      .insert(dbCustomers);
      
    if (insertError) {
      throw new Error('Gagal memasukkan data pelanggan asli: ' + insertError.message);
    }

    // 3. Rekonstruksi histori transaksi di Supabase berdasarkan data sheet
    console.log('🔄 Membangun ulang histori transaksi di Supabase...');
    const { data: newCustData, error: fetchNewError } = await supabase
      .from('customers')
      .select('id, name, no_urut_excel, price');

    if (!fetchNewError && newCustData) {
      const transactionsToInsert = [];
      
      for (let i = headerIndex + 1; i < parsedLines.length; i++) {
        const columns = parsedLines[i];
        if (!columns[1] || columns[1].toLowerCase().includes('total')) continue;
        
        const noUrut = parseInt(columns[0]) || (i - headerIndex);
        const keterangan = (columns[6] || '').toUpperCase();
        const status = keterangan.includes('BELUM BAYAR') ? 'Belum Bayar' : 'Lunas';
        
        if (status === 'Lunas') {
          const dbCust = newCustData.find(dc => dc.no_urut_excel === noUrut);
          if (dbCust) {
            let method = 'Transfer'; // Default fallback
            if (keterangan.includes('KELILING')) {
              method = 'Keliling';
            } else if (keterangan.includes('KANTOR') || keterangan.includes('TUNAI')) {
              method = 'Tunai Kantor';
            } else if (keterangan.includes('TRANSFER')) {
              method = 'Transfer';
            } else {
              method = 'Keliling';
            }

            const dateObj = new Date();
            const currentMonthStr = `${dateObj.toLocaleDateString('id-ID', { month: 'long' }).toUpperCase()} ${dateObj.getFullYear()}`;
            const oldTx = existingTxData?.find(t => t.customer_name === dbCust.name && t.bulan_tagihan === currentMonthStr);

            transactionsToInsert.push({
              customer_id: dbCust.id,
              customer_name: dbCust.name,
              amount: dbCust.price,
              method: method,
              bulan_tagihan: currentMonthStr, // Fallback default month
              date: oldTx ? oldTx.date : new Date().toISOString()
            });
          }
        }
      }

      if (transactionsToInsert.length > 0) {
        const { error: txInsertError } = await supabase
          .from('transactions')
          .insert(transactionsToInsert);
          
        if (txInsertError) {
          console.error('⚠️ Gagal memasukkan histori transaksi:', txInsertError.message);
        } else {
          console.log(`✅ Berhasil menyelaraskan ${transactionsToInsert.length} transaksi pembayaran.`);
        }
      }
    }
    
    console.log('✅ SINKRONISASI SUKSES! Database Supabase Anda sekarang 100% menggunakan data riil Google Sheets!');
    
  } catch (error) {
    console.error('❌ Gagal melakukan sinkronisasi:', error.message);
  }
}

sync();
