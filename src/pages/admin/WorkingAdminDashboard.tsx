// Working admin dashboard with proper Supabase auth
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Package, ShoppingCart, Users, Settings, TrendingUp, AlertTriangle } from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  isAdmin: boolean;
  adminRole?: string;
  adminPermissions?: any[];
}

export function WorkingAdminDashboard() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        if (event === 'SIGNED_IN' && session) {
          await loadUserData();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          navigate('/admin/login');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      console.log('Checking authentication...');
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        navigate('/admin/login');
        return;
      }

      if (!session) {
        console.log('No active session found');
        navigate('/admin/login');
        return;
      }

      console.log('Session found:', session.user.email);
      await loadUserData();
      
    } catch (err: any) {
      console.error('Auth check error:', err);
      setError(err.message);
      navigate('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      // Get user from Supabase auth
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !authUser) {
        console.error('Error getting user:', userError);
        navigate('/admin/login');
        return;
      }

      // Check if user is admin from admin_users table
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', authUser.id)
        .eq('active', true)
        .maybeSingle();

      if (adminError) {
        console.error('Error checking admin status:', adminError);
      }

      if (!adminData) {
        // User is authenticated but not an admin
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          isAdmin: false
        });
        return;
      }

      // User is an admin - TypeScript now knows adminData is not null
      const admin = adminData as any;
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        isAdmin: true,
        adminRole: admin.role,
        adminPermissions: admin.permissions
      });

      console.log('Admin user loaded:', {
        email: authUser.email,
        role: admin.role
      });

    } catch (err: any) {
      console.error('Error loading user data:', err);
      setError(err.message);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/admin/login');
    } catch (error: any) {
      console.error('Sign out error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-4">{error}</p>
            <Button onClick={() => navigate('/admin/login')} className="w-full">
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Not Authenticated</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/admin/login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                BroHood Admin Dashboard
              </h1>
              {user.isAdmin && (
                <span className="ml-4 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  {user.adminRole}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.email}
              </span>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { name: 'Dashboard', href: '/admin', icon: TrendingUp, current: true },
              { name: 'Products', href: '/admin/products', icon: Package },
              { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
              { name: 'Customers', href: '/admin/customers', icon: Users },
              { name: 'Settings', href: '/admin/settings', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-1 pt-1 pb-4 text-sm font-medium border-b-2 ${
                    item.current
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.name}
                </a>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Not Admin Warning */}
          {!user.isAdmin && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-800">Admin Access Required</CardTitle>
                <CardDescription className="text-yellow-700">
                  You are logged in but don't have admin privileges. Contact your administrator to get admin access.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-yellow-700 mb-2">
                  To make this user an admin, run this SQL in your Supabase dashboard:
                </p>
                <pre className="text-xs bg-yellow-100 p-2 rounded border overflow-x-auto">
                  {`SELECT create_admin_user('${user.email}', 'super_admin');`}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Only show dashboard content to admins */}
          {user.isAdmin && (
            <>
              {/* Welcome Message */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                <p className="text-gray-600">
                  Welcome to your admin dashboard. Here's what's happening with your store.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { name: 'Total Products', value: '0', icon: Package, color: 'blue' },
                  { name: 'Total Orders', value: '0', icon: ShoppingCart, color: 'green' },
                  { name: 'Total Customers', value: '0', icon: Users, color: 'purple' },
                  { name: 'Low Stock Items', value: '0', icon: AlertTriangle, color: 'red' },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={stat.name}>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <div className="p-2 rounded-md bg-gray-100">
                            <Icon className="h-6 w-6 text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Get started with managing your store
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button className="h-20 flex flex-col items-center justify-center space-y-2">
                      <Package className="h-6 w-6" />
                      <span>Add Product</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                      <ShoppingCart className="h-6 w-6" />
                      <span>View Orders</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                      <Users className="h-6 w-6" />
                      <span>Manage Customers</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Admin Status */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Admin Access:</strong> 
                  {user.isAdmin ? (
                    <span className="text-green-600 font-medium ml-2">✓ Active</span>
                  ) : (
                    <span className="text-red-600 font-medium ml-2">✗ No Access</span>
                  )}
                </p>
                {user.isAdmin && (
                  <>
                    <p><strong>Role:</strong> {user.adminRole || 'None'}</p>
                    {user.adminPermissions && user.adminPermissions.length > 0 && (
                      <div>
                        <p className="font-medium mb-2">Permissions:</p>
                        <div className="flex flex-wrap gap-2">
                          {user.adminPermissions.map((permission, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {permission}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}