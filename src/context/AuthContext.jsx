import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cek apakah ada data login di localStorage saat pertama kali load
  useEffect(() => {
    const savedUser = localStorage.getItem('safanet_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    if (!email || !password) {
      toast.error('Email dan Password harus diisi');
      return false;
    }

    let role = 'petugas'; 
    if (email.toLowerCase().includes('admin')) {
      role = 'admin';
    } else if (email.toLowerCase().includes('teknisi')) {
      role = 'teknisi';
    } else if (email.toLowerCase().includes('owner')) {
      role = 'owner';
    }

    const userData = {
      id: Date.now(),
      email,
      role,
      name: role === 'admin' ? 'Administrator' : 
            role === 'teknisi' ? 'Teknisi Lapangan' : 
            role === 'owner' ? 'Owner / Pemilik' : 'Petugas Lapangan'
    };

    // Simulasi delay jaringan agar ada loading state yang smooth
    await new Promise(resolve => setTimeout(resolve, 1000));

    setUser(userData);
    localStorage.setItem('safanet_user', JSON.stringify(userData));
    toast.success(`Berhasil masuk sebagai ${userData.name}`);
    return true;
  };

  const logout = async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    setUser(null);
    localStorage.removeItem('safanet_user');
    toast.success('Berhasil keluar');
  };

  const value = {
    user,
    login,
    logout,
    loading,
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
