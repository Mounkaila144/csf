'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User } from '../services/authService';

interface UsePartnerAuthReturn {
  user: User | null;
  loading: boolean;
  isPartner: boolean;
}

export function usePartnerAuth(): UsePartnerAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkPartnerAuth();
  }, []);

  const checkPartnerAuth = async () => {
    try {
      setLoading(true);

      if (!authService.isAuthenticated()) {
        router.push('/');
        return;
      }

      const currentUser = authService.getUser();

      if (!currentUser) {
        try {
          const profile = await authService.getProfile();
          setUser(profile);
          if (profile.role !== 'partner') {
            router.push('/');
            return;
          }
        } catch {
          router.push('/');
          return;
        }
      } else {
        setUser(currentUser);
        if (currentUser.role !== 'partner') {
          router.push('/');
          return;
        }
      }
    } catch {
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    isPartner: user?.role === 'partner'
  };
}

export function useRequirePartner() {
  const { user, loading, isPartner } = usePartnerAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isPartner) {
      router.push('/');
    }
  }, [loading, isPartner, router]);

  return { user, loading, isPartner };
}
