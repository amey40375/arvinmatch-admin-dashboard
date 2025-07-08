
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Settings, Palette, RotateCcw, LogOut, Save } from 'lucide-react';

interface PengaturanProps {
  onBack: () => void;
  onLogout: () => void;
}

const Pengaturan: React.FC<PengaturanProps> = ({ onBack, onLogout }) => {
  const [appSettings, setAppSettings] = useState({
    appName: 'ARVINmatch',
    primaryColor: '#1e3a8a',
    secondaryColor: '#93c5fd',
    logoUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSaveSettings = async () => {
    setLoading(true);
    
    try {
      // Simulate saving settings to localStorage or API
      localStorage.setItem('arvinmatch_settings', JSON.stringify(appSettings));
      
      // Apply theme changes to document root
      document.documentElement.style.setProperty('--primary-color', appSettings.primaryColor);
      document.documentElement.style.setProperty('--secondary-color', appSettings.secondaryColor);
      
      toast({
        title: "Berhasil",
        description: "Pengaturan aplikasi berhasil disimpan",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan pengaturan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetDummyData = async () => {
    if (!confirm('Apakah Anda yakin ingin reset semua data dummy? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }

    setLoading(true);
    
    try {
      // Here you would normally call API to reset data
      // For demo purposes, we'll just show a success message
      
      toast({
        title: "Berhasil",
        description: "Data dummy berhasil direset",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mereset data dummy",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin logout?')) {
      localStorage.removeItem('arvinmatch_admin');
      toast({
        title: "Logout Berhasil",
        description: "Anda berhasil logout dari admin panel",
      });
      onLogout();
    }
  };

  const colorThemes = [
    { name: 'Biru Klasik', primary: '#1e3a8a', secondary: '#93c5fd' },
    { name: 'Hijau Segar', primary: '#065f46', secondary: '#86efac' },
    { name: 'Ungu Modern', primary: '#581c87', secondary: '#c4b5fd' },
    { name: 'Merah Elegan', primary: '#991b1b', secondary: '#fca5a5' },
    { name: 'Orange Dinamis', primary: '#c2410c', secondary: '#fdba74' }
  ];

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

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="text-blue-600" size={24} />
              <h2 className="text-xl font-bold text-gray-800">Pengaturan Aplikasi</h2>
            </div>
            <p className="text-gray-600">Kelola konfigurasi dan tampilan aplikasi ARVINmatch</p>
          </div>

          {/* App Settings */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Informasi Aplikasi</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Aplikasi
                </label>
                <input
                  type="text"
                  value={appSettings.appName}
                  onChange={(e) => setAppSettings({ ...appSettings, appName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Logo (opsional)
                </label>
                <input
                  type="url"
                  value={appSettings.logoUrl}
                  onChange={(e) => setAppSettings({ ...appSettings, logoUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-2 mb-4">
              <Palette className="text-blue-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-800">Tema Warna</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warna Primer
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      value={appSettings.primaryColor}
                      onChange={(e) => setAppSettings({ ...appSettings, primaryColor: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={appSettings.primaryColor}
                      onChange={(e) => setAppSettings({ ...appSettings, primaryColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warna Sekunder
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      value={appSettings.secondaryColor}
                      onChange={(e) => setAppSettings({ ...appSettings, secondaryColor: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={appSettings.secondaryColor}
                      onChange={(e) => setAppSettings({ ...appSettings, secondaryColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tema Preset
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {colorThemes.map((theme) => (
                    <button
                      key={theme.name}
                      onClick={() => setAppSettings({
                        ...appSettings,
                        primaryColor: theme.primary,
                        secondaryColor: theme.secondary
                      })}
                      className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex space-x-1">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: theme.primary }}
                        />
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: theme.secondary }}
                        />
                      </div>
                      <span className="text-sm">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Aksi</h3>
            
            <div className="space-y-3">
              <button
                onClick={handleSaveSettings}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Save size={16} />
                <span>{loading ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
              </button>

              <button
                onClick={handleResetDummyData}
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <RotateCcw size={16} />
                <span>Reset Data Dummy</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <LogOut size={16} />
                <span>Logout Admin</span>
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Informasi Sistem</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>Versi: 1.0.0</p>
              <p>Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}</p>
              <p>Admin aktif: admin@arvinmatch.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pengaturan;
