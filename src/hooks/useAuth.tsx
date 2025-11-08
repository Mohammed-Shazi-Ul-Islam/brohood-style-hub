// Authentication hook for BroHood admin dashboard
import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { AuthUser, getCurrentUser, onAuthStateChange } from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  adminRole?: string;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const refreshUser = async () => {
    try {
      console.log('Refreshing user...');
      const currentUser = await getCurrentUser();
      console.log('User refreshed:', currentUser);
      setUser(currentUser);
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const initAuth = async () => {
      try {
        // Set a maximum timeout for initialization
        timeoutId = setTimeout(() => {
          if (isMounted && !initialized) {
            console.warn('Auth initialization timeout - proceeding without user');
            setUser(null);
            setLoading(false);
            setInitialized(true);
          }
        }, 8000); // 8 second timeout

        // Get initial user from auth state
        const currentUser = await getCurrentUser();
        if (isMounted) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          clearTimeout(timeoutId);
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    // Initialize auth on mount
    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((authUser) => {
      console.log('Auth state changed:', authUser);
      if (isMounted) {
        setUser(authUser);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [initialized]);

  // Don't show children until auth is fully initialized
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  const providerValue: AuthContextType = {
    user,
    loading,
    isAdmin: user?.isAdmin || false,
    adminRole: user?.adminRole,
    refreshUser
  };

  return (
    <AuthContext.Provider value={providerValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for requiring admin access
export function useRequireAdmin() {
  const { user, loading, isAdmin } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) {
      setShouldRedirect(true);
    }
  }, [loading, isAdmin]);

  if (shouldRedirect) {
    // Redirect but return null to prevent rendering
    setTimeout(() => {
      window.location.href = '/admin/login';
    }, 0);
    return { user: null, loading: true, isAdmin: false };
  }

  return { user, loading, isAdmin };
}

// Hook for requiring specific admin role
export function useRequireAdminRole(requiredRole: string) {
  const { user, loading, isAdmin, adminRole } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const hasAccess = isAdmin && (adminRole === 'super_admin' || adminRole === requiredRole);

  useEffect(() => {
    if (!loading && !hasAccess) {
      setShouldRedirect(true);
    }
  }, [loading, hasAccess]);

  if (shouldRedirect) {
    // Redirect but return null to prevent rendering
    setTimeout(() => {
      window.location.href = '/admin/login';
    }, 0);
    return { user: null, loading: true, hasAccess: false };
  }

  return { user, loading, hasAccess };
}