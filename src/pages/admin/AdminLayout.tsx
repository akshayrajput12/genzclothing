import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  Tags,
  Star,
  Image,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: Tags },
    { name: 'Coupons', href: '/admin/coupons', icon: Tags },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Best Sellers', href: '/admin/bestsellers', icon: Star },
    { name: 'Messages', href: '/admin/messages', icon: MessageCircle },
    { name: 'Instagram Posts', href: '/admin/instagram-posts', icon: Image },
    { name: 'Hero Slides', href: '/admin/hero', icon: Image },
    { name: 'Testimonials', href: '/admin/testimonials', icon: MessageCircle },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    signOut();
    navigate('/auth');
  };

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#F5EFE7] font-sans text-[#4A1C1F]">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#D4B6A2]/30 shadow-sm transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-20 px-6 border-b border-[#D4B6A2]/30 flex-shrink-0">
          <h2 className="text-2xl font-serif font-bold text-[#4A1C1F] tracking-tight">Admin Panel</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-[#4A1C1F]/60 hover:text-[#4A1C1F]"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto h-[calc(100vh-9rem)]">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-300 group
                  ${active
                    ? 'bg-[#4A1C1F] text-[#F5EFE7] shadow-md translate-x-1'
                    : 'text-[#5C4638] hover:bg-[#F5EFE7] hover:text-[#4A1C1F] hover:translate-x-1'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className={`mr-3 h-4 w-4 transition-colors ${active ? 'text-[#B38B46]' : 'text-[#B38B46]/70 group-hover:text-[#B38B46]'}`} />
                <span className="font-medium tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#D4B6A2]/30 bg-[#F5EFE7]/30 absolute bottom-0 w-full">
          <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="p-0">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-[#4A1C1F] rounded-full flex items-center justify-center shadow-md ring-2 ring-[#B38B46]/20">
                  <span className="text-[#F5EFE7] text-sm font-serif">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-serif font-medium text-[#4A1C1F] truncate">
                    {profile?.full_name || 'Admin User'}
                  </p>
                  <p className="text-xs text-[#5C4638] truncate font-light">
                    {user?.email || 'admin@example.com'}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full border-[#D4B6A2] hover:bg-[#4A1C1F] hover:text-white hover:border-[#4A1C1F] transition-all uppercase tracking-wider text-[10px] h-9 font-medium"
              >
                <LogOut className="w-3 h-3 mr-2" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64 transition-all duration-300 min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex items-center h-20 px-8 bg-[#F5EFE7]/90 backdrop-blur-md border-b border-[#D4B6A2]/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden mr-4 text-[#4A1C1F]"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="ml-auto flex items-center space-x-4">
            <Link
              to="/"
              className="text-xs uppercase tracking-widest font-bold text-[#4A1C1F] hover:text-[#B38B46] transition-colors flex items-center gap-2"
            >
              <span>← Back to Store</span>
            </Link>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6 md:p-8 max-w-7xl mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;