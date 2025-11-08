// Authentication utilities for BroHood admin dashboard
import { supabase } from '@/integrations/supabase/client';
import { AdminRole, AdminUser } from '@/types/database';

export interface AuthUser {
  id: string;
  email: string;
  isAdmin: boolean;
  adminRole?: AdminRole;
  adminPermissions?: string[];
}

/**
 * Get current authenticated user with admin status
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    console.log('Getting current user...');
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<null>((_, reject) => {
      setTimeout(() => reject(new Error('Auth check timeout')), 5000);
    });
    
    const authPromise = (async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Auth error:', error);
        return null;
      }
      
      if (!user) {
        console.log('No authenticated user');
        return null;
      }

      console.log('Authenticated user:', user.id, user.email);

      // Check if user is an admin with timeout
      console.log('Checking admin status...');
      try {
        const { data: adminUser, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', user.id)
          .eq('active', true)
          .maybeSingle();

        if (adminError && adminError.code !== 'PGRST116') {
          console.error('Admin check error:', adminError);
        }

        if (adminUser) {
          console.log('Admin user found:', adminUser);
        }

        const authUser: AuthUser = {
          id: user.id,
          email: user.email || '',
          isAdmin: !!adminUser,
          adminRole: (adminUser as any)?.role as AdminRole | undefined,
          adminPermissions: ((adminUser as any)?.permissions as string[]) || []
        };

        console.log('Final auth user:', authUser);
        return authUser;
      } catch (adminError) {
        console.error('Error checking admin status:', adminError);
        // Return user without admin status if check fails
        return {
          id: user.id,
          email: user.email || '',
          isAdmin: false,
          adminPermissions: []
        };
      }
    })();

    // Race between auth check and timeout
    const result = await Promise.race([authPromise, timeoutPromise]);
    return result;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Check if current user has admin access
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.isAdmin || false;
}

/**
 * Check if current user has specific admin role
 */
export async function hasAdminRole(requiredRole: AdminRole): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (!user?.isAdmin || !user.adminRole) {
    return false;
  }

  // Super admin has access to everything
  if (user.adminRole === 'super_admin') {
    return true;
  }

  return user.adminRole === requiredRole;
}

/**
 * Check if current user has specific permission
 */
export async function hasPermission(permission: string): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (!user?.isAdmin) {
    return false;
  }

  // Super admin has all permissions
  if (user.adminRole === 'super_admin') {
    return true;
  }

  return user.adminPermissions?.includes(permission) || false;
}

/**
 * Sign in user
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Sign up new user
 */
export async function signUp(email: string, password: string, metadata?: Record<string, any>) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Sign out user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw error;
  }
}

/**
 * Reset password
 */
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  });

  if (error) {
    throw error;
  }
}

/**
 * Update password
 */
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) {
    throw error;
  }
}

/**
 * Create admin user (only for super admins)
 */
export async function createAdminUser(email: string, role: AdminRole = 'admin'): Promise<string> {
  // Check if current user is super admin
  const hasAccess = await hasAdminRole('super_admin');
  if (!hasAccess) {
    throw new Error('Insufficient permissions to create admin user');
  }

  // Create admin user directly
  const { data, error } = await supabase
    .from('admin_users')
    .insert({
      user_id: email, // This will be replaced by actual user_id in production
      role,
      active: true,
      permissions: []
    } as any)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return (data as any)?.id || '';
}

/**
 * Update admin user role and permissions
 */
export async function updateAdminUser(
  adminUserId: string, 
  updates: Record<string, any>
) {
  // Check if current user is super admin
  const hasAccess = await hasAdminRole('super_admin');
  if (!hasAccess) {
    throw new Error('Insufficient permissions to update admin user');
  }

  const { data, error } = await (supabase
    .from('admin_users') as any)
    .update(updates)
    .eq('id', adminUserId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get all admin users (only for super admins)
 */
export async function getAdminUsers() {
  // Check if current user is super admin
  const hasAccess = await hasAdminRole('super_admin');
  if (!hasAccess) {
    throw new Error('Insufficient permissions to view admin users');
  }

  const { data, error } = await supabase
    .from('admin_users')
    .select(`
      *,
      user:user_id (
        email,
        created_at
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Auth state change listener
 */
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const user = await getCurrentUser();
      callback(user);
    } else {
      callback(null);
    }
  });
}

/**
 * Require admin access - throws error if not admin
 */
export async function requireAdmin() {
  const user = await getCurrentUser();
  
  if (!user?.isAdmin) {
    throw new Error('Admin access required');
  }
  
  return user;
}

/**
 * Require specific admin role - throws error if insufficient permissions
 */
export async function requireAdminRole(requiredRole: AdminRole) {
  const hasAccess = await hasAdminRole(requiredRole);
  
  if (!hasAccess) {
    throw new Error(`${requiredRole} role required`);
  }
  
  return true;
}