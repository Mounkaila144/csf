import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, User, Heart, MessageCircle, Menu, X, LogOut, UserCheck, Package } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import OrdersModal from './OrdersModal';

interface HeaderProps {
  cartItemCount: number;
  onSearch: (query: string) => void;
  onShowLogin: () => void;
  onShowRegister: () => void;
  onOpenCart: () => void;
}

const Header: React.FC<HeaderProps> = ({ cartItemCount, onSearch, onShowLogin, onShowRegister, onOpenCart }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);




  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    // Pas besoin de navigation avec Next.js - la page se rafraîchira automatiquement
    window.location.reload();
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const userMenuContainer = document.querySelector('[data-user-menu]');
      
      if (showUserMenu && userMenuContainer && !userMenuContainer.contains(target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <>
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled
        ? 'bg-white/95 backdrop-blur-md shadow-xl border-b border-gray-200/50'
        : 'bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 shadow-lg'
    }`}>
      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 min-w-fit">
            <div className="relative group">
              <img
                src="/image/logo.png"
                alt="Commandes Sans Frontières"
                className="h-700 w-700 object-contain transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
            </div>
            <div className="hidden lg:block group cursor-pointer">
              <div className="relative overflow-hidden">
                <h1 className={`text-2xl font-bold transition-all duration-500 group-hover:scale-105 ${
                  isScrolled
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent'
                    : 'bg-gradient-to-r from-blue-200 via-white to-blue-200 bg-clip-text text-transparent'
                }`}>
                  Commandes
                </h1>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </div>
              <div className="relative mt-1">
                <p className={`text-sm font-semibold tracking-widest transform transition-all duration-300 group-hover:tracking-wider group-hover:scale-105 ${
                  isScrolled ? 'text-gray-600 group-hover:text-blue-600' : 'text-blue-100 group-hover:text-white'
                }`}>
                  Sans • Frontières
                </p>
                <div className={`absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r ${
                  isScrolled ? 'from-blue-500 to-indigo-500' : 'from-blue-300 to-white'
                } group-hover:w-full transition-all duration-500 ease-out`}></div>
              </div>
            </div>
          </Link>

          {/* Search bar - Desktop only */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl">
            <div className="relative group w-full">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm"></div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher parmi des millions de produits..."
                className={`relative w-full pl-5 pr-14 py-3.5 rounded-xl transition-all duration-300 text-gray-700 placeholder-gray-400 ${
                  isScrolled
                    ? 'bg-gray-50 border-2 border-gray-200 focus:border-blue-500 focus:bg-white shadow-sm focus:shadow-lg'
                    : 'bg-white/95 backdrop-blur-sm border-2 border-white/30 focus:border-blue-300 focus:bg-white shadow-lg'
                } focus:outline-none focus:scale-[1.02] focus:shadow-xl`}
              />
              <button
                type="submit"
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2.5 rounded-lg transition-all duration-300 ${
                  isScrolled
                    ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-110'
                    : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-110'
                } group-focus-within:scale-110 shadow-lg hover:shadow-xl`}
              >
                <Search size={20} />
              </button>
            </div>
          </form>

          {/* Right icons */}
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg transition-all duration-300 ${
                isScrolled
                  ? 'text-gray-700 hover:bg-gray-100'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Icons */}
            <div className="hidden md:flex items-center gap-2">
              <a
                href="https://wa.me/8615057804948"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-3 rounded-xl transition-all duration-300 group hover:scale-110 ${
                  isScrolled
                    ? 'hover:bg-green-50 hover:shadow-lg'
                    : 'hover:bg-green-500/20'
                }`}
                title="Contactez-nous sur WhatsApp"
              >
                <MessageCircle size={22} className={`transition-colors duration-300 ${
                  isScrolled
                    ? 'text-gray-600 group-hover:text-green-600'
                    : 'text-white group-hover:text-green-400'
                }`} />
              </a>

              <button className={`p-3 rounded-xl transition-all duration-300 group hover:scale-110 ${
                isScrolled
                  ? 'hover:bg-red-50 hover:shadow-lg'
                  : 'hover:bg-white/10'
              }`}>
                <Heart size={22} className={`transition-colors duration-300 ${
                  isScrolled
                    ? 'text-gray-600 group-hover:text-red-500'
                    : 'text-white group-hover:text-red-400'
                }`} />
              </button>

              {/* Orders Button - Only for authenticated users */}
              {mounted && isAuthenticated && (
                <button
                  onClick={() => setShowOrdersModal(true)}
                  className={`p-3 rounded-xl transition-all duration-300 group hover:scale-110 ${
                    isScrolled
                      ? 'hover:bg-purple-50 hover:shadow-lg'
                      : 'hover:bg-white/10'
                  }`}
                  title="Mes commandes"
                >
                  <Package size={22} className={`transition-colors duration-300 ${
                    isScrolled
                      ? 'text-gray-600 group-hover:text-purple-600'
                      : 'text-white group-hover:text-purple-300'
                  }`} />
                </button>
              )}

              {/* User Menu */}
              <div className="relative" data-user-menu="true">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowUserMenu(!showUserMenu);
                  }}
                  className={`p-3 rounded-xl transition-all duration-300 group hover:scale-110 ${
                    isScrolled
                      ? 'hover:bg-blue-50 hover:shadow-lg'
                      : 'hover:bg-white/10'
                  }`}
                >
                  {!mounted ? (
                    <User size={22} className={`transition-colors duration-300 ${
                      isScrolled
                        ? 'text-gray-600 group-hover:text-blue-600'
                        : 'text-white group-hover:text-blue-300'
                    }`} />
                  ) : isAuthenticated ? (
                    <UserCheck size={22} className={`transition-colors duration-300 ${
                      isScrolled
                        ? 'text-green-600 group-hover:text-green-700'
                        : 'text-green-300 group-hover:text-green-200'
                    }`} />
                  ) : (
                    <User size={22} className={`transition-colors duration-300 ${
                      isScrolled
                        ? 'text-gray-600 group-hover:text-blue-600'
                        : 'text-white group-hover:text-blue-300'
                    }`} />
                  )}
                </button>

                {/* User Dropdown Menu */}
                {mounted && showUserMenu && (
                  <div className={`absolute right-0 mt-2 w-56 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 z-50 ${
                    isScrolled ? 'bg-white' : 'bg-white'
                  }`}>
                    <div className="py-2">
                      {mounted && isAuthenticated ? (
                        <>
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">Bonjour,</p>
                            <p className="text-sm text-gray-600 truncate">{user?.name}</p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                              user?.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {user?.role === 'admin' ? 'Administrateur' : 'Client'}
                            </span>
                          </div>
                          <button
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                          >
                            <User className="mr-3 h-4 w-4" />
                            Mon profil
                          </button>
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              setShowOrdersModal(true);
                            }}
                            className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                          >
                            <Package className="mr-3 h-4 w-4" />
                            Mes commandes
                          </button>
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="mr-3 h-4 w-4" />
                            Se déconnecter
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              onShowLogin();
                            }}
                            className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                          >
                            <User className="mr-3 h-4 w-4" />
                            Se connecter
                          </button>
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              onShowRegister();
                            }}
                            className="flex items-center w-full px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 transition-colors font-medium text-left"
                          >
                            <UserCheck className="mr-3 h-4 w-4" />
                            Créer un compte
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={onOpenCart}
                className={`relative p-3 rounded-xl transition-all duration-300 group hover:scale-110 ${
                  isScrolled
                    ? 'hover:bg-blue-50 hover:shadow-lg'
                    : 'hover:bg-white/10'
                }`}>
                <ShoppingCart size={22} className={`transition-colors duration-300 ${
                  isScrolled
                    ? 'text-gray-600 group-hover:text-blue-600'
                    : 'text-white group-hover:text-blue-300'
                }`} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar - Always visible */}
      <div className={`md:hidden px-4 pb-4 ${isScrolled ? 'bg-white/95 backdrop-blur-md' : 'bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900'}`}>
        <form onSubmit={handleSearch} className="w-full">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-lg opacity-0 focus-within:opacity-100 transition-opacity duration-300 blur-sm"></div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher des produits..."
              className={`relative w-full pl-4 pr-12 py-3 rounded-lg transition-all duration-300 text-gray-700 placeholder-gray-400 ${
                isScrolled
                  ? 'bg-gray-50 border-2 border-gray-200 focus:border-blue-500 focus:bg-white shadow-sm'
                  : 'bg-white/95 backdrop-blur-sm border-2 border-white/30 focus:border-blue-300 focus:bg-white shadow-lg'
              } focus:outline-none focus:scale-[1.01]`}
            />
            <button
              type="submit"
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all duration-300 ${
                isScrolled
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              } shadow-md hover:shadow-lg`}
            >
              <Search size={18} />
            </button>
          </div>
        </form>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${
        isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      } ${isScrolled ? 'bg-white border-t border-gray-200' : 'bg-blue-800/95 backdrop-blur-sm'}`}>
        <div className="px-4 py-4 space-y-4">
          {/* Mobile icons */}
          <div className="flex justify-around pt-2">
            <a
              href="https://wa.me/8615057804948"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-3 rounded-xl transition-all duration-300 ${
                isScrolled
                  ? 'text-gray-600 hover:bg-green-50 hover:text-green-600'
                  : 'text-white hover:bg-green-500/20 hover:text-green-400'
              }`}
              title="WhatsApp"
            >
              <MessageCircle size={24} />
            </a>
            <button className={`p-3 rounded-xl transition-all duration-300 ${
              isScrolled
                ? 'text-gray-600 hover:bg-red-50 hover:text-red-500'
                : 'text-white hover:bg-white/10 hover:text-red-400'
            }`}>
              <Heart size={24} />
            </button>
            {mounted && isAuthenticated && (
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setShowOrdersModal(true);
                }}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  isScrolled
                    ? 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                    : 'text-white hover:bg-white/10 hover:text-purple-300'
                }`}
                title="Mes commandes"
              >
                <Package size={24} />
              </button>
            )}
            <button 
              onClick={() => onShowLogin()}
              className={`p-3 rounded-xl transition-all duration-300 ${
                isScrolled
                  ? 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                  : 'text-white hover:bg-white/10 hover:text-blue-300'
              }`}>
              <User size={24} />
            </button>
            <button 
              onClick={onOpenCart}
              className={`relative p-3 rounded-xl transition-all duration-300 ${
                isScrolled
                  ? 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                  : 'text-white hover:bg-white/10 hover:text-blue-300'
              }`}>
              <ShoppingCart size={24} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

    </header>
    
    {/* Orders Modal */}
    <OrdersModal 
      isOpen={showOrdersModal} 
      onClose={() => setShowOrdersModal(false)} 
    />
  </>
  );
};

export default Header;