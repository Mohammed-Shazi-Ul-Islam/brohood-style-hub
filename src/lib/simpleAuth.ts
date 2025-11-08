// Simplified authentication for debugging
import { supabase } from '@/integrations/supabase/client';

export async function getSimpleCurrentUser() {
  try {
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return null;
    }

    // Try to get admin status with a simple query
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    return {
      id: user.id,
      email: user.email || '',
      isAdmin: !!adminData && adminData.active,
      adminRole: adminData?.role,
      adminPermissions: adminData?.permissions || []
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export async function simpleSignIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function simpleSignOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}