// Script to set up the first admin user
// This should be run after a user has registered through Supabase Auth

import { supabase } from '@/integrations/supabase/client';

export async function setupFirstAdmin(email: string) {
  try {
    // First, check if user exists in auth.users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      throw new Error(`Failed to list users: ${usersError.message}`);
    }

    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      throw new Error(`User with email ${email} not found. Please register first.`);
    }

    // Check if user is already an admin
    const { data: existingAdmin, error: adminCheckError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!adminCheckError && existingAdmin) {
      console.log('User is already an admin');
      return existingAdmin;
    }

    // Create admin user record
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .insert({
        user_id: user.id,
        role: 'super_admin',
        active: true,
        permissions: []
      })
      .select()
      .single();

    if (adminError) {
      throw new Error(`Failed to create admin user: ${adminError.message}`);
    }

    console.log('Admin user created successfully:', adminUser);
    return adminUser;

  } catch (error) {
    console.error('Error setting up admin:', error);
    throw error;
  }
}

// Helper function to create admin user via RPC (if user is already authenticated)
export async function createAdminViaRPC(email: string, role: 'super_admin' | 'admin' | 'moderator' = 'super_admin') {
  try {
    const { data, error } = await supabase.rpc('create_admin_user', {
      admin_email: email,
      admin_role: role
    });

    if (error) {
      throw error;
    }

    console.log('Admin user created via RPC:', data);
    return data;
  } catch (error) {
    console.error('Error creating admin via RPC:', error);
    throw error;
  }
}

// Usage example:
// 1. First register a user through Supabase Auth UI or API
// 2. Then call setupFirstAdmin('admin@brohood.com') to make them an admin
// 3. Or use createAdminViaRPC if you have the RPC function available