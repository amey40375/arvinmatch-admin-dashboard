
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, MessageSquare, Trash2, Ban } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type CommentData = Tables<'comments'>;

interface KelolaKomentarProps {
  onBack: () => void;
}

const KelolaKomentar: React.FC<KelolaKomentarProps> = ({ onBack }) => {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Kata-kata kasar untuk auto-moderasi
  const badWords = ['anjing', 'babi', 'bangsat', 'bodoh', 'tolol', 'goblok', 'idiot', 'sial'];

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data komentar",
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

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      await fetchComments();
      toast({
        title: "Berhasil",
        description: "Komentar berhasil dihapus",
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus komentar",
        variant: "destructive",
      });
    }
  };

  const handleBlockUserFromComment = async (userId: string, commentContent: string) => {
    try {
      // Block user
      const { error: userError } = await supabase
        .from('users')
        .update({ status: 'blocked' })
        .eq('id', userId);

      if (userError) throw userError;

      // Delete the comment
      const { error: commentError } = await supabase
        .from('comments')
        .delete()
        .eq('user_id', userId);

      if (commentError) throw commentError;

      await fetchComments();
      toast({
        title: "Berhasil",
        description: "User diblokir dan komentar dihapus karena kata kasar",
      });
    } catch (error) {
      console.error('Error blocking user:', error);
      toast({
        title: "Error",
        description: "Gagal memblokir user",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600">Memuat data komentar...</p>
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
          <h2 className="text-xl font-bold text-gray-800 mb-6">Kelola Komentar</h2>

          {comments.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Belum ada komentar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => {
                const hasBadWords = containsBadWords(comment.content);
                
                return (
                  <div 
                    key={comment.id} 
                    className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                      hasBadWords ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm text-gray-500">
                            User ID: {comment.user_id?.substring(0, 8)}...
                          </span>
                          <span className="text-sm text-gray-500">
                            Post ID: {comment.post_id?.substring(0, 8)}...
                          </span>
                          {hasBadWords && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                              Kata Kasar Terdeteksi
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-800 mb-2">{comment.content}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            comment.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {comment.status}
                          </span>
                          <span>{new Date(comment.created_at).toLocaleDateString('id-ID')}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                        >
                          <Trash2 size={16} />
                          <span>Hapus</span>
                        </button>

                        {hasBadWords && comment.user_id && (
                          <button
                            onClick={() => handleBlockUserFromComment(comment.user_id!, comment.content)}
                            className="flex items-center space-x-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                          >
                            <Ban size={16} />
                            <span>Blokir User</span>
                          </button>
                        )}
                      </div>
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

export default KelolaKomentar;
