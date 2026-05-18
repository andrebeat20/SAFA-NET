import { dotenvx } from '@dotenvx/dotenvx';
// Inisialisasi env
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testFetch() {
  const sheetId = '1a3fOlaFFxjZzWG-ycD4GPlHmjTgkd7djcfmJ_E3NKJM';
  // Ambil data dalam format CSV dari tab pertama (gid=0 atau sheet pertama)
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
  
  console.log('Menghubungi Google Sheets...');
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Gagal mengunduh CSV: ' + res.statusText);
    const text = await res.text();
    console.log('--- Sampel Data Google Sheets ---');
    console.log(text.split('\n').slice(0, 10).join('\n'));
  } catch (error) {
    console.error('Error fetching sheet:', error);
  }
}

testFetch();
