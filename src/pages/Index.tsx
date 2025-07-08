
import React, { useState, useEffect } from 'react';
import AdminAuth from '@/components/AdminAuth';
import AdminDashboard from '@/components/AdminDashboard';
import KelolaUser from '@/components/admin/KelolaUser';
import KelolaPostingan from '@/components/admin/KelolaPostingan';
import KelolaKomentar from '@/components/admin/KelolaKomentar';
import KelolaTransaksi from '@/components/admin/KelolaTransaksi';
import KelolaPaket from '@/components/admin/KelolaPaket';
import Statistik from '@/components/admin/Statistik';
import Pengumuman from '@/components/admin/Pengumuman';
import Pengaturan from '@/components/admin/Pengaturan';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    // Check if admin is already logged in
    const adminData = localStorage.getItem('arvinmatch_admin');
    if (adminData) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('dashboard');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleBack = () => {
    setCurrentPage('dashboard');
  };

  if (!isLoggedIn) {
    return <AdminAuth onLogin={handleLogin} />;
  }

  // Render different pages based on currentPage
  switch (currentPage) {
    case 'kelola-user':
      return <KelolaUser onBack={handleBack} />;
    case 'kelola-postingan':
      return <KelolaPostingan onBack={handleBack} />;
    case 'kelola-komentar':
      return <KelolaKomentar onBack={handleBack} />;
    case 'kelola-transaksi':
      return <KelolaTransaksi onBack={handleBack} />;
    case 'kelola-paket':
      return <KelolaPaket onBack={handleBack} />;
    case 'statistik':
      return <Statistik onBack={handleBack} />;
    case 'pengumuman':
      return <Pengumuman onBack={handleBack} />;
    case 'pengaturan':
      return <Pengaturan onBack={handleBack} onLogout={handleLogout} />;
    default:
      return <AdminDashboard onNavigate={handleNavigate} onLogout={handleLogout} />;
  }
};

export default Index;
