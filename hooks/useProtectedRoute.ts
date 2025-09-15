import { useSegments, useRouter, usePathname } from 'expo-router'; // Importe usePathname
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function useProtectedRoute() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const pathname = usePathname(); 

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    if (loading) {
      return;
    }

    if (!user && !inAuthGroup && pathname !== '/login') {
      router.replace('/login');
    }
    else if (user && inAuthGroup && pathname !== '/') { 
      router.replace('/');
    }

  }, [user, loading, segments, pathname, router]); 
}
