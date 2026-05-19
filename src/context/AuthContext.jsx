import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Dynamic App Branding States
  const [appName, setAppName] = useState('SAFA.NET');
  const [appLogo, setAppLogo] = useState('');
  const [rolePermissions, setRolePermissions] = useState({
    admin: ["home", "pelanggan", "tagihan", "laporan", "pengaturan"],
    teknisi: ["tagihan"],
    owner: ["laporan"],
    petugas: ["home", "pelanggan"]
  });
  
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Load app settings and cached user session
  const loadAppSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('id', 1)
        .single();
        
      if (error) {
        // Table doesn't exist or is empty yet
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          console.warn("Table app_settings not found, using default configurations.");
          setIsDemoMode(true);
        }
        return;
      }
      
      if (data) {
        if (data.app_name) setAppName(data.app_name);
        if (data.logo_data) setAppLogo(data.logo_data);
        if (data.role_permissions) setRolePermissions(data.role_permissions);
        setIsDemoMode(false);
      }
    } catch (err) {
      console.error("Error loading app settings:", err);
      setIsDemoMode(true);
    }
  };

  useEffect(() => {
    // 1. Load app branding settings
    loadAppSettings();
    
    // 2. Load cached user from localStorage
    const savedUser = localStorage.getItem('safanet_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    if (!username || !password) {
      toast.error('Username/Email dan Password harus diisi');
      return false;
    }

    try {
      // 1. Check if tables are initialized. If they are in demo mode, try to fetch settings first.
      await loadAppSettings();

      if (isDemoMode) {
        // FALLBACK: Demo Mode (For local development prior to running SQL script)
        let role = 'petugas'; 
        if (username.toLowerCase().includes('admin')) {
          role = 'admin';
        } else if (username.toLowerCase().includes('teknisi')) {
          role = 'teknisi';
        } else if (username.toLowerCase().includes('owner')) {
          role = 'owner';
        }

        const userData = {
          id: 'demo-user',
          username,
          role,
          name: role === 'admin' ? 'Administrator (Demo)' : 
                role === 'teknisi' ? 'Teknisi Lapangan (Demo)' : 
                role === 'owner' ? 'Owner (Demo)' : 'Petugas Lapangan (Demo)',
          permissions: rolePermissions[role] || []
        };

        await new Promise(resolve => setTimeout(resolve, 800));
        setUser(userData);
        localStorage.setItem('safanet_user', JSON.stringify(userData));
        toast.warning(`Tabel database belum di-setup! Masuk dalam Mode Demo sebagai ${userData.name}. Silakan run init_db.sql di Supabase.`, {
          duration: 6000
        });
        return true;
      }

      // 2. REAL LOGIN: Query app_users table in Supabase
      const { data: dbUser, error: loginError } = await supabase
        .from('app_users')
        .select('*')
        .eq('username', username)
        .single();

      if (loginError || !dbUser) {
        toast.error('Kredensial salah atau akun tidak ditemukan');
        return false;
      }

      // Password comparison (simple secure match)
      if (dbUser.password !== password) {
        toast.error('Kredensial salah atau password tidak sesuai');
        return false;
      }

      const userRole = dbUser.role || 'petugas';
      const userData = {
        id: dbUser.id,
        username: dbUser.username,
        role: userRole,
        name: dbUser.name,
        phone: dbUser.phone || '',
        permissions: rolePermissions[userRole] || []
      };

      setUser(userData);
      localStorage.setItem('safanet_user', JSON.stringify(userData));
      toast.success(`Selamat datang kembali, ${userData.name}!`);
      return true;

    } catch (error) {
      console.error("Login error:", error);
      toast.error('Gagal Masuk: Koneksi ke server terganggu');
      return false;
    }
  };

  const logout = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser(null);
    localStorage.removeItem('safanet_user');
    toast.success('Berhasil keluar');
  };

  // Check if current user has permission to view a specific tab
  const hasPermission = (tabName) => {
    if (!user) return false;
    // Admin always has full access
    if (user.role === 'admin') return true;
    
    const permissions = rolePermissions[user.role] || [];
    return permissions.includes(tabName);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    appName,
    appLogo,
    rolePermissions,
    isDemoMode,
    refreshBranding: loadAppSettings,
    hasPermission,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isPetugas: user?.role === 'petugas',
    isTeknisi: user?.role === 'teknisi',
    isOwner: user?.role === 'owner'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
