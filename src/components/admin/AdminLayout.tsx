// Admin dashboard layout component
import { ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  User,
  Menu,
  X
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>('');
  const [adminRole, setAdminRole] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || '');
        
        // Get admin role
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (adminData) {
          setAdminRole((adminData as any).role);
        }
      }
    };
    loadUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/admin/login', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: LayoutDashboard },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-lg sm:text-2xl font-bold text-black tracking-tight">
                BroHood <span className="text-gray-400 font-normal hidden sm:inline">Admin</span>
              </h1>
            </div>

            {/* User menu */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-xs sm:text-sm text-gray-600 hidden md:inline">
                Welcome, {userEmail || 'Admin'}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {userEmail?.charAt(0).toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {userEmail}
                      </p>
                      {adminRole && (
                        <p className="text-xs leading-none text-muted-foreground">
                          Role: {adminRole}
                        </p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <nav className="hidden lg:block w-64 bg-white/50 backdrop-blur-sm shadow-sm min-h-screen border-r border-gray-100">
          <div className="p-6">
            <ul className="space-y-1">
              {navigation.map((item, index) => {
                const Icon = item.icon;
                const isActive = window.location.pathname === item.href;
                return (
                  <li key={item.name} className="stagger-item" style={{ animationDelay: `${index * 0.1}s` }}>
                    <a
                      href={item.href}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 group ${
                        isActive 
                          ? 'bg-black text-white shadow-lg' 
                          : 'text-gray-700 hover:bg-gray-100 hover:text-black hover:translate-x-1'
                      }`}
                    >
                      <Icon className={`mr-3 h-5 w-5 transition-transform duration-300 ${!isActive && 'group-hover:scale-110'}`} />
                      {item.name}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Sidebar - Mobile */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)}>
            <nav className="fixed left-0 top-14 bottom-0 w-64 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-4">
                <ul className="space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = window.location.pathname === item.href;
                    return (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                            isActive 
                              ? 'bg-black text-white shadow-lg' 
                              : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                          }`}
                        >
                          <Icon className="mr-3 h-5 w-5" />
                          {item.name}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </nav>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}