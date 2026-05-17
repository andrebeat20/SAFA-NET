import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { mockCustomers, mockTransactions } from '../src/data/mockData.js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function seed() {
  console.log('Seeding data to Supabase...');
  
  // Clean up existing data to avoid duplicates during test
  await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log('Cleared existing data.');

  // Insert customers (Map the mock ID to UUID or let Supabase generate it and keep the mapping)
  // Wait, mockCustomers uses simple string IDs ('1', '2'). Supabase expects UUIDs if the table was created with UUID.
  // The SQL schema we provided used `id UUID DEFAULT gen_random_uuid() PRIMARY KEY`.
  // So we cannot insert '1', '2' into a UUID column!
  // Instead, we will let Supabase generate the UUID, and we will fetch them back.

  const customersToInsert = mockCustomers.map(c => ({
    no_urut_excel: c.no_urut_excel,
    name: c.name,
    package: c.package,
    address: c.address,
    phone: c.phone,
    price: c.price,
    status: c.status
  }));

  const { data: insertedCustomers, error: cError } = await supabase
    .from('customers')
    .insert(customersToInsert)
    .select();

  if (cError) {
    console.error('Error inserting customers:', cError);
    return;
  }

  console.log('Inserted customers successfully.');

  // Map the old mock string IDs to the new UUIDs based on names
  const idMap = {};
  insertedCustomers.forEach(c => {
    const oldC = mockCustomers.find(mc => mc.name === c.name);
    if (oldC) {
      idMap[oldC.id] = c.id;
    }
  });

  // Prepare transactions with new UUIDs
  const transactionsToInsert = mockTransactions.map(t => ({
    customer_id: idMap[t.customerId],
    customer_name: t.customerName,
    amount: t.amount,
    method: t.method,
    bulan_tagihan: t.bulan_tagihan,
    date: t.date
  }));

  const { error: tError } = await supabase
    .from('transactions')
    .insert(transactionsToInsert);

  if (tError) {
    console.error('Error inserting transactions:', tError);
    return;
  }

  console.log('Inserted transactions successfully!');
  console.log('Seed complete.');
}

seed();
