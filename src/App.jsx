import React, { useState } from 'react';
import { Toaster } from 'sonner';
import TopBar from './components/layout/TopBar';
import BottomNav from './components/layout/BottomNav';
import Dashboard from './views/Dashboard';
import Customers from './views/Customers';
import Tagihan from './views/Tagihan';
import Laporan from './views/Laporan';
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
  
  const { isAuthenticated, isPetugas, isAdmin, isTeknisi, isOwner, loading } = useAuth();

  const { 
    customers, 
    transactions, 
    isSyncing,
    currentMonth,
    setSelectedMonth,
    handlePayment, 
    manualSync,
    getFinancialSummary 
  } = useBilling();

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
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



  // 1. Not Logged In
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen font-outfit max-w-md mx-auto relative shadow-2xl overflow-hidden border-x border-[var(--border-color)] transition-colors">
        <Login isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        <Toaster position="top-center" richColors />
      </div>
    );
  }

  // 2. Petugas / Teknisi View (Minimalist)
  if (isPetugas || isTeknisi) {
    return (
      <div className="min-h-screen font-outfit max-w-md mx-auto relative shadow-2xl overflow-hidden border-x border-[var(--border-color)] transition-colors">
        <MeshBackground />
        <div className="relative z-10 flex flex-col h-screen">
          <TopBar 
            customMonth={currentMonth} 
            isAdmin={false} 
            onMonthChange={setSelectedMonth}
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
          />
          <main className="flex-1 overflow-y-auto">
            {isTeknisi ? (
              <Tagihan 
                customers={customers} 
                onPayment={handlePayment} 
              />
            ) : (
              <FieldDashboard 
                customers={customers} 
                onCustomerClick={handleDetailClick} 
                customMonth={currentMonth}
                onMonthChange={setSelectedMonth}
              />
            )}
          </main>
        </div>
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
          onUpdate={(updated) => {
            console.log('Update customer:', updated);
          }}
        />
        <Toaster position="top-center" richColors />
      </div>
    );
  }

  // 3. Owner View (Reports Only)
  if (isOwner) {
    return (
      <div className="min-h-screen font-outfit max-w-md mx-auto relative shadow-2xl overflow-hidden border-x border-[var(--border-color)] transition-colors">
        <MeshBackground />
        <div className="relative z-10 flex flex-col h-screen">
          <TopBar 
            customMonth={currentMonth} 
            isAdmin={true} 
            onMonthChange={setSelectedMonth}
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
          />
          <main className="flex-1 overflow-y-auto pt-6">
            <Laporan 
              summary={summary} 
              onSync={manualSync} 
              isSyncing={isSyncing} 
              customers={customers}
              transactions={transactions}
            />
          </main>
        </div>
        <Toaster position="top-center" richColors />
      </div>
    );
  }

  // 4. Admin View (Full Access)
  return (
    <div className="min-h-screen font-outfit max-w-md mx-auto relative shadow-2xl overflow-hidden border-x border-[var(--border-color)] transition-colors">
      <MeshBackground />
      
      <div className="relative z-10 flex flex-col h-screen pb-20">
        <TopBar 
          customMonth={currentMonth} 
          isAdmin={true} 
          onMonthChange={setSelectedMonth}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
        
        <main className="flex-1 overflow-y-auto animate-fade-in-up">
          {activeTab === 'home' && (
            <Dashboard 
              summary={summary} 
              transactions={transactions} 
              onViewAll={() => setActiveTab('laporan')} 
            />
          )}
          {activeTab === 'pelanggan' && (
            <Customers customers={customers} onCustomerClick={handleDetailClick} />
          )}
          {activeTab === 'tagihan' && (
            <Tagihan 
              customers={customers} 
              onPayment={handlePayment} 
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
        </main>

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      
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
        onUpdate={(updated) => {
          // In a real app, call API here
          console.log('Update customer:', updated);
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
