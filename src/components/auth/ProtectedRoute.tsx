// Protected route component for admin access
import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AdminLogin } from './AdminLogin';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AdminRole } from '@/types/database';

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: AdminRole;
  fallback?: ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requireRole,
  fallback 
}: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!user) {
    return fallback || <AdminLogin />;
  }

  // Show unauthorized message if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            You don't have admin access. Please contact your administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check specific role requirement
  if (requireRole && user.adminRole !== 'super_admin' && user.adminRole !== requireRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            You don't have sufficient permissions to access this page. 
            Required role: {requireRole}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Render protected content
  return <>{children}</>;
}

// Higher-order component for protecting routes
export function withAdminAuth<P extends object>(
  Component: React.ComponentType<P>,
  requireRole?: AdminRole
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute requireRole={requireRole}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}