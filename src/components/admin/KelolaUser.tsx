
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Eye, Ban, Crown, User } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type UserData = Tables<'users'>;

interface KelolaUserProps {
  onBack: () => void;
}

const KelolaUser: React.FC<KelolaUserProps> = ({ onBack }) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data pengguna",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
      const { error } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) throw error;

      await fetchUsers();
      toast({
        title: "Berhasil",
        description: `User ${newStatus === 'blocked' ? 'diblokir' : 'dibuka blokirnya'}`,
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Gagal mengubah status user",
        variant: "destructive",
      });
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    try {
      const newRole = currentRole === 'premium' ? 'user' : 'premium';
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      await fetchUsers();
      toast({
        title: "Berhasil",
        description: `Role user diubah menjadi ${newRole}`,
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Gagal mengubah role user",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600">Memuat data pengguna...</p>
        </div>
      </div>
    );
  }

  if (selectedUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <button
              onClick={() => setSelectedUser(null)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft size={20} />
              <span>Kembali ke Daftar User</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Detail Pengguna</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-4">Informasi Dasar</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-500">Nama Lengkap</label>
                    <p className="font-medium">{selectedUser.full_name || 'Tidak ada'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Username</label>
                    <p className="font-medium">{selectedUser.username}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Email</label>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Phone</label>
                    <p className="font-medium">{selectedUser.phone || 'Tidak ada'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-4">Status & Akun</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-500">Role</label>
                    <p className="font-medium capitalize">{selectedUser.role}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Status</label>
                    <p className={`font-medium capitalize ${
                      selectedUser.status === 'active' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedUser.status}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Saldo</label>
                    <p className="font-medium">Rp {Number(selectedUser.balance || 0).toLocaleString('id-ID')}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Premium</label>
                    <p className="font-medium">
                      {selectedUser.is_premium ? 'Ya' : 'Tidak'}
                      {selectedUser.premium_until && (
                        <span className="text-sm text-gray-500 block">
                          Sampai: {new Date(selectedUser.premium_until).toLocaleDateString('id-ID')}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {selectedUser.bio && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-700 mb-2">Bio</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedUser.bio}</p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-500">
                Bergabung: {new Date(selectedUser.created_at).toLocaleDateString('id-ID')}
              </p>
              <p className="text-sm text-gray-500">
                Update terakhir: {new Date(selectedUser.updated_at).toLocaleDateString('id-ID')}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft size={20} />
            <span>Kembali ke Dashboard</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Kelola Pengguna</h2>

          {users.length === 0 ? (
            <div className="text-center py-12">
              <User size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Belum ada pengguna terdaftar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-800">
                          {user.full_name || user.username}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'premium' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-sm text-gray-500">
                        Saldo: Rp {Number(user.balance || 0).toLocaleString('id-ID')}
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="flex items-center space-x-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                      >
                        <Eye size={16} />
                        <span>Detail</span>
                      </button>
                      
                      <button
                        onClick={() => handleToggleRole(user.id, user.role || 'user')}
                        className="flex items-center space-x-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                      >
                        {user.role === 'premium' ? <User size={16} /> : <Crown size={16} />}
                        <span>{user.role === 'premium' ? 'User' : 'Premium'}</span>
                      </button>

                      <button
                        onClick={() => handleBlockUser(user.id, user.status || 'active')}
                        className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                          user.status === 'blocked'
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                      >
                        <Ban size={16} />
                        <span>{user.status === 'blocked' ? 'Buka Blokir' : 'Blokir'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KelolaUser;
