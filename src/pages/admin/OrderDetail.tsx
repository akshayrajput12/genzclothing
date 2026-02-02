import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, MapPin, User, CreditCard, Phone, Mail, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { downloadInvoice, validateInvoiceData } from '@/utils/invoiceGenerator';

interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  weight: string;
}

interface OrderDetail {
  id: string;
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
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: string;
  couponCode?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    mapAddress?: string;
    latitude?: number;
    longitude?: number;
  };
  orderDate: string;
  deliveryDate?: string;
  trackingNumber?: string;
  notes?: string;
  selectedSize?: string;
}

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchOrderDetail();
    }
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        const customerInfo = data.customer_info as any;
        const addressDetails = data.address_details as any;
        const orderItems = data.items as any;

        const deliveryLocation = data.delivery_location as any;

        const orderDetail: OrderDetail = {
          id: data.order_number,
          customerName: customerInfo?.name || 'Unknown Customer',
          customerEmail: customerInfo?.email || '',
          customerPhone: customerInfo?.phone || '',
          items: Array.isArray(orderItems) ? orderItems : [],
          subtotal: data.subtotal,
          deliveryFee: data.delivery_fee,
          codFee: data.cod_fee || 0,
          tax: data.tax,
          discount: data.discount || 0,
          total: data.total,
          status: data.order_status as any,
          paymentStatus: data.payment_status as any,
          paymentMethod: data.payment_method,
          couponCode: data.coupon_code,
          razorpayPaymentId: data.razorpay_payment_id,
          razorpayOrderId: data.razorpay_order_id,
          shippingAddress: {
            street: addressDetails?.complete_address || addressDetails?.address_line_1 || '',
            city: deliveryLocation?.address || addressDetails?.city || '',
            state: addressDetails?.state || '',
            pincode: addressDetails?.pincode || '',
            landmark: addressDetails?.landmark || '',
            mapAddress: addressDetails?.map_address || deliveryLocation?.address || '',
            latitude: addressDetails?.latitude || deliveryLocation?.lat,
            longitude: addressDetails?.longitude || deliveryLocation?.lng
          },
          orderDate: data.created_at,
          deliveryDate: data.actual_delivery,
          trackingNumber: data.tracking_url,
          notes: data.special_instructions,
          selectedSize: (data as any).selected_size,
        };
        setOrder(orderDetail);
        setCurrentStatus(orderDetail.status);
      }
    } catch (error: any) {
      console.error('Error fetching order:', error);
      toast({
        title: "Error",
        description: "Failed to fetch order details",
        variant: "destructive",
      });
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

  const updateOrderStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setCurrentStatus(newStatus);
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
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
        invoice_number: `INV-${order.id}`,
        order_number: order.id,
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
        delivery_address: order.shippingAddress,
        items: order.items.map(i => ({
          ...i,
          selected_size: (i as any).selected_size || order.selectedSize
        })),
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B38B46]"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center animate-in fade-in duration-500">
        <h1 className="text-2xl font-serif text-[#4A1C1F] mb-4">Order not found</h1>
        <Button onClick={() => navigate('/admin/orders')} className="bg-[#4A1C1F] hover:bg-[#5C4638] text-white uppercase tracking-widest text-xs rounded-none">
          Back to Orders
        </Button>
      </div>
    );
  }

  const CardStyle = "border border-[#D4B6A2]/20 shadow-sm bg-white hover:shadow-md transition-all duration-300";
  const LabelStyle = "text-[#7E5A34] text-xs uppercase tracking-widest font-medium";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/admin/orders')} className="text-[#5C4638] hover:bg-[#F9F9F7] hover:text-[#4A1C1F]">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="uppercase tracking-widest text-xs">Back</span>
          </Button>
          <div>
            <h1 className="text-3xl font-serif text-[#4A1C1F] tracking-tight">Order #{order.id}</h1>
            <p className="text-[#5C4638] font-light text-sm">
              Placed on {formatDate(order.orderDate)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={handleDownloadInvoice}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-[#D4B6A2] text-[#5C4638] hover:bg-[#F9F9F7] text-xs uppercase tracking-widest rounded-none h-8 px-4"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download Invoice</span>
            <span className="sm:hidden">Invoice</span>
          </Button>

          <Badge className={`rounded-none px-3 py-1 text-[10px] uppercase tracking-widest font-normal border-0 ${getStatusColor(currentStatus)}`}>
            {currentStatus}
          </Badge>
          <Badge className={`rounded-none px-3 py-1 text-[10px] uppercase tracking-widest font-normal border-0 ${getPaymentStatusColor(order.paymentStatus)}`}>
            {order.paymentStatus}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card className={CardStyle}>
            <CardHeader className="border-b border-[#D4B6A2]/10 pb-4">
              <CardTitle className="font-serif text-xl text-[#4A1C1F]">Order Items ({order.items.length})</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border border-[#D4B6A2]/10 rounded bg-[#F9F9F7]">
                    <div className="w-16 h-16 rounded border border-[#D4B6A2]/20 overflow-hidden bg-white">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-[#4A1C1F] font-serif">{item.name}</h3>
                      <p className="text-xs text-[#5C4638]">{item.weight}</p>
                      {order.selectedSize && (
                        <p className="text-xs text-[#B38B46] mt-0.5">Size: {order.selectedSize}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-[#4A1C1F]">₹{item.price} × {item.quantity}</p>
                      <p className="text-sm text-[#B38B46]">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6 bg-[#D4B6A2]/20" />

              <div className="space-y-4">
                <div className="bg-[#F9F9F7] p-6 rounded border border-[#D4B6A2]/10">
                  <h4 className="font-serif text-[#4A1C1F] font-medium mb-4">Pricing Breakdown</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#5C4638]">Item Total ({order.items.length} items)</span>
                      <span className="text-[#4A1C1F] font-medium">₹{order.subtotal.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-[#5C4638]">Delivery Fee</span>
                      <span>
                        {order.deliveryFee === 0 ? (
                          <span className="text-green-700 font-medium">FREE</span>
                        ) : (
                          <span className="text-[#4A1C1F]">₹{order.deliveryFee.toLocaleString('en-IN')}</span>
                        )}
                      </span>
                    </div>

                    {order.codFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#5C4638]">COD Fee</span>
                        <span className="text-[#4A1C1F]">₹{order.codFee.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span className="text-[#5C4638]">Tax & Charges</span>
                      <span className="text-[#4A1C1F]">₹{order.tax.toLocaleString('en-IN')}</span>
                    </div>

                    {order.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700">
                          Discount {order.couponCode && (
                            <span className="font-medium">({order.couponCode})</span>
                          )}
                        </span>
                        <span className="text-green-700 font-medium">-₹{order.discount.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <Separator className="my-2 bg-[#D4B6A2]/20" />

                    <div className="flex justify-between font-serif text-lg text-[#4A1C1F]">
                      <span>Total Amount</span>
                      <span className="text-[#B38B46]">₹{order.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="bg-[#F5EFE7]/50 p-6 rounded border border-[#D4B6A2]/10">
                  <h4 className="font-serif text-[#4A1C1F] font-medium mb-4">Payment Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#5C4638]">Payment Method</span>
                      <span className="text-[#4A1C1F] font-medium uppercase tracking-wider text-xs">
                        {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm items-center">
                      <span className="text-[#5C4638]">Payment Status</span>
                      <Badge className={`rounded-none px-2 py-0 text-[10px] uppercase font-normal border-0 ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </Badge>
                    </div>

                    {order.razorpayPaymentId && (
                      <div className="pt-3 border-t border-[#D4B6A2]/10">
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-[#7E5A34]">Payment ID</span>
                            <span className="font-mono text-[#5C4638] bg-white px-2 py-0.5 border border-[#D4B6A2]/20">{order.razorpayPaymentId}</span>
                          </div>
                          {order.razorpayOrderId && (
                            <div className="flex justify-between text-xs">
                              <span className="text-[#7E5A34]">Order ID</span>
                              <span className="font-mono text-[#5C4638] bg-white px-2 py-0.5 border border-[#D4B6A2]/20">{order.razorpayOrderId}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {order.paymentMethod === 'cod' && order.paymentStatus === 'pending' && (
                      <div className="pt-3 border-t border-[#D4B6A2]/10">
                        <p className="text-xs text-[#7E5A34]">
                          Customer will pay ₹{order.total.toLocaleString('en-IN')} on delivery
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card className={CardStyle}>
            <CardHeader className="border-b border-[#D4B6A2]/10 pb-4">
              <CardTitle className="font-serif text-xl text-[#4A1C1F]">Order Timeline</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#D4B6A2]/20">
                <div className="flex items-start space-x-4 relative z-10">
                  <div className="w-5 h-5 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center mt-0.5">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-[#4A1C1F]">Order Placed</p>
                    <p className="text-xs text-[#5C4638]">{formatDate(order.orderDate)}</p>
                  </div>
                </div>

                {currentStatus !== 'pending' && (
                  <div className="flex items-start space-x-4 relative z-10">
                    <div className="w-5 h-5 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center mt-0.5">
                      <Package className="w-3 h-3 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-[#4A1C1F]">Order Confirmed</p>
                      <p className="text-xs text-[#5C4638]">Processing your order</p>
                    </div>
                  </div>
                )}

                {['shipped', 'delivered'].includes(currentStatus) && (
                  <div className="flex items-start space-x-4 relative z-10">
                    <div className="w-5 h-5 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center mt-0.5">
                      <Truck className="w-3 h-3 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-[#4A1C1F]">Order Shipped</p>
                      <p className="text-xs text-[#5C4638]">
                        Tracking: {order.trackingNumber || 'Not available'}
                      </p>
                    </div>
                  </div>
                )}

                {currentStatus === 'delivered' && (
                  <div className="flex items-start space-x-4 relative z-10">
                    <div className="w-5 h-5 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-[#4A1C1F]">Order Delivered</p>
                      <p className="text-xs text-[#5C4638]">
                        {order.deliveryDate ? formatDate(order.deliveryDate) : 'Delivered'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Update Status */}
          <Card className={CardStyle}>
            <CardHeader className="border-b border-[#D4B6A2]/10 pb-4">
              <CardTitle className="font-serif text-lg text-[#4A1C1F]">Update Order Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Select value={currentStatus} onValueChange={updateOrderStatus}>
                <SelectTrigger className="w-full border-[#D4B6A2]/30 focus:border-[#B38B46] focus:ring-[#B38B46]/20 bg-[#F9F9F7] text-[#4A1C1F] rounded-none h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#D4B6A2]/20">
                  <SelectItem value="pending" className="cursor-pointer hover:bg-[#F9F9F7] text-[#5C4638]">Pending</SelectItem>
                  <SelectItem value="processing" className="cursor-pointer hover:bg-[#F9F9F7] text-[#5C4638]">Processing</SelectItem>
                  <SelectItem value="shipped" className="cursor-pointer hover:bg-[#F9F9F7] text-[#5C4638]">Shipped</SelectItem>
                  <SelectItem value="delivered" className="cursor-pointer hover:bg-[#F9F9F7] text-[#5C4638]">Delivered</SelectItem>
                  <SelectItem value="cancelled" className="cursor-pointer hover:bg-[#F9F9F7] text-red-600">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card className={CardStyle}>
            <CardHeader className="border-b border-[#D4B6A2]/10 pb-4">
              <CardTitle className="font-serif text-lg text-[#4A1C1F]">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#F5EFE7] flex items-center justify-center text-[#B38B46]">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-[#4A1C1F] text-sm">{order.customerName}</p>
                  <p className="text-xs text-[#7E5A34] uppercase tracking-wider">Customer</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#F5EFE7] flex items-center justify-center text-[#B38B46]">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-[#4A1C1F] text-sm break-all">{order.customerEmail}</p>
                  <p className="text-xs text-[#7E5A34] uppercase tracking-wider">Email</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#F5EFE7] flex items-center justify-center text-[#B38B46]">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-[#4A1C1F] text-sm">{order.customerPhone}</p>
                  <p className="text-xs text-[#7E5A34] uppercase tracking-wider">Phone</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card className={CardStyle}>
            <CardHeader className="border-b border-[#D4B6A2]/10 pb-4">
              <CardTitle className="font-serif text-lg text-[#4A1C1F]">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-[#B38B46] mt-1 shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium text-[#4A1C1F] font-serif">{order.customerName}</p>
                  <p className="text-sm text-[#5C4638] leading-relaxed">
                    {order.shippingAddress.street}<br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                  </p>
                  {order.shippingAddress.landmark && (
                    <p className="text-xs text-[#7E5A34] mt-1">
                      Landmark: {order.shippingAddress.landmark}
                    </p>
                  )}
                </div>
              </div>

              {/* Map Address Section */}
              {order.shippingAddress.mapAddress && (
                <div className="border-t border-[#D4B6A2]/10 pt-4 mt-2">
                  <h4 className="text-[#7E5A34] text-xs uppercase tracking-widest mb-2">Map Location</h4>
                  <div className="bg-[#F9F9F7] p-3 rounded border border-[#D4B6A2]/10">
                    <p className="text-xs text-[#5C4638] leading-relaxed">{order.shippingAddress.mapAddress}</p>
                    {order.shippingAddress.latitude && order.shippingAddress.longitude && (
                      <div className="mt-2 flex items-center space-x-4 text-[10px] text-[#7E5A34]">
                        <span>Lat: {order.shippingAddress.latitude.toFixed(6)}</span>
                        <span>Lng: {order.shippingAddress.longitude.toFixed(6)}</span>
                        <a
                          href={`https://www.google.com/maps?q=${order.shippingAddress.latitude},${order.shippingAddress.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#B38B46] hover:text-[#4A1C1F] underline ml-auto"
                        >
                          View Map
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card className={CardStyle}>
              <CardHeader className="border-b border-[#D4B6A2]/10 pb-4">
                <CardTitle className="font-serif text-lg text-[#4A1C1F]">Special Instructions</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-[#5C4638] italic">"{order.notes}"</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;