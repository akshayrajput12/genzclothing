import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AddressManager from '@/components/AddressManager';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [profileData, setProfileData] = useState({
    full_name: '',
    phone: '',
  });

  // Update profile data when profile loads
  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    // Check screen size to auto-close sidebar on mobile
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchAddresses();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      let { data, error } = await supabase
        .from('orders')
        .select('*') // Select order items as well
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user?.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed Out",
      description: "You have been signed out successfully.",
    });
    navigate('/');
  };

  const getProductImage = (items: any) => {
    if (Array.isArray(items) && items.length > 0) {
      return items[0].image || items[0].image_url || items[0].product_image || null;
    }
    return null;
  };

  const getProductNames = (items: any) => {
    if (Array.isArray(items) && items.length > 0) {
      const names = items.map((i: any) => i.name || i.product_name).join(', ');
      return names.length > 60 ? names.substring(0, 60) + '...' : names;
    }
    return 'Assorted Items';
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex min-h-screen main-gradient font-sans-custom text-[#1b0d13] dark:text-white relative items-start">

      {/* Mobile Header / Sidebar Toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 p-4 flex items-center justify-between glass-sidebar h-16 shadow-sm">
        <button onClick={toggleSidebar} className="p-2 -ml-2 text-primary">
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>
        <span className="font-display font-bold text-lg">My Account</span>
        <div className="w-8"></div> {/* Spacer for balance */}
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 md:top-0 h-full md:h-screen w-[280px] md:w-80 flex-shrink-0 z-50 md:z-auto transition-transform duration-300 ease-in-out glass-sidebar
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full p-6 md:p-8">

          {/* Back to Home (Desktop) */}
          <button
            onClick={() => navigate('/')}
            className="hidden md:flex items-center gap-2 text-sm font-medium text-primary mb-8 opacity-70 hover:opacity-100 transition-opacity"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Home
          </button>

          {/* Back to Home (Mobile) */}
          <button
            onClick={() => navigate('/')}
            className="flex md:hidden items-center gap-2 text-sm font-medium text-primary mb-8 opacity-70 hover:opacity-100 transition-opacity mt-4"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Home
          </button>

          {/* User Profile Intro */}
          <div className="flex items-center gap-4 mb-10">
            <div className="flex flex-col">
              <h1 className="font-display font-bold text-lg tracking-tight">Welcome,</h1>
              <p className="text-primary/90 text-sm font-bold">{profile?.full_name?.split(' ')[0] || 'Member'}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2 flex-grow">
            {[
              { id: 'profile', icon: 'person', label: 'Profile' },
              { id: 'orders', icon: 'local_mall', label: 'Orders' },
              { id: 'addresses', icon: 'location_on', label: 'Addresses' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 group ${activeTab === item.id
                  ? 'bg-white/90 dark:bg-white/10 shadow-lg shadow-black/5 border border-white/50'
                  : 'hover:bg-white/40 dark:hover:bg-white/5'
                  }`}
              >
                <span className={`material-symbols-outlined text-[20px] transition-colors ${activeTab === item.id ? 'text-primary' : 'text-gray-500 dark:text-gray-400 group-hover:text-primary'
                  }`}>
                  {item.icon}
                </span>
                <p className={`text-sm font-bold tracking-wide transition-colors ${activeTab === item.id ? 'text-[#1b0d13] dark:text-white' : 'text-gray-600 dark:text-gray-300'
                  }`}>
                  {item.label}
                </p>
              </button>
            ))}
          </nav>

          {/* Bottom Action */}
          <button
            onClick={handleSignOut}
            className="flex w-full cursor-pointer items-center justify-center rounded-xl h-12 px-4 bg-white/40 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-900/10 text-[#1b0d13] dark:text-white text-sm font-bold border border-white/20 transition-all mt-6 md:mt-0 hover:border-red-200 group"
          >
            <span className="material-symbols-outlined mr-2 text-gray-500 group-hover:text-red-500 text-[20px] transition-colors">logout</span>
            <span className="truncate group-hover:text-red-600 transition-colors">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full px-4 py-20 md:py-12 md:px-12 h-screen overflow-y-auto">
        <div className="max-w-4xl mx-auto pb-20">

          {/* Page Heading (Desktop only, mobile has header) */}
          <div className="hidden md:flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div className="max-w-xl">
              <h2 className="font-display text-[#1b0d13] dark:text-white text-4xl md:text-5xl font-black leading-tight tracking-tight mb-2">
                My Account
              </h2>
            </div>
            <div className="text-right">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-[#9a4c6c]/60 mb-1">
                Member ID
              </span>
              <span className="font-mono text-xs opacity-50">{user?.id?.substring(0, 8).toUpperCase()}</span>
            </div>
          </div>

          {/* Content Card with Darker Glassmorphism */}
          <div className="glass-card rounded-[2rem] shadow-2xl shadow-black/5 p-6 md:p-10 relative overflow-hidden min-h-[500px]">

            {/* PROFILE TAB CONTENT */}
            {activeTab === 'profile' && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Simplified Profile Header */}
                <div className="flex flex-col items-center justify-center text-center mb-10">
                  <h3 className="font-display text-[#1b0d13] dark:text-white text-2xl font-bold mb-1">
                    {profile?.full_name || 'User'}
                  </h3>
                  <p className="text-[#9a4c6c] dark:text-primary/70 text-sm font-medium">{user?.email}</p>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent w-full mb-10"></div>

                <div className="space-y-6 max-w-2xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[#1b0d13]/60 dark:text-white/60 text-[10px] font-bold uppercase tracking-widest pl-1">Full Name</label>
                      <input
                        className="w-full rounded-xl border-none bg-white/60 dark:bg-black/20 focus:bg-white focus:ring-2 focus:ring-primary/20 h-14 px-5 text-base transition-all shadow-sm"
                        type="text"
                        value={profileData.full_name}
                        onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[#1b0d13]/60 dark:text-white/60 text-[10px] font-bold uppercase tracking-widest pl-1">Email Address</label>
                      <input
                        disabled
                        className="w-full rounded-xl border-none bg-white/30 dark:bg-black/10 h-14 px-5 text-base transition-all shadow-sm opacity-60 cursor-not-allowed"
                        type="email"
                        value={user?.email || ''}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[#1b0d13]/60 dark:text-white/60 text-[10px] font-bold uppercase tracking-widest pl-1">Phone Number</label>
                      <input
                        className="w-full rounded-xl border-none bg-white/60 dark:bg-black/20 focus:bg-white focus:ring-2 focus:ring-primary/20 h-14 px-5 text-base transition-all shadow-sm"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="+91"
                      />
                    </div>
                  </div>

                  <div className="pt-6 flex flex-col items-center gap-4">
                    <button
                      onClick={updateProfile}
                      disabled={loading}
                      className="w-full md:w-auto min-w-[200px] h-14 bg-[#1b0d13] dark:bg-white hover:bg-primary text-white dark:text-[#1b0d13] dark:hover:text-white rounded-xl text-base font-bold shadow-xl shadow-black/10 hover:shadow-primary/30 hover:scale-[1.02] transition-all disabled:opacity-70 disabled:hover:scale-100"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving
                        </span>
                      ) : 'Save Changes'}
                    </button>
                    <button
                      className="text-[#9a4c6c] text-xs font-bold hover:underline opacity-70 hover:opacity-100 transition-opacity"
                      onClick={() => {
                        setProfileData({
                          full_name: profile?.full_name || '',
                          phone: profile?.phone || '',
                        });
                      }}
                    >
                      Discard changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ORDERS TAB CONTENT */}
            {activeTab === 'orders' && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-display text-[#1b0d13] dark:text-white text-2xl font-bold">Recent Orders</h3>
                  {orders.length > 0 && (
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">
                      {orders.length} orders
                    </span>
                  )}
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-20 flex flex-col items-center justify-center border-2 border-dashed border-primary/10 rounded-3xl bg-white/20">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg shadow-primary/5">
                      <span className="material-symbols-outlined text-primary/40 text-3xl">shopping_bag</span>
                    </div>
                    <h3 className="font-display text-lg mb-2 font-bold text-primary/80">No orders yet</h3>
                    <p className="text-[#9a4c6c] text-sm mb-6 max-w-xs mx-auto">Your collection is waiting for you.</p>
                    <button onClick={() => navigate('/products')} className="px-6 py-3 bg-primary text-white rounded-xl shadow-lg hover:bg-[#1b0d13] hover:scale-[1.02] transition-all font-bold text-xs uppercase tracking-widest">
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {orders.map((order: any) => {
                      const productImage = getProductImage(order.items);
                      return (
                        <div key={order.id} className="group bg-white/60 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-2xl p-4 transition-all hover:bg-white hover:shadow-xl hover:shadow-primary/5 hover:scale-[1.01] overflow-hidden relative">
                          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                            {/* Product Image */}
                            <div className="w-full sm:w-24 h-32 sm:h-24 shrink-0 bg-gray-100 rounded-xl overflow-hidden relative">
                              {productImage ? (
                                <img src={productImage} alt="Product" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/20">
                                  <span className="material-symbols-outlined text-2xl">checkroom</span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                            </div>

                            {/* Order Info */}
                            <div className="flex-1 flex flex-col justify-center py-1">
                              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="bg-black text-white px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest font-mono">
                                    #{order.order_number?.slice(-6)}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest border
                                           ${order.order_status === 'delivered' ? 'bg-green-50/50 border-green-200 text-green-700' :
                                      order.order_status === 'processing' ? 'bg-blue-50/50 border-blue-200 text-blue-700' :
                                        'bg-gray-50/50 border-gray-200 text-gray-600'}`}>
                                    {order.order_status}
                                  </span>
                                </div>
                                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                                  {new Date(order.created_at).toLocaleDateString(undefined, { year: '2-digit', month: 'short', day: 'numeric' })}
                                </span>
                              </div>

                              <h4 className="font-display font-bold text-base mb-1 line-clamp-1">{getProductNames(order.items)}</h4>

                              <div className="mt-auto flex items-end justify-between pt-2">
                                <div>
                                  <p className="font-display font-bold text-lg text-primary">₹{order.total?.toLocaleString('en-IN')}</p>
                                </div>
                                <button
                                  onClick={() => window.open(`/order-detail/${order.id}`, '_blank')}
                                  className="h-9 w-9 rounded-full bg-white border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-45 shadow-sm"
                                >
                                  <span className="material-symbols-outlined text-lg">arrow_outward</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ADDRESSES TAB CONTENT */}
            {activeTab === 'addresses' && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <h3 className="font-display text-[#1b0d13] dark:text-white text-2xl font-bold mb-8">Shipping Addresses</h3>
                <AddressManager />
              </div>
            )}

            {/* Aesthetic Watermark Decor */}
            <div className="absolute -bottom-20 -right-20 opacity-[0.03] pointer-events-none select-none">
              <span className="font-display text-[150px] md:text-[200px] font-black italic tracking-tighter">PH</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}