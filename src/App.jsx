import React, { useState } from 'react';
import { Toaster } from 'sonner';
import TopBar from './components/layout/TopBar';
import BottomNav from './components/layout/BottomNav';
import Dashboard from './views/Dashboard';
import Customers from './views/Customers';
import Tagihan from './views/Tagihan';
import Laporan from './views/Laporan';
import Pengaturan from './views/Pengaturan';
import PaymentBottomSheet from './components/shared/PaymentBottomSheet';
import { useBilling } from './hooks/useBilling';
import { useAuth } from './hooks/useAuth';
import Login from './views/Login';
import FieldDashboard from './views/FieldDashboard';
import CustomerDetailSheet from './components/shared/CustomerDetailSheet';
import MeshBackground from './components/layout/MeshBackground';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedForDetail, setSelectedForDetail] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('safanet_theme') === 'dark';
  });
  
  const { isAuthenticated, user, loading, hasPermission } = useAuth();

  const { 
    customers, 
    transactions, 
    isSyncing,
    currentMonth,
    setSelectedMonth,
    handlePayment, 
    manualSync,
    getFinancialSummary,
    updateCustomer,
    deleteCustomer,
    generateMonthlyTagihan
  } = useBilling();

  // Dynamic Tab Redirection based on Permissions
  React.useEffect(() => {
    if (isAuthenticated && user) {
      const allTabs = ['home', 'pelanggan', 'tagihan', 'laporan', 'pengaturan'];
      const allowedTabs = allTabs.filter(tab => hasPermission(tab));
      
      // If activeTab is not allowed, select the first allowed tab
      if (allowedTabs.length > 0 && !allowedTabs.includes(activeTab)) {
        setActiveTab(allowedTabs[0]);
      }
    }
  }, [isAuthenticated, user, hasPermission, activeTab]);

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('safanet_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('safanet_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-brand/10 rounded-[24px] flex items-center justify-center">
             <div className="w-10 h-10 border-4 border-brand/20 border-t-brand rounded-full animate-spin"></div>
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  const summary = getFinancialSummary();

  const handleCustomerClick = (customer) => {
    if (customer.status === 'Belum Bayar') {
      setSelectedCustomer(customer);
    }
  };
  
  const handleDetailClick = (customer) => {
    setSelectedForDetail(customer);
  };

  // 1. Not Authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen font-outfit max-w-md mx-auto relative shadow-2xl overflow-hidden border-x border-[var(--border-color)] transition-colors">
        <Login isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        <Toaster position="top-center" richColors />
      </div>
    );
  }

  // 2. Authenticated Multi-Role Dynamic UI
  return (
    <div className="min-h-screen font-outfit max-w-md mx-auto relative shadow-2xl overflow-hidden border-x border-[var(--border-color)] transition-colors">
      <MeshBackground />
      
      <div className="relative z-10 flex flex-col h-screen pb-20">
        <TopBar 
          customMonth={currentMonth} 
          isAdmin={user?.role === 'admin' || user?.role === 'owner'} 
          onMonthChange={setSelectedMonth}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
        
        <main className="flex-1 overflow-y-auto animate-fade-in-up pt-6">
          {/* Dynamic Variant of HOME View */}
          {activeTab === 'home' && (
            (user?.role === 'admin' || user?.role === 'owner') ? (
              <Dashboard 
                summary={summary} 
                transactions={transactions} 
                onViewAll={() => setActiveTab('laporan')} 
              />
            ) : (
              <FieldDashboard 
                customers={customers} 
                onCustomerClick={handleDetailClick} 
                customMonth={currentMonth}
                onMonthChange={setSelectedMonth}
              />
            )
          )}
          
          {activeTab === 'pelanggan' && (
            <Customers customers={customers} onCustomerClick={handleDetailClick} />
          )}
          
          {activeTab === 'tagihan' && (
            <Tagihan 
              customers={customers} 
              onPayment={handlePayment} 
              currentMonth={currentMonth}
              onGenerate={generateMonthlyTagihan}
              isSyncing={isSyncing}
              isAdmin={user?.role === 'admin'}
            />
          )}
          
          {activeTab === 'laporan' && (
            <Laporan 
              summary={summary} 
              onSync={manualSync} 
              isSyncing={isSyncing} 
              customers={customers} 
              transactions={transactions} 
            />
          )}

          {activeTab === 'pengaturan' && (
            <Pengaturan />
          )}
        </main>

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      
      {/* Payment Modals & Detail Sheets */}
      <PaymentBottomSheet 
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        customer={selectedCustomer}
        onPay={handlePayment}
      />

      <CustomerDetailSheet 
        isOpen={!!selectedForDetail}
        onClose={() => setSelectedForDetail(null)}
        customer={selectedForDetail}
        onUpdate={async (updated) => {
          const success = await updateCustomer(updated.id, {
            name: updated.name,
            address: updated.address,
            phone: updated.phone,
            package: updated.package,
            price: updated.price
          });
          if (success) setSelectedForDetail(null);
        }}
        onDelete={async (id) => {
          const confirmDelete = window.confirm('Apakah Anda yakin ingin menghapus pelanggan ini beserta seluruh riwayat pembayarannya?');
          if (confirmDelete) {
            const success = await deleteCustomer(id);
            if (success) setSelectedForDetail(null);
          }
        }}
      />
      
      <Toaster 
        position="top-center" 
        richColors 
        toastOptions={{
          className: 'rounded-2xl shadow-xl border-0',
          duration: 3000
        }}
      />
    </div>
  );
}

export default App;
