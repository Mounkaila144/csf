'use client'

import React, { useState } from 'react';
import { AuthProvider } from '../src/contexts/AuthProvider';
import Header from '../src/components/Header';
import AdminAutoRedirect from '../src/components/AdminAutoRedirect';
import { Home } from '../src/pages/Home';
import { useCart } from '../src/hooks/useCart';
import { LoginModal } from '../src/components/LoginModal';
import { RegisterModal } from '../src/components/RegisterModal';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const { getTotalItems } = useCart();




  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleShowLogin = () => {
    setShowLoginModal(true);
  };

  const handleShowRegister = () => {
    setShowRegisterModal(true);
  };

  return (
    <AuthProvider>
      {/* Si l'utilisateur est admin et connecté, le rediriger vers /admin */}
      <AdminAutoRedirect />
      <div className="min-h-screen bg-gray-50">
        <Header
          cartItemCount={getTotalItems()}
          onSearch={handleSearch}
          onShowLogin={handleShowLogin}
          onShowRegister={handleShowRegister}
        />



        <Home searchQuery={searchQuery} />

        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSwitchToRegister={() => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
          }}
        />

        <RegisterModal
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          onSwitchToLogin={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
        />
      </div>
    </AuthProvider>
  );
}
