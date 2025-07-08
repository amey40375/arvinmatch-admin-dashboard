
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Megaphone, Send, Clock, CheckCircle } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type AnnouncementData = Tables<'announcements'>;

interface PengumumanProps {
  onBack: () => void;
}

const Pengumuman: React.FC<PengumumanProps> = ({ onBack }) => {
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data pengumuman",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Error",
        description: "Judul dan isi pengumuman harus diisi",
        variant: "destructive",
      });
      return;
    }

    setSending(true);

    try {
      const { error } = await supabase
        .from('announcements')
        .insert({
          title: formData.title.trim(),
          content: formData.content.trim(),
          type: formData.type,
          is_active: true
        });

      if (error) throw error;

      // Reset form
      setFormData({
        title: '',
        content: '',
        type: 'general'
      });

      await fetchAnnouncements();
      
      toast({
        title: "Berhasil",
        description: "Pengumuman berhasil dikirim!",
      });
    } catch (error) {
      console.error('Error sending announcement:', error);
      toast({
        title: "Error",
        description: "Gagal mengirim pengumuman",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const toggleAnnouncementStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      await fetchAnnouncements();
      
      toast({
        title: "Berhasil",
        description: `Pengumuman ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`,
      });
    } catch (error) {
      console.error('Error updating announcement:', error);
      toast({
        title: "Error",
        description: "Gagal mengubah status pengumuman",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600">Memuat data pengumuman...</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Pengumuman */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-2 mb-6">
              <Megaphone className="text-blue-600" size={24} />
              <h2 className="text-xl font-bold text-gray-800">Buat Pengumuman Baru</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Pengumuman
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="general">Umum</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="update">Update</option>
                  <option value="promotion">Promosi</option>
                  <option value="warning">Peringatan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Pengumuman
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan judul pengumuman"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Isi Pengumuman
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={6}
                  placeholder="Tuliskan isi pengumuman di sini..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Kirim Pengumuman</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Riwayat Pengumuman */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Riwayat Pengumuman</h2>

            {announcements.length === 0 ? (
              <div className="text-center py-12">
                <Clock size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Belum ada pengumuman yang dikirim</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {announcements.map((announcement) => (
                  <div 
                    key={announcement.id} 
                    className={`border rounded-lg p-4 transition-all ${
                      announcement.is_active 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-800">{announcement.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            announcement.type === 'general' ? 'bg-blue-100 text-blue-800' :
                            announcement.type === 'maintenance' ? 'bg-orange-100 text-orange-800' :
                            announcement.type === 'update' ? 'bg-green-100 text-green-800' :
                            announcement.type === 'promotion' ? 'bg-purple-100 text-purple-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {announcement.type}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {announcement.content}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(announcement.created_at).toLocaleString('id-ID')}
                        </p>
                      </div>

                      <button
                        onClick={() => toggleAnnouncementStatus(announcement.id, announcement.is_active || false)}
                        className={`ml-4 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          announcement.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {announcement.is_active ? (
                          <div className="flex items-center space-x-1">
                            <CheckCircle size={12} />
                            <span>Aktif</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <Clock size={12} />
                            <span>Nonaktif</span>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pengumuman;
