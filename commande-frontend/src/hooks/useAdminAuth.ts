'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User } from '@/services/authService';

interface UseAdminAuthReturn {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

export function useAdminAuth(): UseAdminAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      setLoading(true);
      
      // Vérifier si l'utilisateur est connecté
      if (!authService.isAuthenticated()) {
        router.push('/');
        return;
      }

      // Récupérer les informations utilisateur
      const currentUser = authService.getUser();
      
      if (!currentUser) {
        // Essayer de récupérer le profil depuis l'API
        try {
          const profile = await authService.getProfile();
          setUser(profile);
          
          // Vérifier si l'utilisateur est admin
          if (profile.role !== 'admin') {
            router.push('/');
            return;
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du profil:', error);
          router.push('/');
          return;
        }
      } else {
        setUser(currentUser);
        
        // Vérifier si l'utilisateur est admin
        if (currentUser.role !== 'admin') {
          router.push('/');
          return;
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification admin:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    isAdmin: user?.role === 'admin'
  };
}

// Hook pour protéger les composants admin
export function useRequireAdmin() {
  const { user, loading, isAdmin } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [loading, isAdmin, router]);

  return { user, loading, isAdmin };
}
