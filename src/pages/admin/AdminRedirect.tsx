// Simple redirect component to force clean state
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export function AdminRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const redirect = async () => {
      try {
        // Clear any stale state
        console.log('Checking session...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          navigate('/admin/login', { replace: true });
          return;
        }

        if (!session) {
          console.log('No session, redirecting to login');
          navigate('/admin/login', { replace: true });
          return;
        }

        console.log('Session found, redirecting to dashboard');
        navigate('/admin/dashboard', { replace: true });
      } catch (err) {
        console.error('Redirect error:', err);
        navigate('/admin/login', { replace: true });
      }
    };

    redirect();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
