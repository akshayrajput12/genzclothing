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
    <div className="bg-[#F8FAFC] dark:bg-[#0B0B0F] font-display min-h-screen text-[#0B0B0F] dark:text-[#F8FAFC] overflow-x-hidden relative">
      {/* Subtle manga line overlay */}
      <div className="fixed inset-0 manga-texture pointer-events-none z-0"></div>

      <div className="flex min-h-screen relative z-10">
        {/* Sidebar Navigation */}
        <aside
          className={`
            fixed top-0 left-0 h-full bg-[#F8FAFC] dark:bg-[#0B0B0F] border-r border-[#0B0B0F]/10 dark:border-[#F8FAFC]/10 
            flex flex-col justify-between p-8 w-72 z-50 transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <div className="flex flex-col gap-12">
            <div className="flex flex-col cursor-pointer" onClick={() => navigate('/')}>
              <h1 className="font-bebas text-4xl tracking-widest text-primary">OBITO</h1>
              <p className="text-xs uppercase tracking-[0.2em] font-bold text-[#0B0B0F]/40 dark:text-[#F8FAFC]/40">Member Profile Hub</p>
            </div>

            <nav className="flex flex-col gap-6">
              <button
                onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }}
                className={`flex items-center gap-4 group text-left ${activeTab === 'profile' ? '' : 'text-[#0B0B0F]/60 dark:text-[#F8FAFC]/60 hover:text-[#0B0B0F] dark:hover:text-[#F8FAFC]'}`}
              >
                <span className={`material-symbols-outlined fill-1 ${activeTab === 'profile' ? 'text-primary' : 'group-hover:text-primary transition-colors'}`}>
                  account_circle
                </span>
                <span className={`font-bebas text-2xl tracking-wider ${activeTab === 'profile' ? 'text-primary active-glow' : 'group-hover:text-primary transition-colors'}`}>
                  PROFILE
                </span>
              </button>

              <button
                onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }}
                className={`flex items-center gap-4 group text-left ${activeTab === 'orders' ? '' : 'text-[#0B0B0F]/60 dark:text-[#F8FAFC]/60 hover:text-[#0B0B0F] dark:hover:text-[#F8FAFC]'}`}
              >
                <span className={`material-symbols-outlined fill-1 ${activeTab === 'orders' ? 'text-primary' : 'group-hover:text-primary transition-colors'}`}>
                  package_2
                </span>
                <span className={`font-bebas text-2xl tracking-wider ${activeTab === 'orders' ? 'text-primary active-glow' : 'group-hover:text-primary transition-colors'}`}>
                  ORDERS
                </span>
              </button>

              <button
                onClick={() => { setActiveTab('addresses'); setIsSidebarOpen(false); }}
                className={`flex items-center gap-4 group text-left ${activeTab === 'addresses' ? '' : 'text-[#0B0B0F]/60 dark:text-[#F8FAFC]/60 hover:text-[#0B0B0F] dark:hover:text-[#F8FAFC]'}`}
              >
                <span className={`material-symbols-outlined fill-1 ${activeTab === 'addresses' ? 'text-primary' : 'group-hover:text-primary transition-colors'}`}>
                  location_on
                </span>
                <span className={`font-bebas text-2xl tracking-wider ${activeTab === 'addresses' ? 'text-primary active-glow' : 'group-hover:text-primary transition-colors'}`}>
                  ADDRESSES
                </span>
              </button>
            </nav>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 border-2 border-[#0B0B0F] dark:border-[#F8FAFC] px-6 py-3 font-bebas text-xl tracking-wider hover:bg-[#0B0B0F] dark:hover:bg-[#F8FAFC] hover:text-white dark:hover:text-[#0B0B0F] transition-all"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            LOG OUT
          </button>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Mobile Header Toggle */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-30 p-4 flex items-center justify-between bg-[#F8FAFC]/90 dark:bg-[#0B0B0F]/90 backdrop-blur-md border-b border-[#0B0B0F]/10">
          <button onClick={toggleSidebar} className="text-primary">
            <span className="material-symbols-outlined text-3xl">menu</span>
          </button>
          <span className="font-bebas text-2xl tracking-wider">MY ACCOUNT</span>
          <div className="w-8"></div>
        </div>

        {/* Main Content */}
        <main className="md:ml-72 flex-1 p-6 md:p-16 max-w-6xl w-full pt-20 md:pt-16">
          {/* Page Heading */}
          <div className="mb-12">
            <h1 className="font-bebas text-6xl md:text-9xl italic leading-none text-[#0B0B0F] dark:text-[#F8FAFC] tracking-tighter">
              MY ACCOUNT
            </h1>
            <p className="text-lg text-[#0B0B0F]/60 dark:text-[#F8FAFC]/60 mt-4 max-w-xl">
              Manage your credentials, track active missions, and update your shipping location.
            </p>
          </div>

          {/* Profile Content */}
          {activeTab === 'profile' && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
              <div className="space-y-8 max-w-3xl">
                <div className="border-b border-[#0B0B0F]/10 dark:border-[#F8FAFC]/10 pb-4">
                  <h2 className="font-bebas text-4xl tracking-wide">SHINOBI DATA</h2>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* Full Name */}
                  <label className="flex flex-col gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-[#0B0B0F]/50 dark:text-[#F8FAFC]/50">Full Name</span>
                    <input
                      className="bg-transparent border-2 border-[#0B0B0F] dark:border-[#F8FAFC] p-4 font-medium focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-[#0B0B0F]/30 dark:placeholder:text-[#F8FAFC]/30"
                      placeholder="Enter your name"
                      type="text"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    />
                  </label>

                  {/* Email */}
                  <label className="flex flex-col gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-[#0B0B0F]/50 dark:text-[#F8FAFC]/50">Email Address</span>
                    <input
                      className="bg-transparent border-2 border-[#0B0B0F] dark:border-[#F8FAFC] p-4 font-medium opacity-60 cursor-not-allowed"
                      type="email"
                      value={user?.email || ''}
                      disabled
                    />
                  </label>

                  {/* Phone */}
                  <label className="flex flex-col gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-[#0B0B0F]/50 dark:text-[#F8FAFC]/50">Phone Number</span>
                    <input
                      className="bg-transparent border-2 border-[#0B0B0F] dark:border-[#F8FAFC] p-4 font-medium focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-[#0B0B0F]/30 dark:placeholder:text-[#F8FAFC]/30"
                      placeholder="+91"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    />
                  </label>
                </div>

                <button
                  onClick={updateProfile}
                  disabled={loading}
                  className="bg-primary text-white font-bebas text-2xl tracking-widest px-10 py-4 shadow-[4px_4px_0px_0px_rgba(11,11,15,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-70 disabled:hover:shadow-[4px_4px_0px_0px_rgba(11,11,15,1)] disabled:hover:translate-x-0 disabled:hover:translate-y-0"
                >
                  {loading ? 'SAVING...' : 'SAVE CHANGES'}
                </button>
              </div>
            </div>
          )}

          {/* Orders Content */}
          {activeTab === 'orders' && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
              <div className="space-y-8">
                <div className="border-b border-[#0B0B0F]/10 dark:border-[#F8FAFC]/10 pb-4 flex justify-between items-end">
                  <h2 className="font-bebas text-4xl tracking-wide">ACTIVE MISSIONS</h2>
                  <span className="text-xs font-bold text-primary underline cursor-pointer">{orders.length} TOTAL</span>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-20 border-2 border-dashed border-[#0B0B0F]/20 dark:border-[#F8FAFC]/20">
                    <p className="font-bebas text-2xl text-[#0B0B0F]/40 dark:text-[#F8FAFC]/40">No active missions found</p>
                    <button onClick={() => navigate('/products')} className="mt-4 text-primary font-bold hover:underline">START SHOPPING</button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order: any) => {
                      const productImage = getProductImage(order.items);
                      const productName = getProductNames(order.items);

                      return (
                        <div key={order.id} className="bg-white dark:bg-[#0B0B0F] border-2 border-[#0B0B0F] dark:border-[#F8FAFC] p-4 flex gap-4 relative group hover:bg-[#F8FAFC] dark:hover:bg-[#1a1a20] transition-colors">
                          {/* Image */}
                          <div className="w-24 h-24 bg-primary/10 flex-shrink-0 geometric-crop overflow-hidden">
                            {productImage ? (
                              <img
                                src={productImage}
                                alt="Product"
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-primary/40">
                                <span className="material-symbols-outlined">checkroom</span>
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex flex-col justify-between py-1 flex-1">
                            <div>
                              <p className="font-bebas text-xl md:text-2xl tracking-wide leading-tight dark:text-[#F8FAFC] line-clamp-1">{productName}</p>
                              <p className="text-xs text-[#0B0B0F]/40 dark:text-[#F8FAFC]/40 font-bold uppercase tracking-tighter mt-1">
                                Order #{order.order_number?.slice(-6) || order.id.slice(0, 8)}
                              </p>
                            </div>

                            <div className="flex justify-between items-end w-full">
                              <span className={`inline-flex items-center px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded-sm w-fit
                                  ${order.order_status === 'delivered' ? 'bg-green-100 text-green-700' :
                                  order.order_status === 'processing' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}
                                `}>
                                {order.order_status}
                              </span>

                              <p className="font-bebas text-xl text-primary">₹{order.total?.toLocaleString('en-IN')}</p>
                            </div>
                          </div>

                          {/* View Button Overlay (Desktop) */}
                          <button
                            onClick={() => window.open(`/order-detail/${order.id}`, '_blank')}
                            className="absolute top-4 right-4 md:opacity-0 group-hover:opacity-100 transition-opacity p-2 text-primary hover:text-[#0B0B0F] dark:hover:text-[#F8FAFC]"
                          >
                            <span className="material-symbols-outlined">open_in_new</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Addresses Content */}
          {activeTab === 'addresses' && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
              <div className="border-b border-[#0B0B0F]/10 dark:border-[#F8FAFC]/10 pb-4 mb-8">
                <h2 className="font-bebas text-4xl tracking-wide">SHIPPING LOCATIONS</h2>
              </div>
              {/* Wrapped AddressManager to inherit styles somewhat or leave as is if it's complex */}
              <div className="[&_h3]:font-bebas [&_h3]:text-2xl [&_button]:font-bebas [&_button]:tracking-wider">
                <AddressManager />
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Decorative Corner Element */}
      <div className="fixed bottom-0 right-0 p-8 pointer-events-none opacity-10 z-0 hidden md:block">
        <h2 className="font-bebas text-[12rem] leading-none text-[#0B0B0F] dark:text-[#F8FAFC] select-none">
          {activeTab === 'profile' ? 'PROFILE' : activeTab === 'orders' ? 'ORDERS' : 'LOCATIONS'}
        </h2>
      </div>
    </div>
  );
}