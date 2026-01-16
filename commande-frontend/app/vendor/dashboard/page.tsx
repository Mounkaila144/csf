'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Layers, ShoppingCart, AlertCircle, Clock } from 'lucide-react';
import VendorLayout from '../../../src/components/vendor/VendorLayout';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface User {
  name: string;
  shop_name: string;
  shop_description?: string;
  phone?: string;
  address?: string;
  vendor_status: string;
  rejection_reason?: string;
}

export default function VendorDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Non autorisé');
      }

      const data = await response.json();

      if (data.user.role !== 'vendor') {
        router.push('/');
        return;
      }

      setUser(data.user);
    } catch (error) {
      console.error('Erreur:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Affichage si le vendeur est en attente d'approbation
  if (user.vendor_status === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl w-full">
          <div className="text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Compte en attente d&apos;approbation
            </h1>
            <p className="text-gray-600 mb-6">
              Votre demande de compte vendeur est en cours d&apos;examen par notre équipe.
              Vous recevrez une notification par email une fois votre compte approuvé.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Informations de votre boutique</h3>
              <div className="text-left space-y-2 text-sm text-blue-800">
                <p><strong>Nom de la boutique :</strong> {user.shop_name}</p>
                {user.shop_description && (
                  <p><strong>Description :</strong> {user.shop_description}</p>
                )}
                {user.phone && <p><strong>Téléphone :</strong> {user.phone}</p>}
                {user.address && <p><strong>Adresse :</strong> {user.address}</p>}
              </div>
            </div>

            <p className="text-sm text-gray-500">
              Cette approbation prend généralement 24 à 48 heures.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Affichage si le vendeur est rejeté
  if (user.vendor_status === 'rejected') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl w-full">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Demande rejetée
            </h1>
            <p className="text-gray-600 mb-4">
              Malheureusement, votre demande de compte vendeur a été rejetée.
            </p>

            {user.rejection_reason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-red-900 mb-2">Raison du rejet</h3>
                <p className="text-sm text-red-800">{user.rejection_reason}</p>
              </div>
            )}

            <p className="text-sm text-gray-500">
              Pour plus d&apos;informations, veuillez contacter notre support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Affichage si le vendeur est suspendu
  if (user.vendor_status === 'suspended') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl w-full">
          <div className="text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Compte suspendu
            </h1>
            <p className="text-gray-600 mb-4">
              Votre compte vendeur a été temporairement suspendu.
            </p>

            {user.rejection_reason && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-orange-900 mb-2">Raison de la suspension</h3>
                <p className="text-sm text-orange-800">{user.rejection_reason}</p>
              </div>
            )}

            <p className="text-sm text-gray-500">
              Pour réactiver votre compte, veuillez contacter notre support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard principal pour vendeur approuvé
  return (
    <VendorLayout>
      <div className="space-y-6">
        {/* Boutique Info */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-2">{user.shop_name}</h2>
          {user.shop_description && (
            <p className="text-blue-100">{user.shop_description}</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => router.push('/vendor/products')}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Mes Produits</h3>
            <p className="text-gray-600 text-sm">
              Gérez vos produits, ajoutez-en de nouveaux ou modifiez les existants
            </p>
          </button>

          <button
            onClick={() => router.push('/vendor/categories')}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <Layers className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Mes Catégories</h3>
            <p className="text-gray-600 text-sm">
              Organisez vos produits en créant des catégories personnalisées
            </p>
          </button>

          <button
            onClick={() => router.push('/vendor/orders')}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Commandes</h3>
            <p className="text-gray-600 text-sm">
              Consultez et gérez les commandes de vos produits
            </p>
          </button>
        </div>

        {/* Info supplémentaires */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations importantes</h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Vous ne pouvez gérer que vos propres produits et catégories</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Assurez-vous que vos produits respectent nos conditions d&apos;utilisation</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Les commissions sur les ventes seront prélevées automatiquement</span>
            </li>
          </ul>
        </div>
      </div>
    </VendorLayout>
  );
}
