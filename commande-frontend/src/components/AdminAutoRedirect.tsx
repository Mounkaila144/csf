'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

export default function AdminAutoRedirect() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      router.replace('/admin');
    }
  }, [isAuthenticated, user, router]);

  return null;
}

