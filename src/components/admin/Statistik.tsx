
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Users, FileText, MessageSquare, CreditCard, TrendingUp, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface StatistikProps {
  onBack: () => void;
}

interface Stats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  totalTransactions: number;
  totalRevenue: number;
  activeUsers: number;
  premiumUsers: number;
  blockedUsers: number;
}

const Statistik: React.FC<StatistikProps> = ({ onBack }) => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    activeUsers: 0,
    premiumUsers: 0,
    blockedUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      // Fetch users stats
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('status, role, is_premium, balance');

      if (usersError) throw usersError;

      // Fetch posts count
      const { count: postsCount, error: postsError } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });

      if (postsError) throw postsError;

      // Fetch comments count
      const { count: commentsCount, error: commentsError } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true });

      if (commentsError) throw commentsError;

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('amount, type');

      if (transactionsError) throw transactionsError;

      // Calculate stats
      const totalUsers = usersData?.length || 0;
      const activeUsers = usersData?.filter(u => u.status === 'active').length || 0;
      const premiumUsers = usersData?.filter(u => u.is_premium || u.role === 'premium').length || 0;
      const blockedUsers = usersData?.filter(u => u.status === 'blocked').length || 0;
      
      const totalTransactions = transactionsData?.length || 0;
      const totalRevenue = transactionsData?.reduce((sum, t) => {
        if (t.type === 'top_up' || t.type === 'admin_top_up') {
          return sum + Number(t.amount);
        }
        return sum;
      }, 0) || 0;

      setStats({
        totalUsers,
        totalPosts: postsCount || 0,
        totalComments: commentsCount || 0,
        totalTransactions,
        totalRevenue,
        activeUsers,
        premiumUsers,
        blockedUsers
      });

    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data statistik",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Users', value: stats.totalUsers, color: '#3B82F6' },
    { name: 'Posts', value: stats.totalPosts, color: '#10B981' },
    { name: 'Comments', value: stats.totalComments, color: '#8B5CF6' },
    { name: 'Transactions', value: stats.totalTransactions, color: '#F59E0B' }
  ];

  const userStatusData = [
    { name: 'Active', value: stats.activeUsers, color: '#10B981' },
    { name: 'Premium', value: stats.premiumUsers, color: '#F59E0B' },
    { name: 'Blocked', value: stats.blockedUsers, color: '#EF4444' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600">Memuat data statistik...</p>
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
          <h2 className="text-xl font-bold text-gray-800 mb-6">Statistik Aplikasi</h2>

          {/* Main Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users size={24} className="text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Posts</p>
                  <p className="text-2xl font-bold">{stats.totalPosts}</p>
                </div>
                <FileText size={24} className="text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Total Comments</p>
                  <p className="text-2xl font-bold">{stats.totalComments}</p>
                </div>
                <MessageSquare size={24} className="text-purple-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Transactions</p>
                  <p className="text-2xl font-bold">{stats.totalTransactions}</p>
                </div>
                <CreditCard size={24} className="text-yellow-200" />
              </div>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100">Total Revenue</p>
                <p className="text-3xl font-bold">
                  Rp {stats.totalRevenue.toLocaleString('id-ID')}
                </p>
                <p className="text-emerald-200 text-sm mt-1">
                  Dari top-up dan pembayaran premium
                </p>
              </div>
              <TrendingUp size={32} className="text-emerald-200" />
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Overview Chart */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Overview Data</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* User Status Chart */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Users</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={userStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {userStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-800 mb-3">User Statistics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Users:</span>
                  <span className="font-medium text-green-600">{stats.activeUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Premium Users:</span>
                  <span className="font-medium text-yellow-600">{stats.premiumUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Blocked Users:</span>
                  <span className="font-medium text-red-600">{stats.blockedUsers}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Content Stats</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Posts:</span>
                  <span className="font-medium">{stats.totalPosts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Comments:</span>
                  <span className="font-medium">{stats.totalComments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Comments/Post:</span>
                  <span className="font-medium">
                    {stats.totalPosts > 0 ? (stats.totalComments / stats.totalPosts).toFixed(1) : '0'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Financial Overview</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Transactions:</span>
                  <span className="font-medium">{stats.totalTransactions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Revenue:</span>
                  <span className="font-medium text-green-600">
                    Rp {stats.totalRevenue.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Transaction:</span>
                  <span className="font-medium">
                    Rp {stats.totalTransactions > 0 
                      ? (stats.totalRevenue / stats.totalTransactions).toLocaleString('id-ID') 
                      : '0'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 text-blue-700">
              <Calendar size={16} />
              <span className="text-sm">Data terakhir diperbarui: {new Date().toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistik;
