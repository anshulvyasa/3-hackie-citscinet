import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authUtils } from '@/lib/auth-utils';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{
    id: string | null;
    username: string | null;
    type: string | null;
  } | null>(null);

  useEffect(() => {
    // Check if user is authenticated on mount
    const authenticated = authUtils.isAuthenticated();
    setIsAuthenticated(authenticated);

    if (authenticated) {
      const userInfo = authUtils.getUserInfo();
      setUser({
        id: userInfo.id,
        username: userInfo.username,
        type: userInfo.type,
      });
    }

    setIsLoading(false);
  }, []);

  const logout = () => {
    authUtils.clearToken();
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    logout,
  };
}

/**
 * Hook to protect routes - redirects to login if not authenticated
 */
export function useProtectedRoute() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login, passing the current path as redirect
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  return { isAuthenticated, isLoading };
}
