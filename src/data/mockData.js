export const mockCustomers = [
  {
    id: '1',
    no_urut_excel: 1,
    name: 'Budi Santoso',
    package: '10 Mbps',
    address: 'Jl. Merdeka No. 45',
    phone: '081234567890',
    price: 150000,
    status: 'Belum Bayar',
  },
  {
    id: '2',
    no_urut_excel: 2,
    name: 'Siti Aminah',
    package: '20 Mbps',
    address: 'Jl. Sudirman No. 12',
    phone: '081298765432',
    price: 250000,
    status: 'Lunas',
  },
  {
    id: '3',
    no_urut_excel: 3,
    name: 'Ahmad Dahlan',
    package: '10 Mbps',
    address: 'Jl. Diponegoro No. 8',
    phone: '085612345678',
    price: 150000,
    status: 'Belum Bayar',
  },
  {
    id: '4',
    no_urut_excel: 4,
    name: 'Rina Wijaya',
    package: '50 Mbps',
    address: 'Jl. Thamrin No. 99',
    phone: '081112223334',
    price: 450000,
    status: 'Belum Bayar',
  },
  {
    id: '5',
    no_urut_excel: 5,
    name: 'Andi Mulyadi',
    package: '20 Mbps',
    address: 'Jl. Gatot Subroto No. 5',
    phone: '082233445566',
    price: 250000,
    status: 'Lunas',
  }
];

export const mockTransactions = [
  {
    id: 't1',
    customerId: '2',
    customerName: 'Siti Aminah',
    amount: 250000,
    method: 'Transfer',
    date: '2026-05-12T10:00:00Z',
    bulan_tagihan: 'MEI'
  },
  {
    id: 't2',
    customerId: '5',
    customerName: 'Andi Mulyadi',
    amount: 250000,
    method: 'Keliling',
    date: '2026-05-13T14:30:00Z',
    bulan_tagihan: 'MEI'
  }
];
