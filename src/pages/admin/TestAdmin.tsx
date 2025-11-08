// Super simple test page to verify authentication
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function TestAdmin() {
  const [authUser, setAuthUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testAuth();
  }, []);

  const testAuth = async () => {
    console.log('TestAdmin: Starting auth check...');
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log('TestAdmin: Auth result:', { user, error });
      
      setAuthUser(user);
    } catch (err) {
      console.error('TestAdmin: Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Admin Page</h1>
      
      {authUser ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-100 border border-green-300 rounded">
            <p className="font-bold text-green-800">✓ Authentication Successful!</p>
          </div>
          
          <div className="space-y-2">
            <p><strong>User ID:</strong> {authUser.id}</p>
            <p><strong>Email:</strong> {authUser.email}</p>
            <p><strong>Created:</strong> {authUser.created_at}</p>
          </div>
          
          <details className="mt-4">
            <summary className="cursor-pointer font-medium">Raw User Object</summary>
            <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(authUser, null, 2)}
            </pre>
          </details>
          
          <div className="mt-4">
            <a href="/admin" className="text-blue-600 underline">
              Go to Admin Dashboard
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-red-100 border border-red-300 rounded">
            <p className="font-bold text-red-800">✗ Not Authenticated</p>
          </div>
          
          <div className="mt-4">
            <a href="/admin/login" className="text-blue-600 underline">
              Go to Login
            </a>
          </div>
        </div>
      )}
    </div>
  );
}