import React from 'react';
import { Home, Users, FileText, PieChart, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function BottomNav({ activeTab, setActiveTab }) {
  const { hasPermission } = useAuth();
  
  const allTabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'pelanggan', label: 'Pelanggan', icon: Users },
    { id: 'tagihan', label: 'Tagihan', icon: FileText },
    { id: 'laporan', label: 'Laporan', icon: PieChart },
    { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
  ];

  // Dynamically filter tabs based on permissions
  const tabs = allTabs.filter(tab => hasPermission(tab.id));

  return (
    <nav className="fixed bottom-6 left-0 right-0 px-6 z-50 pointer-events-none">
      <div className="glass max-w-sm mx-auto rounded-full h-16 px-2 flex justify-between items-center pointer-events-auto transition-colors duration-500">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex-1 flex flex-col items-center justify-center h-12 rounded-full transition-all group cursor-pointer"
            >
              {isActive && (
                <div className="absolute inset-0 bg-brand/10 dark:bg-brand/20 rounded-full transition-all duration-200" />
              )}
              <Icon className={`w-5 h-5 relative z-10 transition-colors duration-300 ${isActive ? 'text-brand' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
              <span className={`text-[9px] font-black mt-1 relative z-10 transition-colors uppercase tracking-widest duration-300 ${isActive ? 'text-brand' : 'text-slate-400 dark:text-slate-500'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
