// Debug component to test authentication step by step
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function DebugAuth() {
  const [authUser, setAuthUser] = useState<any>(null);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testAuth = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Step 1: Getting auth user...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        throw new Error(`Auth error: ${authError.message}`);
      }
      
      console.log('Step 2: Auth user result:', user);
      setAuthUser(user);
      
      if (user) {
        console.log('Step 3: Checking admin status...');
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', user.id)
          .eq('active', true)
          .single();
        
        console.log('Step 4: Admin query result:', { adminData, adminError });
        setAdminUser(adminData);
        
        if (adminError) {
          console.log('Admin error details:', adminError);
        }
      }
    } catch (err: any) {
      console.error('Debug auth error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createAdminUser = async () => {
    if (!authUser) return;
    
    try {
      setLoading(true);
      setError('');
      
      console.log('Creating admin user for:', authUser.email);
      
      // Direct insert instead of using RPC function
      const { data, error } = await supabase
        .from('admin_users')
        .insert({
          user_id: authUser.id,
          role: 'super_admin',
          active: true,
          permissions: []
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      console.log('Admin user created:', data);
      setAdminUser(data);
    } catch (err: any) {
      console.error('Create admin error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testAuth} disabled={loading}>
              {loading ? 'Testing...' : 'Test Authentication'}
            </Button>
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-800 font-medium">Error:</p>
                <p className="text-red-700">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Auth User Info */}
        <Card>
          <CardHeader>
            <CardTitle>Auth User (Step 1 & 2)</CardTitle>
          </CardHeader>
          <CardContent>
            {authUser ? (
              <div className="space-y-2">
                <p><strong>ID:</strong> {authUser.id}</p>
                <p><strong>Email:</strong> {authUser.email}</p>
                <p><strong>Created:</strong> {authUser.created_at}</p>
                <details className="mt-4">
                  <summary className="cursor-pointer font-medium">Raw Auth User</summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto">
                    {JSON.stringify(authUser, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <p className="text-gray-500">No authenticated user found</p>
            )}
          </CardContent>
        </Card>

        {/* Admin User Info */}
        <Card>
          <CardHeader>
            <CardTitle>Admin User (Step 3 & 4)</CardTitle>
          </CardHeader>
          <CardContent>
            {adminUser ? (
              <div className="space-y-2">
                <p><strong>Admin ID:</strong> {adminUser.id}</p>
                <p><strong>Role:</strong> {adminUser.role}</p>
                <p><strong>Active:</strong> {adminUser.active ? 'Yes' : 'No'}</p>
                <p><strong>Created:</strong> {adminUser.created_at}</p>
                <details className="mt-4">
                  <summary className="cursor-pointer font-medium">Raw Admin User</summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto">
                    {JSON.stringify(adminUser, null, 2)}
                  </pre>
                </details>
              </div>
            ) : authUser ? (
              <div className="space-y-4">
                <p className="text-yellow-600">User is authenticated but not an admin</p>
                <Button onClick={createAdminUser} disabled={loading}>
                  Make This User Admin
                </Button>
              </div>
            ) : (
              <p className="text-gray-500">No admin user found</p>
            )}
          </CardContent>
        </Card>

        {/* Database Tables Check */}
        <Card>
          <CardHeader>
            <CardTitle>Database Tables Check</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={async () => {
                try {
                  const { data, error } = await supabase
                    .from('admin_users')
                    .select('count(*)')
                    .single();
                  
                  console.log('Admin users table check:', { data, error });
                  
                  if (error) {
                    setError(`Table check failed: ${error.message}`);
                  } else {
                    setError('');
                    alert(`Admin users table exists. Count: ${data?.count || 0}`);
                  }
                } catch (err: any) {
                  setError(`Table check error: ${err.message}`);
                }
              }}
            >
              Check Admin Users Table
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}