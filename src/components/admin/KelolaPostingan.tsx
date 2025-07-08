
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, FileText, Trash2, AlertTriangle } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type PostData = Tables<'posts'>;

interface KelolaPostinganProps {
  onBack: () => void;
}

const KelolaPostingan: React.FC<KelolaPostinganProps> = ({ onBack }) => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Kata-kata kasar untuk auto-moderasi
  const badWords = ['anjing', 'babi', 'bangsat', 'bodoh', 'tolol', 'goblok', 'idiot', 'sial'];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data postingan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const containsBadWords = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return badWords.some(word => lowerText.includes(word));
  };

  const handleDeletePost = async (postId: string, content: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      await fetchPosts();
      
      const isAutoDelete = containsBadWords(content);
      toast({
        title: "Berhasil",
        description: isAutoDelete 
          ? "Postingan otomatis dihapus karena mengandung kata kasar" 
          : "Postingan berhasil dihapus",
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus postingan",
        variant: "destructive",
      });
    }
  };

  const autoModeratePosts = async () => {
    const postsToDelete = posts.filter(post => containsBadWords(post.content));
    
    if (postsToDelete.length === 0) {
      toast({
        title: "Info",
        description: "Tidak ada postingan yang mengandung kata kasar",
      });
      return;
    }

    try {
      for (const post of postsToDelete) {
        await supabase
          .from('posts')
          .delete()
          .eq('id', post.id);
      }

      await fetchPosts();
      toast({
        title: "Auto-Moderasi Berhasil",
        description: `${postsToDelete.length} postingan dihapus karena mengandung kata kasar`,
      });
    } catch (error) {
      console.error('Error in auto moderation:', error);
      toast({
        title: "Error",
        description: "Gagal melakukan auto-moderasi",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600">Memuat data postingan...</p>
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
            onClick={autoModeratePosts}
            className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <AlertTriangle size={16} />
            <span>Auto-Moderasi</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Kelola Postingan</h2>

          {posts.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Belum ada postingan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => {
                const hasBadWords = containsBadWords(post.content);
                
                return (
                  <div 
                    key={post.id} 
                    className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                      hasBadWords ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm text-gray-500">
                            User ID: {post.user_id?.substring(0, 8)}...
                          </span>
                          {hasBadWords && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                              Kata Kasar Terdeteksi
                            </span>
                          )}
                        </div>
                        <p className="text-gray-800 mb-2">{post.content}</p>
                        
                        {post.image_url && (
                          <div className="mb-2">
                            <img 
                              src={post.image_url} 
                              alt="Post attachment" 
                              className="max-w-xs h-32 object-cover rounded-lg"
                            />
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>❤️ {post.likes_count || 0} likes</span>
                          <span>💬 {post.comments_count || 0} komentar</span>
                          <span>{new Date(post.created_at).toLocaleDateString('id-ID')}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeletePost(post.id, post.content)}
                        className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm transition-colors ml-4"
                      >
                        <Trash2 size={16} />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KelolaPostingan;
