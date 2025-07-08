
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CreditCard, Plus, X } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type TransactionData = Tables<'transactions'>;

interface KelolaTransaksiProps {
  onBack: () => void;
}

const KelolaTransaksi: React.FC<KelolaTransaksiProps> = ({ onBack }) => {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddBalance, setShowAddBalance] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
    fetchUsers();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data transaksi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, email')
        .order('username');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAddBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserId || !amount) {
      toast({
        title: "Error",
        description: "Pilih user dan masukkan jumlah saldo",
        variant: "destructive",
      });
      return;
    }

    try {
      // Add transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: selectedUserId,
          type: 'admin_top_up',
          amount: parseFloat(amount),
          description: 'Top-up manual oleh admin',
          status: 'completed'
        });

      if (transactionError) throw transactionError;

      // Update user balance
      const { data: userData, error: getUserError } = await supabase
        .from('users')
        .select('balance')
        .eq('id', selectedUserId)
        .single();

      if (getUserError) throw getUserError;

      const currentBalance = Number(userData.balance || 0);
      const newBalance = currentBalance + parseFloat(amount);

      const { error: updateError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', selectedUserId);

      if (updateError) throw updateError;

      // Reset form
      setSelectedUserId('');
      setAmount('');
      setShowAddBalance(false);
      
      await fetchTransactions();
      toast({
        title: "Berhasil",
        description: `Saldo berhasil ditambahkan sebesar Rp ${parseFloat(amount).toLocaleString('id-ID')}`,
      });
    } catch (error) {
      console.error('Error adding balance:', error);
      toast({
        title: "Error",
        description: "Gagal menambah saldo",
        variant: "destructive",
      });
    }
  };

  const handleCancelTransaction = async (transactionId: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

      if (error) throw error;

      await fetchTransactions();
      toast({
        title: "Berhasil",
        description: "Transaksi berhasil dibatalkan",
      });
    } catch (error) {
      console.error('Error canceling transaction:', error);
      toast({
        title: "Error",
        description: "Gagal membatalkan transaksi",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600">Memuat data transaksi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft size={20} />
            <span>Kembali ke Dashboard</span>
          </button>

          <button
            onClick={() => setShowAddBalance(true)}
            className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={16} />
            <span>Tambah Saldo</span>
          </button>
        </div>

        {/* Add Balance Modal */}
        {showAddBalance && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Tambah Saldo Manual</h3>
                <button
                  onClick={() => setShowAddBalance(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddBalance} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pilih User
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Pilih User</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jumlah Saldo
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan jumlah"
                    min="1000"
                    step="1000"
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddBalance(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Tambah Saldo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Kelola Transaksi</h2>

          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Belum ada transaksi</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.type === 'top_up' || transaction.type === 'admin_top_up'
                            ? 'bg-green-100 text-green-800'
                            : transaction.type === 'send'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {transaction.type}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </div>
                      
                      <div className="mb-2">
                        <p className="font-semibold text-lg">
                          Rp {Number(transaction.amount).toLocaleString('id-ID')}
                        </p>
                        <p className="text-sm text-gray-600">
                          User ID: {transaction.user_id?.substring(0, 8)}...
                        </p>
                        {transaction.description && (
                          <p className="text-sm text-gray-500">{transaction.description}</p>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.created_at).toLocaleString('id-ID')}
                      </p>
                    </div>

                    <button
                      onClick={() => handleCancelTransaction(transaction.id)}
                      className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm transition-colors ml-4"
                    >
                      <X size={16} />
                      <span>Batalkan</span>
                    </button>
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

export default KelolaTransaksi;
