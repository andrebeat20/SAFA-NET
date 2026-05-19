import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { 
  Settings, Users, Lock, Upload, Shield, Plus, Trash, Edit2, 
  Save, Building, Key, Phone, Check, RefreshCw, X, AlertTriangle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

export default function Pengaturan() {
  const { appName: currentAppName, appLogo: currentAppLogo, rolePermissions: currentPermissions, refreshBranding } = useAuth();
  
  // App Branding config states
  const [appName, setAppName] = useState(currentAppName);
  const [appLogo, setAppLogo] = useState(currentAppLogo);
  const [isSavingBranding, setIsSavingBranding] = useState(false);
  
  // User Management CRUD states
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // null means adding a new user, else editing
  
  const [isSavingUser, setIsSavingUser] = useState(false);

  // Role Permissions states
  const [permissions, setPermissions] = useState(currentPermissions);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);

  // Load users from Supabase app_users table
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      // Don't toast if table doesn't exist yet, we will show dynamic warning in UI
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    setAppName(currentAppName);
    setAppLogo(currentAppLogo);
    setPermissions(currentPermissions);
  }, [currentAppName, currentAppLogo, currentPermissions]);

  // Handle Logo Upload and encode to Base64
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file logo maksimal 2MB!');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAppLogo(reader.result); // Base64 data URL
      toast.success('Logo berhasil diunggah secara lokal! Simpan untuk menyimpan perubahan.');
    };
    reader.readAsDataURL(file);
  };

  // Save app name and logo to Supabase
  const handleSaveBranding = async () => {
    setIsSavingBranding(true);
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          id: 1,
          app_name: appName,
          logo_data: appLogo,
          role_permissions: permissions
        });

      if (error) throw error;
      
      toast.success('Pengaturan identitas usaha berhasil disimpan!');
      await refreshBranding();
    } catch (err) {
      console.error(err);
      toast.error('Gagal menyimpan identitas: ' + err.message);
    } finally {
      setIsSavingBranding(false);
    }
  };

  // Open User Modal for Creation
  const handleAddUserClick = () => {
    setSelectedUser(null);
    setIsUserModalOpen(true);
  };

  // Open User Modal for Editing
  const handleEditUserClick = (user) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  // Save User (Create or Update)
  const handleSaveUser = async (userData) => {
    if (!userData.name || !userData.username || !userData.password) {
      toast.error('Nama, Username, dan Password wajib diisi!');
      return;
    }

    setIsSavingUser(true);
    try {
      if (selectedUser) {
        // Update user
        const { error } = await supabase
          .from('app_users')
          .update({
            name: userData.name,
            username: userData.username,
            password: userData.password,
            role: userData.role,
            phone: userData.phone
          })
          .eq('id', selectedUser.id);

        if (error) throw error;
        toast.success(`Berhasil memperbarui pengguna ${userData.name}!`);
      } else {
        // Create user
        const { error } = await supabase
          .from('app_users')
          .insert({
            name: userData.name,
            username: userData.username,
            password: userData.password,
            role: userData.role,
            phone: userData.phone
          });

        if (error) throw error;
        toast.success(`Berhasil menambahkan pengguna baru ${userData.name}!`);
      }

      setIsUserModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error('Gagal menyimpan pengguna: ' + err.message);
    } finally {
      setIsSavingUser(false);
    }
  };

  // Delete User
  const handleDeleteUser = async (userToDelete) => {
    if (userToDelete.role === 'admin' && userToDelete.username === 'admin') {
      toast.error('Akun Administrator utama bawaan tidak boleh dihapus!');
      return;
    }

    const confirm = window.confirm(`Apakah Anda yakin ingin menghapus akun ${userToDelete.name}?`);
    if (!confirm) return;

    try {
      const { error } = await supabase
        .from('app_users')
        .delete()
        .eq('id', userToDelete.id);

      if (error) throw error;
      toast.success(`Pengguna ${userToDelete.name} berhasil dihapus!`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error('Gagal menghapus pengguna: ' + err.message);
    }
  };

  // Toggle permission in the matrix
  const handlePermissionToggle = (role, page) => {
    const roleCurrentPages = permissions[role] || [];
    let updatedPages = [];
    
    if (roleCurrentPages.includes(page)) {
      // Remove page
      updatedPages = roleCurrentPages.filter(p => p !== page);
    } else {
      // Add page
      updatedPages = [...roleCurrentPages, page];
    }
    
    const newPermissions = {
      ...permissions,
      [role]: updatedPages
    };
    
    setPermissions(newPermissions);
  };

  // Save modified role permissions to Supabase app_settings
  const handleSavePermissions = async () => {
    isSavingPermissions(true);
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          id: 1,
          app_name: appName,
          logo_data: appLogo,
          role_permissions: permissions
        });

      if (error) throw error;
      toast.success('Pengaturan hak akses berhasil diperbarui!');
      await refreshBranding();
    } catch (err) {
      console.error(err);
      toast.error('Gagal menyimpan hak akses: ' + err.message);
    } finally {
      isSavingPermissions(false);
    }
  };

  const availablePages = [
    { key: 'home', label: 'Dashboard Utama' },
    { key: 'pelanggan', label: 'Daftar Pelanggan' },
    { key: 'tagihan', label: 'Pemberitahuan & Tagihan' },
    { key: 'laporan', label: 'Laporan Finansial' },
    { key: 'pengaturan', label: 'Pengaturan' }
  ];

  const roles = [
    { key: 'admin', label: 'Admin (Full Access)' },
    { key: 'teknisi', label: 'Teknisi Lapangan' },
    { key: 'owner', label: 'Owner / Pemilik' },
    { key: 'petugas', label: 'Petugas Lapangan' }
  ];

  return (
    <div className="px-5 pb-24 font-outfit">
      
      {/* Page Title */}
      <div className="mb-6">
        <h2 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">Pengaturan</h2>
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Branding, Manajemen Pengguna & Hak Akses</p>
      </div>

      <div className="space-y-6">
        
        {/* Section 1: Identitas & Branding Aplikasi */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 dark:bg-slate-900/60 p-6 shadow-xl rounded-3xl border border-slate-200/30 dark:border-slate-800/30 backdrop-blur-xl transition-all"
        >
          <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4 mb-5">
            <div className="bg-brand/10 dark:bg-brand/20 p-2 rounded-xl text-brand">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[15px] text-[var(--text-primary)] leading-none">Identitas Usaha (Branding)</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Sesuaikan nama & logo aplikasi Anda</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Nama Usaha */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
                Nama Usaha / Nama Aplikasi
              </label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="block w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 text-[var(--text-primary)] rounded-2xl focus:ring-4 focus:ring-brand/10 focus:border-brand focus:bg-white dark:focus:bg-slate-950 transition-all text-xs font-black uppercase tracking-wider outline-none"
                placeholder="Masukkan nama aplikasi..."
              />
            </div>

            {/* Logo Uploader */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
                Logo Aplikasi
              </label>
              
              <div className="flex items-center gap-5 p-4 bg-slate-50/50 dark:bg-slate-950/30 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                {/* Logo Preview */}
                <div className="w-16 h-16 rounded-xl bg-brand/10 flex items-center justify-center overflow-hidden border border-slate-200/50 dark:border-slate-800/50 p-2.5 shadow-md flex-shrink-0">
                  {appLogo ? (
                    <img src={appLogo} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <Upload className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <p className="text-[11px] font-bold text-[var(--text-primary)]">Pilih File Logo Baru</p>
                  <p className="text-[9px] font-medium text-slate-400 leading-normal">Maksimal resolusi ideal 500x500 px. Format PNG/JPG maks 2MB.</p>
                  
                  <label className="inline-flex items-center gap-1.5 bg-brand/10 dark:bg-brand/20 hover:bg-brand/20 px-3 py-1.5 rounded-lg text-[10px] font-black text-brand uppercase tracking-wider cursor-pointer transition-all active:scale-95">
                    <Upload className="w-3.5 h-3.5" />
                    Pilih File
                    <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            {/* Save Button for Branding */}
            <div className="pt-2">
              <button
                onClick={handleSaveBranding}
                disabled={isSavingBranding}
                className="w-full flex justify-center items-center py-3 rounded-2xl shadow-lg shadow-brand/10 text-xs font-black tracking-wider text-white bg-gradient-to-r from-brand to-brand-dark hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSavingBranding ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                SIMPAN IDENTITAS APLIKASI
              </button>
            </div>
          </div>
        </motion.div>

        {/* Section 2: User Management (CRUD) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/70 dark:bg-slate-900/60 p-6 shadow-xl rounded-3xl border border-slate-200/30 dark:border-slate-800/30 backdrop-blur-xl transition-all"
        >
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="bg-brand/10 dark:bg-brand/20 p-2 rounded-xl text-brand">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-[15px] text-[var(--text-primary)] leading-none">Manajemen Pengguna</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Kelola akun Owner, Teknisi, dan Petugas</p>
              </div>
            </div>
            
            <button
              onClick={handleAddUserClick}
              className="flex items-center gap-1 bg-brand text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-brand/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah
            </button>
          </div>

          {/* User List */}
          {isLoadingUsers ? (
            <div className="flex justify-center items-center py-10">
              <RefreshCw className="w-8 h-8 text-brand animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 p-4 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-[var(--border-color)]">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Pengaturan Database Belum Di-Setup</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                Silakan copy-paste & jalankan instruksi SQL dari file <code className="font-black text-brand">init_db.sql</code> di editor Supabase Anda agar manajemen pengguna aktif sepenuhnya!
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {users.map(u => (
                <div 
                  key={u.id}
                  className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-950/30 border border-[var(--border-color)] rounded-2xl hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-extrabold text-[var(--text-primary)]">{u.name}</p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400' :
                        u.role === 'teknisi' ? 'bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400' :
                        u.role === 'owner' ? 'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {u.role}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold">
                      <span className="flex items-center gap-1"><Key className="w-3 h-3" /> {u.username}</span>
                      {u.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {u.phone}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleEditUserClick(u)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-400 rounded-xl transition-all cursor-pointer"
                      title="Edit Pengguna"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    
                    {!(u.role === 'admin' && u.username === 'admin') && (
                      <button
                        onClick={() => handleDeleteUser(u)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 text-rose-500 rounded-xl transition-all cursor-pointer"
                        title="Hapus Pengguna"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Section 3: Hak Akses Role Permissions Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 dark:bg-slate-900/60 p-6 shadow-xl rounded-3xl border border-slate-200/30 dark:border-slate-800/30 backdrop-blur-xl transition-all"
        >
          <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4 mb-5">
            <div className="bg-brand/10 dark:bg-brand/20 p-2 rounded-xl text-brand">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[15px] text-[var(--text-primary)] leading-none">Matriks Hak Akses (Role Permissions)</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Atur menu aplikasi yang dapat diakses tiap role</p>
            </div>
          </div>

          <div className="space-y-4">
            
            {/* The Permission Matrix Grid */}
            <div className="overflow-x-auto border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm bg-slate-50/50 dark:bg-slate-950/10">
              <table className="w-full text-left border-collapse text-[11px] font-bold">
                <thead>
                  <tr className="bg-slate-100/80 dark:bg-slate-900 border-b border-[var(--border-color)]">
                    <th className="py-3 px-4 text-slate-400 uppercase tracking-wider">Role Pengguna</th>
                    {availablePages.map(page => (
                      <th key={page.key} className="py-3 px-2 text-center text-slate-400 uppercase tracking-wider max-w-[80px] break-words">
                        {page.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {roles.map(role => (
                    <tr key={role.key} className="hover:bg-slate-100/40 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="py-4 px-4 font-black text-slate-700 dark:text-slate-300">
                        {role.label}
                      </td>
                      {availablePages.map(page => {
                        const isChecked = (permissions[role.key] || []).includes(page.key);
                        // Admin page permission is read-only and always true for Admin role
                        const isDisabled = role.key === 'admin';
                        
                        return (
                          <td key={page.key} className="py-4 px-2 text-center">
                            <label className="inline-flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                              <input
                                type="checkbox"
                                checked={isDisabled ? true : isChecked}
                                disabled={isDisabled}
                                onChange={() => handlePermissionToggle(role.key, page.key)}
                                className="hidden"
                              />
                              <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                (isDisabled || isChecked)
                                  ? 'bg-brand border-brand text-white' 
                                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                              }`}>
                                {(isDisabled || isChecked) && <Check className="w-3.5 h-3.5 stroke-[4]" />}
                              </div>
                            </label>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Save Button for Permissions */}
            <div className="pt-2">
              <button
                onClick={handleSavePermissions}
                disabled={isSavingPermissions}
                className="w-full flex justify-center items-center py-3 rounded-2xl shadow-lg shadow-brand/10 text-xs font-black tracking-wider text-white bg-gradient-to-r from-brand to-brand-dark hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSavingPermissions ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                SIMPAN MATRIKS HAK AKSES
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Dynamic Modal: Add/Edit User (Optimized Component) */}
      <UserModal 
        isOpen={isUserModalOpen} 
        onClose={() => setIsUserModalOpen(false)} 
        selectedUser={selectedUser} 
        onSave={handleSaveUser} 
        isSaving={isSavingUser} 
      />

    </div>
  );
}

// Sub-komponen Modal Teroptimasi agar ketikan input lancar tanpa render ulang induk
function UserModal({ isOpen, onClose, selectedUser, onSave, isSaving }) {
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('petugas');
  const [formPhone, setFormPhone] = useState('');

  useEffect(() => {
    if (selectedUser) {
      setFormName(selectedUser.name || '');
      setFormUsername(selectedUser.username || '');
      setFormPassword(selectedUser.password || '');
      setFormRole(selectedUser.role || 'petugas');
      setFormPhone(selectedUser.phone || '');
    } else {
      setFormName('');
      setFormUsername('');
      setFormPassword('');
      setFormRole('petugas');
      setFormPhone('');
    }
  }, [selectedUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name: formName,
      username: formUsername,
      password: formPassword,
      role: formRole,
      phone: formPhone
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-5"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full max-w-sm bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[32px] overflow-hidden shadow-2xl p-6 relative z-50 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                onClick={onClose}
                className="absolute top-5 right-5 p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-500 rounded-full transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Title */}
              <div className="mb-6 flex items-center gap-3">
                <div className="bg-brand/10 p-2 rounded-xl text-brand">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-[15px] text-[var(--text-primary)] leading-none">
                    {selectedUser ? 'Edit Pengguna' : 'Tambah Pengguna'}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">
                    {selectedUser ? 'Perbarui informasi akun' : 'Buat kredensial akun baru'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Input */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    disabled={isSaving}
                    className="block w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 text-[var(--text-primary)] rounded-2xl focus:ring-4 focus:ring-brand/10 focus:border-brand text-xs font-semibold outline-none transition-all"
                    placeholder="Contoh: Andre Beat"
                  />
                </div>

                {/* Username Input */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Username / ID Login</label>
                  <input
                    type="text"
                    required
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    disabled={isSaving}
                    className="block w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 text-[var(--text-primary)] rounded-2xl focus:ring-4 focus:ring-brand/10 focus:border-brand text-xs font-semibold outline-none transition-all"
                    placeholder="Contoh: andre_lapangan"
                  />
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Kata Sandi (Password)</label>
                  <input
                    type="text"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    disabled={isSaving}
                    className="block w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 text-[var(--text-primary)] rounded-2xl focus:ring-4 focus:ring-brand/10 focus:border-brand text-xs font-semibold outline-none transition-all"
                    placeholder="Ketik password pengguna..."
                  />
                </div>

                {/* Phone Input */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">No HP / WhatsApp (Opsional)</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    disabled={isSaving}
                    className="block w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 text-[var(--text-primary)] rounded-2xl focus:ring-4 focus:ring-brand/10 focus:border-brand text-xs font-semibold outline-none transition-all"
                    placeholder="Contoh: 081234567890"
                  />
                </div>

                {/* Role Select Input */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Hak Akses (Role)</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    disabled={isSaving}
                    className="block w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 text-[var(--text-primary)] rounded-2xl focus:ring-4 focus:ring-brand/10 focus:border-brand text-xs font-semibold outline-none transition-all cursor-pointer"
                  >
                    {selectedUser?.role === 'admin' && (
                      <option value="admin">Administrator (Full Access)</option>
                    )}
                    <option value="teknisi">Teknisi Lapangan</option>
                    <option value="owner">Owner / Pemilik</option>
                    <option value="petugas">Petugas Lapangan</option>
                  </select>
                </div>

                {/* Submit Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full flex justify-center items-center py-3.5 px-4 rounded-2xl shadow-lg shadow-brand/10 text-xs font-black tracking-wider text-white bg-gradient-to-r from-brand to-brand-dark hover:brightness-110 transition-all disabled:opacity-70 cursor-pointer"
                  >
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    {selectedUser ? 'SIMPAN PERUBAHAN' : 'BUAT AKUN PENGGUNA'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
