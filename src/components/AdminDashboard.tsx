
import React from 'react';
import { Users, FileText, MessageSquare, CreditCard, Package, BarChart3, Megaphone, Settings, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, onLogout }) => {
  const { toast } = useToast();

  const menuItems = [
    {
      id: 'kelola-user',
      title: 'Kelola Pengguna',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      description: 'Manajemen data pengguna'
    },
    {
      id: 'kelola-postingan',
      title: 'Kelola Postingan',
      icon: FileText,
      color: 'from-green-500 to-green-600',
      description: 'Moderasi konten postingan'
    },
    {
      id: 'kelola-komentar',
      title: 'Kelola Komentar',
      icon: MessageSquare,
      color: 'from-purple-500 to-purple-600',
      description: 'Moderasi komentar pengguna'
    },
    {
      id: 'kelola-transaksi',
      title: 'Kelola Transaksi',
      icon: CreditCard,
      color: 'from-yellow-500 to-yellow-600',
      description: 'Manajemen transaksi'
    },
    {
      id: 'kelola-paket',
      title: 'Kelola Paket Premium',
      icon: Package,
      color: 'from-pink-500 to-pink-600',
      description: 'Paket berlangganan'
    },
    {
      id: 'statistik',
      title: 'Statistik Aplikasi',
      icon: BarChart3,
      color: 'from-indigo-500 to-indigo-600',
      description: 'Data dan analitik'
    },
    {
      id: 'pengumuman',
      title: 'Broadcast Pengumuman',
      icon: Megaphone,
      color: 'from-red-500 to-red-600',
      description: 'Kirim pengumuman'
    },
    {
      id: 'pengaturan',
      title: 'Pengaturan Aplikasi',
      icon: Settings,
      color: 'from-gray-500 to-gray-600',
      description: 'Konfigurasi sistem'
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('arvinmatch_admin');
    toast({
      title: "Logout Berhasil",
      description: "Sampai jumpa lagi!",
    });
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-blue-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-blue-900">ARVINmatch Admin</h1>
              <p className="text-blue-600 text-sm">Panel Administrasi</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Dashboard Admin</h2>
          <p className="text-gray-600">Kelola semua aspek aplikasi ARVINmatch dari sini</p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 border border-gray-100"
              >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center mb-4`}>
                  <IconComponent className="text-white" size={20} />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2 text-sm leading-tight">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-500">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-500">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-500">Comments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">0</div>
              <div className="text-sm text-gray-500">Transactions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
