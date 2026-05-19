import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../context/AuthContext'; // Tambahkan ini
import {
  Building, Users, Shield, Plus, Edit2, Trash2, CheckCircle2, 
  XCircle, Save, Key, RefreshCw, Upload, Eye, EyeOff, X, Loader2 
} from 'lucide-react';
import { toast } from 'sonner';

// Define the permissions mapping for references
const defaultPermissions = {
  admin: { home: true, pelanggan: true, tagihan: true, laporan: true, pengaturan: true },
  teknisi: { home: true, pelanggan: false, tagihan: true, laporan: false, pengaturan: false },
  owner: { home: true, pelanggan: true, tagihan: false, laporan: true, pengaturan: false },
  petugas: { home: true, pelanggan: false, tagihan: true, laporan: false, pengaturan: false }
};

// Helper to convert DB format JSON array back to frontend Boolean mapping
const convertToBools = (dbPermissions) => {
  const result = {
    admin: { home: true, pelanggan: true, tagihan: true, laporan: true, pengaturan: true },
    teknisi: { home: false, pelanggan: false, tagihan: false, laporan: false, pengaturan: false },
    owner: { home: false, pelanggan: false, tagihan: false, laporan: false, pengaturan: false },
    petugas: { home: false, pelanggan: false, tagihan: false, laporan: false, pengaturan: false }
  };
  
  if (!dbPermissions) return result;
  
  const roles = ['teknisi', 'owner', 'petugas'];
  roles.forEach(role => {
    const roleArr = dbPermissions[role] || [];
    roleArr.forEach(feature => {
      if (result[role]) {
        result[role][feature] = true;
      }
    });
  });
  
  return result;
};

// Helper to convert frontend Boolean mapping back to DB JSON array format
const convertToArrays = (boolPermissions) => {
  const result = {
    admin: ["home", "pelanggan", "tagihan", "laporan", "pengaturan"],
    teknisi: [],
    owner: [],
    petugas: []
  };
  
  const roles = ['teknisi', 'owner', 'petugas'];
  const features = ['home', 'pelanggan', 'tagihan', 'laporan', 'pengaturan'];
  
  roles.forEach(role => {
    features.forEach(feature => {
      if (boolPermissions[role]?.[feature]) {
        result[role].push(feature);
      }
    });
  });
  
  return result;
};

export default function Pengaturan() {
  const { refreshBranding } = useAuthContext(); // Gunakan fungsi refresh dari context
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSavingUser, setIsSavingUser] = useState(false);

  // Role Permissions states
  const [permissions, setPermissions] = useState(defaultPermissions);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);

  // App Branding states
  const [appNameInput, setAppNameInput] = useState('');
  const [appLogoInput, setAppLogoInput] = useState('');
  const [isSavingBranding, setIsSavingBranding] = useState(false);

  // Fetch current branding on mount
  useEffect(() => {
    fetchBranding();
    fetchUsers();
  }, []);

  const fetchBranding = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setAppNameInput(data.app_name || 'SAFA-NET');
        setAppLogoInput(data.logo_data || '');
        if (data.role_permissions) {
          setPermissions(convertToBools(data.role_permissions));
        }
      }
    } catch (err) {
      console.error('Gagal memuat branding:', err);
    }
  };

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
      console.error(err);
      toast.error('Gagal mengambil daftar pengguna: ' + err.message);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleAddUserClick = () => {
    setSelectedUser(null);
    setIsUserModalOpen(true);
  };

  const handleEditUserClick = (user) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (userData) => {
    if (!userData.name || !userData.username || !userData.password) {
      toast.error('Nama, Username, dan Password wajib diisi!');
      return;
    }

    setIsSavingUser(true);
    try {
      if (selectedUser) {
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

  const handleDeleteUser = async (id, name) => {
    if (confirm(`Apakah Anda yakin ingin menghapus akun ${name}?`)) {
      try {
        const { error } = await supabase
          .from('app_users')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        toast.success(`Akun ${name} telah dihapus!`);
        fetchUsers();
      } catch (err) {
        console.error(err);
        toast.error('Gagal menghapus pengguna: ' + err.message);
      }
    }
  };

  const handleSaveBranding = async () => {
    if (!appNameInput.trim()) {
      toast.error('Nama aplikasi tidak boleh kosong!');
      return;
    }

    setIsSavingBranding(true);
    try {
      const { data: existing } = await supabase
        .from('app_settings')
        .select('id')
        .maybeSingle();

      let error;
      if (existing) {
        const { error: updateErr } = await supabase
          .from('app_settings')
          .update({
            app_name: appNameInput,
            logo_data: appLogoInput
          })
          .eq('id', existing.id);
        error = updateErr;
      } else {
        const { error: insertErr } = await supabase
          .from('app_settings')
          .insert({
            id: 1,
            app_name: appNameInput,
            logo_data: appLogoInput
          });
        error = insertErr;
      }

      if (error) throw error;

      // Update global context so logo changes instantly in header/login
      await refreshBranding();

      toast.success('Pengaturan identitas aplikasi berhasil disimpan!');
    } catch (err) {
      console.error(err);
      toast.error('Gagal menyimpan branding: ' + err.message);
    } finally {
      setIsSavingBranding(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Berkas harus berupa gambar!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setAppLogoInput(event.target.result);
      toast.success('Pratinjau logo siap. Klik SIMPAN untuk menerapkan.');
    };
    reader.onerror = () => {
      toast.error('Gagal membaca gambar logo.');
    };
    reader.readAsDataURL(file);
  };

  const handlePermissionChange = (role, feature) => {
    if (role === 'admin') {
      toast.error('Hak akses Administrator tidak dapat dimodifikasi.');
      return;
    }
    setPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [feature]: !prev[role][feature]
      }
    }));
  };

  const handleSavePermissions = async () => {
    setIsSavingPermissions(true);
    try {
      const dbPermissions = convertToArrays(permissions);
      const { error } = await supabase
        .from('app_settings')
        .update({ role_permissions: dbPermissions })
        .eq('id', 1);

      if (error) throw error;
      await refreshBranding();
      toast.success('Matriks Hak Akses berhasil diperbarui!');
    } catch (err) {
      console.error(err);
      toast.error('Gagal menyimpan matriks hak akses: ' + err.message);
    } finally {
      setIsSavingPermissions(false);
    }
  };

  return (
    <div className="pb-28 px-5 pt-4">
      {/* Page Title */}
      <div className="mb-8">
        <h2 className="text-3xl font-black tracking-tight text-[var(--text-primary)] transition-colors">PENGATURAN</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Konfigurasi & Manajemen Aplikasi</p>
      </div>

      <div className="space-y-6">
        
        {/* Section 1: Identitas & Branding Aplikasi */}
        <div className="bg-white/70 dark:bg-slate-900/60 p-6 shadow-xl rounded-3xl border border-slate-200/30 dark:border-slate-800/30 backdrop-blur-xl transition-all">
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
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nama Aplikasi / Usaha</label>
              <input
                type="text"
                value={appNameInput}
                onChange={(e) => setAppNameInput(e.target.value)}
                className="block w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 text-[var(--text-primary)] rounded-2xl focus:ring-4 focus:ring-brand/10 focus:border-brand text-xs font-semibold outline-none transition-all"
                placeholder="Contoh: SAFA-NET"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Logo Aplikasi</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl flex items-center justify-center overflow-hidden p-2 flex-shrink-0">
                  {appLogoInput ? (
                    <img src={appLogoInput} alt="Preview Logo" className="w-full h-full object-contain" />
                  ) : (
                    <Building className="w-6 h-6 text-slate-450 dark:text-slate-700" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-350 text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95 border border-slate-200/50 dark:border-slate-700/50">
                      <Upload className="w-3.5 h-3.5" />
                      PILIH GAMBAR
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLogoUpload}
                        className="hidden" 
                      />
                    </label>

                    {appLogoInput && (
                      <button
                        onClick={() => setAppLogoInput('')}
                        className="px-3 py-2 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-100 transition-all text-[10px] font-black uppercase tracking-wider active:scale-95 cursor-pointer"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                  <p className="text-[9px] text-slate-450 dark:text-slate-600 font-bold uppercase">Format (PNG, JPG, SVG). Max 1MB.</p>
                </div>
              </div>
            </div>

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
        </div>

        {/* Section 2: User Management */}
        <div className="bg-white/70 dark:bg-slate-900/60 p-6 shadow-xl rounded-3xl border border-slate-200/30 dark:border-slate-800/30 backdrop-blur-xl transition-all">
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
              className="flex items-center gap-1.5 px-3 py-2 bg-brand text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-lg shadow-brand/20 hover:brightness-110 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              TAMBAH
            </button>
          </div>

          {isLoadingUsers ? (
            <div className="py-12 flex justify-center items-center">
              <Loader2 className="w-8 h-8 text-brand animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div 
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-2xl transition-colors hover:bg-slate-50 dark:hover:bg-slate-950/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 font-extrabold text-xs">
                      {user.role.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[var(--text-primary)]">{user.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] font-extrabold bg-brand/10 text-brand px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {user.role}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold">@{user.username}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditUserClick(user)}
                      className="p-2 bg-slate-150 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-500 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="p-2 bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Hak Akses */}
        <div className="bg-white/70 dark:bg-slate-900/60 p-6 shadow-xl rounded-3xl border border-slate-200/30 dark:border-slate-800/30 backdrop-blur-xl transition-all">
          <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4 mb-5">
            <div className="bg-brand/10 dark:bg-brand/20 p-2 rounded-xl text-brand">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[15px] text-[var(--text-primary)] leading-none">Matriks Hak Akses (Role Permissions)</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Batasi fitur tiap peran</p>
            </div>
          </div>

          <div className="overflow-x-auto -mx-6 px-6 pb-2">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-[var(--border-color)]">
                  <th className="pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Akses Fitur \ Peran</th>
                  {['admin', 'teknisi', 'owner', 'petugas'].map(role => (
                    <th key={role} className="pb-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {role}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {[
                  { key: 'home', label: 'Dashboard Utama (Home)' },
                  { key: 'pelanggan', label: 'Manajemen Data Pelanggan' },
                  { key: 'tagihan', label: 'Pencatatan & Konfirmasi Tagihan' },
                  { key: 'laporan', label: 'Grafik Laporan Bulanan' },
                  { key: 'pengaturan', label: 'Konfigurasi & Pengaturan Role' }
                ].map(feature => (
                  <tr key={feature.key} className="hover:bg-slate-50/30 dark:hover:bg-slate-950/10 transition-colors">
                    <td className="py-4 text-xs font-bold text-[var(--text-primary)]">{feature.label}</td>
                    {['admin', 'teknisi', 'owner', 'petugas'].map(role => {
                      const hasAccess = permissions[role]?.[feature.key];
                      const isMutlalk = role === 'admin';
                      return (
                        <td key={role} className="py-4 text-center">
                          <button
                            onClick={() => handlePermissionChange(role, feature.key)}
                            disabled={isMutlalk}
                            className={`inline-flex items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                              hasAccess 
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                                : 'bg-rose-50 border-rose-100 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400'
                            } ${isMutlalk ? 'opacity-80 cursor-not-allowed' : 'active:scale-90'}`}
                          >
                            {hasAccess ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-6 border-t border-[var(--border-color)] mt-5">
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
      </div>

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-slate-950/70" onClick={onClose} />
      <div className="w-full max-w-sm bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[32px] overflow-hidden shadow-2xl p-6 relative z-50 transition-colors">
        <button onClick={onClose} className="absolute top-5 right-5 p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full transition-all cursor-pointer">
          <X className="w-4 h-4" />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="bg-brand/10 p-2 rounded-xl text-brand">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-[15px] text-[var(--text-primary)] leading-none">
              {selectedUser ? 'Edit Pengguna' : 'Tambah Pengguna'}
            </h4>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nama Lengkap</label>
            <input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)} disabled={isSaving} className="block w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 text-[var(--text-primary)] rounded-2xl focus:border-brand text-xs font-semibold outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Username</label>
            <input type="text" required value={formUsername} onChange={(e) => setFormUsername(e.target.value)} disabled={isSaving} className="block w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 text-[var(--text-primary)] rounded-2xl focus:border-brand text-xs font-semibold outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Password</label>
            <input type="text" required value={formPassword} onChange={(e) => setFormPassword(e.target.value)} disabled={isSaving} className="block w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 text-[var(--text-primary)] rounded-2xl focus:border-brand text-xs font-semibold outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Hak Akses</label>
            <select value={formRole} onChange={(e) => setFormRole(e.target.value)} disabled={isSaving} className="block w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 text-[var(--text-primary)] rounded-2xl focus:border-brand text-xs font-semibold outline-none">
              {selectedUser?.role === 'admin' && <option value="admin">Administrator</option>}
              <option value="teknisi">Teknisi</option>
              <option value="owner">Owner</option>
              <option value="petugas">Petugas</option>
            </select>
          </div>
          <div className="pt-3">
            <button type="submit" disabled={isSaving} className="w-full flex justify-center items-center py-3.5 px-4 rounded-2xl text-white bg-gradient-to-r from-brand to-brand-dark font-black text-xs cursor-pointer">
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              SIMPAN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
