import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, Edit, Package, MapPin, Calendar, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/utils/currency';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'placed';
  paymentStatus: 'pending' | 'paid' | 'failed';
  address: string;
  orderDate: string;
  deliveryDate?: string;
  selectedSize?: string;
}

const AdminOrders = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  // Pagination & Filtering State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      // Fetch orders and profiles for customer name resolution
      const [ordersResult, profilesResult] = await Promise.all([
        supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('id, full_name, email, phone')
      ]);

      if (ordersResult.error) throw ordersResult.error;
      if (profilesResult.error) throw profilesResult.error;

      const profiles = profilesResult.data || [];
      const formattedOrders = ordersResult.data?.map(order => {
        // Enhanced customer name resolution
        let customerName = 'Guest Customer';
        let customerEmail = 'No email';
        let customerPhone = '';

        if (order.user_id) {
          // Try to find in profiles first
          const profile = profiles.find(p => p.id === order.user_id);
          if (profile) {
            customerName = profile.full_name || profile.email || 'Registered User';
            customerEmail = profile.email || '';
            customerPhone = profile.phone || '';
          }
        }

        // Fallback to customer_info if profile data is incomplete
        if (order.customer_info) {
          const customerInfo = order.customer_info as any;
          if (!customerName || customerName === 'Guest Customer') {
            customerName = customerInfo?.name || customerInfo?.full_name || customerName;
          }
          if (!customerEmail || customerEmail === 'No email') {
            customerEmail = customerInfo?.email || customerEmail;
          }
          if (!customerPhone) {
            customerPhone = customerInfo?.phone || '';
          }
        }

        return {
          id: order.id,
          orderNumber: order.order_number,
          customerName,
          customerEmail,
          items: Array.isArray(order.items) ? order.items.length : 0,
          total: order.total || 0,
          status: (order.order_status as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'placed') || 'pending',
          paymentStatus: (order.payment_status as 'pending' | 'paid' | 'failed') || 'pending',
          address: (order.address_details as any)?.complete_address ||
            `${(order.address_details as any)?.plotNumber || ''} ${(order.address_details as any)?.street || ''}, ${(order.address_details as any)?.city || ''}`.trim() ||
            'Address not provided',
          orderDate: new Date(order.created_at).toLocaleDateString(),
          deliveryDate: order.actual_delivery ? new Date(order.actual_delivery).toLocaleDateString() : undefined,
          selectedSize: (order as any).selected_size
        };
      }) || [];

      setOrders(formattedOrders);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (orderId: string, orderNumber: string) => {
    try {
      setDeletingOrderId(orderId);

      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;

      // Remove the order from the local state
      setOrders(orders.filter(order => order.id !== orderId));

      toast({
        title: "Order Deleted",
        description: `Order #${orderNumber} has been deleted successfully.`,
      });
    } catch (error: any) {
      console.error('Error deleting order:', error);
      toast({
        title: "Error",
        description: "Failed to delete order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingOrderId(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;

    // Date Filtering
    let matchesDate = true;
    if (dateStart || dateEnd) {
      const oDate = new Date(order.orderDate);
      if (dateStart) {
        const start = new Date(dateStart);
        if (oDate < start) matchesDate = false;
      }
      if (dateEnd) {
        const end = new Date(dateEnd);
        end.setHours(23, 59, 59); // End of day
        if (oDate > end) matchesDate = false;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'shipped':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'pending':
      case 'placed':
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
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B38B46]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center border-b border-[#D4B6A2]/20 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-[#4A1C1F] mb-2 tracking-tight">Orders</h1>
          <p className="text-[#5C4638] font-light text-sm tracking-wide">Manage customer orders and shipments</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border border-[#D4B6A2]/20 shadow-sm bg-white hover:shadow-md transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7E5A34]">Total Orders</CardTitle>
            <div className="p-2 bg-[#F5EFE7] rounded-full group-hover:bg-[#4A1C1F] transition-colors duration-300">
              <Package className="h-4 w-4 text-[#4A1C1F] group-hover:text-[#B38B46] transition-colors" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif text-[#4A1C1F]">{orders.length}</div>
          </CardContent>
        </Card>

        <Card className="border border-[#D4B6A2]/20 shadow-sm bg-white hover:shadow-md transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7E5A34]">Pending</CardTitle>
            <div className="p-2 bg-[#F5EFE7] rounded-full group-hover:bg-[#4A1C1F] transition-colors duration-300">
              <Calendar className="h-4 w-4 text-[#4A1C1F] group-hover:text-[#B38B46] transition-colors" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif text-[#4A1C1F]">
              {orders.filter(o => o.status === 'pending' || o.status === 'placed').length}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#D4B6A2]/20 shadow-sm bg-white hover:shadow-md transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7E5A34]">Processing</CardTitle>
            <div className="p-2 bg-[#F5EFE7] rounded-full group-hover:bg-[#4A1C1F] transition-colors duration-300">
              <Package className="h-4 w-4 text-[#4A1C1F] group-hover:text-[#B38B46] transition-colors" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif text-[#4A1C1F]">
              {orders.filter(o => o.status === 'processing').length}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#D4B6A2]/20 shadow-sm bg-white hover:shadow-md transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7E5A34]">Delivered</CardTitle>
            <div className="p-2 bg-[#F5EFE7] rounded-full group-hover:bg-[#4A1C1F] transition-colors duration-300">
              <Package className="h-4 w-4 text-[#4A1C1F] group-hover:text-[#B38B46] transition-colors" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif text-[#4A1C1F]">
              {orders.filter(o => o.status === 'delivered').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border border-[#D4B6A2]/20 shadow-sm bg-white rounded-none">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-[#7E5A34]" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-[#D4B6A2]/30 focus:border-[#B38B46] focus:ring-[#B38B46]/20 bg-[#F9F9F7] text-[#4A1C1F]"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[#7E5A34]">From</label>
                  <Input
                    type="date"
                    value={dateStart}
                    onChange={(e) => setDateStart(e.target.value)}
                    className="h-9 border-[#D4B6A2]/30 rounded-none text-xs bg-[#F9F9F7]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[#7E5A34]">To</label>
                  <Input
                    type="date"
                    value={dateEnd}
                    onChange={(e) => setDateEnd(e.target.value)}
                    className="h-9 border-[#D4B6A2]/30 rounded-none text-xs bg-[#F9F9F7]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {(dateStart || dateEnd) && (
                  <Button
                    variant="ghost"
                    onClick={() => { setDateStart(''); setDateEnd(''); }}
                    className="mt-5 h-9 text-[#B38B46] hover:text-[#4A1C1F] hover:bg-transparent text-xs uppercase"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-[#D4B6A2]/30 text-sm bg-white focus:outline-none focus:border-[#B38B46] text-[#4A1C1F] cursor-pointer min-w-[160px]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border border-[#D4B6A2]/20 shadow-sm bg-white rounded-none">
        <CardHeader className="border-b border-[#D4B6A2]/10 pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="font-serif text-xl text-[#4A1C1F]">Orders List</CardTitle>
            <span className="text-xs text-[#7E5A34] uppercase tracking-widest">{filteredOrders.length} records</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-[#D4B6A2]/20">
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Order</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Customer</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Items</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Size</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Total</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Status</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Payment</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Date</TableHead>
                <TableHead className="text-right text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-[#F9F9F7] border-[#D4B6A2]/10 transition-colors group">
                    <TableCell className="py-4">
                      <div>
                        <p className="font-medium font-serif text-[#4A1C1F] text-lg">{order.orderNumber}</p>
                        <p className="text-xs text-[#5C4638] flex items-center mt-1 font-light truncate max-w-[200px]">
                          <MapPin className="w-3 h-3 mr-1 shrink-0 text-[#B38B46]" />
                          {order.address}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-[#4A1C1F] text-sm">{order.customerName}</p>
                        <p className="text-xs text-[#5C4638] font-light">{order.customerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-none border-[#D4B6A2]/30 text-[#5C4638] font-normal">
                        {order.items} items
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-[#5C4638] font-medium">
                        {order.selectedSize || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-[#4A1C1F]">{formatPrice(order.total)}</TableCell>
                    <TableCell>
                      <Badge className={`rounded-none px-3 py-1 text-[10px] uppercase tracking-widest font-normal hover:bg-opacity-80 border-0 ${getStatusColor(order.status)}`}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`rounded-none px-3 py-1 text-[10px] uppercase tracking-widest font-normal hover:bg-opacity-80 border-0 ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-[#5C4638] font-light">
                        <p>{order.orderDate}</p>
                        {order.deliveryDate && (
                          <p className="text-green-700 mt-1">Delivered: {order.deliveryDate}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-[#F9F9F7] rounded-none data-[state=open]:bg-[#F9F9F7] text-[#5C4638]">
                            <span className="sr-only">Open menu</span>
                            <span className="text-xl leading-none mb-2">...</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-none border-[#D4B6A2]/30 shadow-lg bg-white p-1 min-w-[140px]">
                          <DropdownMenuItem
                            onClick={() => navigate(`/admin/orders/${order.id}`)}
                            className="rounded-none hover:bg-[#F9F9F7] cursor-pointer text-xs uppercase tracking-wider py-2 text-[#4A1C1F]"
                          >
                            <Eye className="mr-2 h-3.5 w-3.5 text-[#B38B46]" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-none hover:bg-[#F9F9F7] cursor-pointer text-xs uppercase tracking-wider py-2 text-[#4A1C1F]">
                            <Edit className="mr-2 h-3.5 w-3.5 text-[#B38B46]" />
                            Update Status
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-[#D4B6A2]/20 my-1" />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                className="rounded-none hover:bg-red-50 text-red-600 cursor-pointer text-xs uppercase tracking-wider py-2 focus:bg-red-50 focus:text-red-700"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                Delete Order
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-none border-[#D4B6A2]/20 font-sans bg-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="font-serif text-[#4A1C1F]">Delete Order</AlertDialogTitle>
                                <AlertDialogDescription className="text-[#5C4638]">
                                  Are you sure you want to delete order #{order.orderNumber}?
                                  This action cannot be undone and will permanently remove the order
                                  and all associated data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-none border-[#D4B6A2]/30 uppercase tracking-wider text-xs text-[#5C4638]">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteOrder(order.id, order.orderNumber)}
                                  className="bg-red-700 hover:bg-red-800 rounded-none uppercase tracking-wider text-xs"
                                  disabled={deletingOrderId === order.id}
                                >
                                  {deletingOrderId === order.id ? 'Deleting...' : 'Delete Order'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-[#5C4638]">
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-between items-center bg-white p-4 border border-[#D4B6A2]/20 shadow-sm">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="rounded-none border-[#D4B6A2]/30 text-[#5C4638] hover:text-[#4A1C1F] hover:bg-[#F9F9F7] uppercase tracking-widest text-xs"
          >
            Previous
          </Button>
          <span className="text-xs text-[#7E5A34] uppercase tracking-widest">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="rounded-none border-[#D4B6A2]/30 text-[#5C4638] hover:text-[#4A1C1F] hover:bg-[#F9F9F7] uppercase tracking-widest text-xs"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;