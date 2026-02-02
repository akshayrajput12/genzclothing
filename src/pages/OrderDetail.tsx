import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, User, CreditCard, Phone, Mail, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { downloadInvoice, validateInvoiceData } from '@/utils/invoiceGenerator';

interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  weight: string;
  category: string;
  selected_size?: string;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  codFee: number;
  tax: number;
  discount: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'confirmed' | 'placed';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: string;
  shippingAddress: {
    completeAddress: string;
    mapAddress?: string;
    plotNumber: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    latitude?: number;
    longitude?: number;
  };
  orderDate: string;
  deliveryDate?: string;
  trackingNumber?: string;
  notes?: string;
  couponCode?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  estimatedDeliveryTime?: string;
  selectedSize?: string;
}

const UserOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && user) {
      fetchOrderDetail();
    }
  }, [id, user]);

  const fetchOrderDetail = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Check if user owns this order
      if (data.user_id !== user?.id) {
        // Try fallback by email for old orders
        const customerInfo = data.customer_info as any;
        if (customerInfo?.email !== user?.email) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to view this order.",
            variant: "destructive",
          });
          navigate('/profile?tab=orders');
          return;
        }
      }

      if (data) {
        const customerInfo = data.customer_info as any;
        const addressDetails = data.address_details as any;
        const deliveryLocation = data.delivery_location as any;
        const orderItems = data.items as any;

        const orderDetail: OrderDetail = {
          id: data.id,
          orderNumber: data.order_number,
          customerName: customerInfo?.name || 'Unknown Customer',
          customerEmail: customerInfo?.email || '',
          customerPhone: customerInfo?.phone || '',
          items: Array.isArray(orderItems) ? orderItems.map((item: any) => ({
            ...item,
            selected_size: item.selected_size || (data as any).selected_size
          })) : [],
          subtotal: data.subtotal,
          deliveryFee: data.delivery_fee,
          codFee: data.cod_fee || 0,
          tax: data.tax,
          discount: data.discount || 0,
          total: data.total,
          status: data.order_status as any,
          paymentStatus: data.payment_status as any,
          paymentMethod: data.payment_method,
          shippingAddress: {
            completeAddress: addressDetails?.complete_address || '',
            mapAddress: addressDetails?.map_address || deliveryLocation?.address || '',
            plotNumber: addressDetails?.plotNumber || '',
            street: addressDetails?.street || '',
            city: deliveryLocation?.address?.split(',').slice(-2, -1)[0]?.trim() || 'Unknown',
            state: deliveryLocation?.address?.split(',').slice(-1)[0]?.trim() || 'Unknown',
            pincode: addressDetails?.pincode || '',
            landmark: addressDetails?.landmark || '',
            latitude: addressDetails?.latitude || deliveryLocation?.lat,
            longitude: addressDetails?.longitude || deliveryLocation?.lng
          },
          orderDate: data.created_at,
          deliveryDate: data.actual_delivery,
          trackingNumber: data.tracking_url,
          notes: data.special_instructions,
          couponCode: data.coupon_code,
          razorpayPaymentId: data.razorpay_payment_id,
          razorpayOrderId: data.razorpay_order_id,
          selectedSize: (data as any).selected_size,
        };
        setOrder(orderDetail);
      }
    } catch (error: any) {
      console.error('Error fetching order:', error);
      toast({
        title: "Error",
        description: "Failed to fetch order details",
        variant: "destructive",
      });
      navigate('/profile?tab=orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'shipped':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'placed':
      case 'pending':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;

    try {
      const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['store_name', 'store_address', 'store_phone', 'store_email', 'currency_symbol']);

      if (settingsError) {
        console.warn('Error fetching settings:', settingsError);
      }

      const storeSettings = settings?.reduce((acc: Record<string, any>, setting: any) => {
        acc[setting.key] = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
        return acc;
      }, {}) || {};

      const invoiceData = {
        invoice_number: `INV-${order.orderNumber}`,
        order_number: order.orderNumber,
        invoice_date: new Date().toLocaleDateString('en-IN'),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
        order_date: formatDate(order.orderDate),
        store_info: {
          store_name: storeSettings.store_name || 'Paridhan Haat',
          store_address: storeSettings.store_address || 'Shop number 5, Patel Nagar, Hansi road, Patiala chowk, JIND (Haryana) 126102',
          store_phone: storeSettings.store_phone || '+91 9996616153',
          store_email: storeSettings.store_email || 'contact@paridhanhaat.com',
          currency_symbol: storeSettings.currency_symbol || '₹'
        },
        customer_info: {
          name: order.customerName,
          email: order.customerEmail,
          phone: order.customerPhone
        },
        delivery_address: {
          ...order.shippingAddress,
          street: order.shippingAddress.completeAddress || order.shippingAddress.street, // Ensure compatibility
          complete_address: order.shippingAddress.completeAddress
        },
        items: order.items,
        pricing: {
          subtotal: order.subtotal,
          tax: order.tax,
          delivery_fee: order.deliveryFee,
          cod_fee: order.codFee,
          discount: order.discount,
          total: order.total
        },
        payment_info: {
          method: order.paymentMethod,
          status: order.paymentStatus,
          razorpay_payment_id: order.razorpayPaymentId
        },
        order_status: order.status,
        coupon_code: order.couponCode,
        special_instructions: order.notes
      };

      if (!validateInvoiceData(invoiceData)) {
        throw new Error('Invalid invoice data');
      }

      await downloadInvoice(invoiceData);

      toast({
        title: "Success",
        description: "Invoice downloaded successfully",
      });
    } catch (error: any) {
      console.error('Error downloading invoice:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to download invoice",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FDFCFB] dark:bg-[#0C0C0C]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm font-serif tracking-widest uppercase animate-pulse">Loading Order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center animate-in fade-in duration-500 min-h-screen flex flex-col items-center justify-center bg-[#FDFCFB] dark:bg-[#0C0C0C]">
        <span className="material-symbols-outlined text-6xl text-primary/40 mb-4">search_off</span>
        <h1 className="text-3xl font-serif text-[#4A1C1F] dark:text-white mb-2">Order not found</h1>
        <p className="text-gray-500 mb-8">We couldn't locate the order details you're looking for.</p>
        <Button onClick={() => navigate('/profile?tab=orders')} className="bg-primary hover:bg-primary/90 text-white uppercase tracking-widest text-xs rounded-full px-8 py-6">
          Back to Orders
        </Button>
      </div>
    );
  }

  // Custom styles for this page (Glassmorphism)
  const glassStyle = "bg-white/60 dark:bg-black/60 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-2xl shadow-black/10";
  const statusGlow = "shadow-[0_0_15px_rgba(197,160,89,0.3)]";

  return (
    <div className="bg-[#FDFCFB] dark:bg-[#0C0C0C] text-slate-900 dark:text-slate-100 font-sans min-h-screen selection:bg-primary selection:text-white overflow-hidden">
      {/* Header */}
      <header className={`sticky top-0 z-50 ${glassStyle} border-b border-white/20 dark:border-white/5 py-4 px-6 md:px-12 flex justify-between items-center transition-all duration-300`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/profile?tab=orders')}
            className="group flex items-center gap-2 text-sm font-medium opacity-70 hover:opacity-100 transition-all uppercase tracking-wide"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
            <span className="hidden sm:inline">Back to Orders</span>
          </button>
          <div className="h-4 w-[1px] bg-black/10 dark:bg-white/10 mx-2 hidden sm:block"></div>
          <h1 className="font-display italic text-lg md:text-2xl tracking-tight flex items-baseline gap-2">
            Order <span className="text-primary font-serif not-italic">#{order.orderNumber}</span>
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className="text-[10px] uppercase tracking-widest opacity-50">Placed on</span>
            <span className="text-xs font-semibold">{new Date(order.orderDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}, {new Date(order.orderDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <button
            onClick={handleDownloadInvoice}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span className="hidden sm:inline">INVOICE</span>
          </button>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto min-h-[calc(100vh-80px)] flex flex-col lg:flex-row relative">
        {/* Background Elements for Glass Effect */}
        <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -z-10 pointer-events-none opacity-60"></div>
        <div className="fixed bottom-0 left-20 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -z-10 pointer-events-none opacity-40"></div>

        {/* Left Section: Items */}
        <section className="flex-1 p-6 md:p-12 lg:border-r border-black/5 dark:border-white/5 overflow-y-auto w-full z-10">
          <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h2 className="font-serif text-4xl md:text-5xl mb-2 text-[#1b0d13] dark:text-white">Your Items</h2>
              <p className="text-slate-500 dark:text-slate-400">Reviewing {order.items.length} product{order.items.length !== 1 ? 's' : ''} from your collection.</p>
            </div>
            <div className={`px-4 py-1.5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20 text-xs font-bold tracking-widest uppercase ${statusGlow}`}>
              {order.status}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {order.items.map((item, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-900 mb-4 shadow-sm">
                  <img
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    src={item.image || "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2574&auto=format&fit=crop"}
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-xs font-bold tracking-widest uppercase bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                      View Details
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-black/5 dark:border-white/10 shadow-sm">
                    Qty: {item.quantity.toString().padStart(2, '0')}
                  </div>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-serif text-2xl group-hover:text-primary transition-colors leading-tight mb-1">{item.name}</h3>
                    <p className="text-sm opacity-60 uppercase tracking-tighter font-medium">
                      {item.selected_size ? `Size: ${item.selected_size}` : ''}
                      {item.weight ? ` • ${item.weight}` : ''}
                      {item.category ? ` • ${item.category}` : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display text-xl whitespace-nowrap">₹{item.price.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:hidden mt-12 space-y-6">
            <hr className="border-black/5 dark:border-white/5" />
            <button className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-bold text-sm tracking-widest rounded-xl uppercase">
              Need Help?
            </button>
          </div>
        </section>

        {/* Right Sidebar: Details & Summary */}
        <aside className="w-full lg:w-[450px] p-6 md:p-12 space-y-8 relative overflow-hidden bg-transparent z-10">

          {/* Delivery Details Card */}
          <div className={`${glassStyle} p-6 md:p-8 rounded-[32px] transition-all hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <span className="material-symbols-outlined">local_shipping</span>
              </div>
              <h3 className="font-serif text-2xl">Delivery Details</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">Recipient</p>
                <p className="text-lg font-medium font-serif">{order.customerName}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">Address</p>
                <p className="text-sm opacity-70 leading-relaxed max-w-[90%] font-medium">
                  {order.shippingAddress.completeAddress || `${order.shippingAddress.plotNumber}, ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`}
                </p>
              </div>
              <div className="pt-4 border-t border-black/5 dark:border-white/5 space-y-3">
                {order.customerEmail && (
                  <div className="flex items-center gap-3 text-sm group">
                    <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px] text-primary">mail</span>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest opacity-50">Email</p>
                      <p className="font-medium truncate max-w-[200px]" title={order.customerEmail}>{order.customerEmail}</p>
                    </div>
                  </div>
                )}
                {order.customerPhone && (
                  <div className="flex items-center gap-3 text-sm group">
                    <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px] text-primary">call</span>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest opacity-50">Phone</p>
                      <p className="font-medium">{order.customerPhone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timeline Card */}
          <div className={`${glassStyle} p-6 md:p-8 rounded-[32px] transition-all hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <span className="material-symbols-outlined">history</span>
              </div>
              <h3 className="font-serif text-2xl">Timeline</h3>
            </div>
            <div className="space-y-6 relative before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-primary/30 ml-1">
              {/* Order Placed (Always shown) */}
              <div className="relative pl-10">
                <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-primary ring-4 ring-primary/20 z-10"></div>
                <p className="text-sm font-semibold">Order Placed</p>
                <p className="text-[11px] opacity-50">{new Date(order.orderDate).toLocaleString()}</p>
              </div>

              {['processing', 'shipped', 'delivered'].includes(order.status) && (
                <div className="relative pl-10 animate-in slide-in-from-left-2 duration-500">
                  <div className={`absolute left-2 top-1.5 w-2 h-2 rounded-full ${['processing', 'shipped', 'delivered'].includes(order.status) ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                  <p className="text-sm font-semibold">Processing</p>
                  <p className="text-[11px] opacity-50">Confirmed</p>
                </div>
              )}

              {['shipped', 'delivered'].includes(order.status) && (
                <div className="relative pl-10 animate-in slide-in-from-left-2 duration-700">
                  <div className={`absolute left-2 top-1.5 w-2 h-2 rounded-full ${['shipped', 'delivered'].includes(order.status) ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                  <p className="text-sm font-semibold">Shipped</p>
                  <p className="text-[11px] opacity-50">{order.trackingNumber ? `Track: ${order.trackingNumber}` : 'In Transit'}</p>
                </div>
              )}

              {order.status === 'delivered' && (
                <div className="relative pl-10 animate-in slide-in-from-left-2 duration-1000">
                  <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-green-500 ring-4 ring-green-500/20 z-10"></div>
                  <p className="text-sm font-semibold text-green-600">Delivered</p>
                  <p className="text-[11px] opacity-50">{order.deliveryDate ? new Date(order.deliveryDate).toDateString() : 'Delivered'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Card */}
          <div className={`${glassStyle} p-6 md:p-8 rounded-[32px] border-primary/20 bg-primary/5 dark:bg-primary/10 transition-all hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary text-white shadow-lg shadow-primary/30">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <h3 className="font-serif text-2xl">Order Summary</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="opacity-60">Subtotal ({order.items.length} Items)</span>
                <span className="font-medium">₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-60">Delivery Fee</span>
                {order.deliveryFee === 0 ? (
                  <span className="text-green-600 font-bold tracking-widest text-[10px] uppercase">Free</span>
                ) : (
                  <span className="font-medium">₹{order.deliveryFee.toLocaleString('en-IN')}</span>
                )}
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="opacity-60 text-green-600">Discount ({order.couponCode})</span>
                  <span className="font-medium text-green-600">-₹{order.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="opacity-60">Tax & Charges</span>
                <span className="font-medium">₹{order.tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-4 mt-2 border-t border-black/10 dark:border-white/10 flex justify-between items-end">
                <span className="font-serif text-xl">Total Amount</span>
                <span className="font-display text-3xl text-primary font-bold">₹{order.total.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-[10px] text-center opacity-40 mt-4 italic">
                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : `Paid via ${order.paymentMethod}`}
              </p>
            </div>
          </div>

          {/* Support Buttons */}
          <div className="pt-4 flex flex-col gap-3">
            <button
              onClick={() => navigate('/contact')}
              className={`w-full py-4 ${glassStyle} text-xs font-bold tracking-[0.2em] uppercase rounded-2xl hover:bg-white/60 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95`}
            >
              Need Help? Contact Support
            </button>
            {['pending', 'placed'].includes(order.status) && (
              <button className="w-full py-4 text-xs font-bold tracking-[0.2em] uppercase text-red-500/70 hover:text-red-500 transition-colors">
                Cancel Order
              </button>
            )}
          </div>
        </aside>
      </main>

      {/* Floating Chat Button (Mobile) */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-white dark:bg-neutral-800 rounded-full shadow-2xl flex items-center justify-center border border-black/5 dark:border-white/10 hover:scale-110 transition-transform group md:hidden z-50">
        <span className="material-symbols-outlined text-primary">chat_bubble</span>
      </button>
    </div>
  );
};

export default UserOrderDetail;