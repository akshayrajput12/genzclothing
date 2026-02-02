import { useState, useEffect } from 'react';
import { Search, Users, Mail, Phone, MapPin, Calendar, Eye, Edit } from 'lucide-react';
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
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  joinDate: string;
  status: 'active' | 'inactive';
  avatar?: string;
}

const AdminCustomers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);

      // Fetch profiles with order statistics
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch orders to calculate statistics
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('user_id, total, created_at, customer_info');

      if (ordersError) throw ordersError;

      // Process customer data with order statistics
      const customersData: Customer[] = profiles?.map(profile => {
        // Get orders for this user (by user_id or email fallback)
        const userOrders = orders?.filter(order =>
          order.user_id === profile.id ||
          (order.customer_info as any)?.email === profile.email
        ) || [];

        const totalOrders = userOrders.length;
        const totalSpent = userOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        const lastOrder = userOrders.length > 0
          ? userOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
          : null;

        // Determine status based on recent activity (active if ordered in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const isActive = lastOrder ? new Date(lastOrder) > thirtyDaysAgo : false;

        return {
          id: profile.id,
          name: profile.full_name || 'Unknown User',
          email: profile.email,
          phone: profile.phone || 'Not provided',
          location: 'Not specified', // We don't have location in profiles, could be derived from addresses
          totalOrders,
          totalSpent,
          lastOrder: lastOrder ? new Date(lastOrder).toLocaleDateString('en-IN') : 'Never',
          joinDate: new Date(profile.created_at).toLocaleDateString('en-IN'),
          status: isActive ? 'active' : 'inactive'
        };
      }) || [];

      setCustomers(customersData);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch customers data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };



  const statuses = ['all', 'active', 'inactive'];

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    return status === 'active'
      ? 'bg-green-50 text-green-700 border-green-200'
      : 'bg-gray-100 text-gray-500 border-gray-200';
  };

  const customerStats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    inactive: customers.filter(c => c.status === 'inactive').length,
    totalRevenue: customers.reduce((sum, customer) => sum + customer.totalSpent, 0),
    avgOrderValue: customers.length > 0
      ? customers.reduce((sum, customer) => sum + customer.totalSpent, 0) / Math.max(customers.reduce((sum, customer) => sum + customer.totalOrders, 0), 1)
      : 0
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
          <h1 className="text-3xl md:text-4xl font-serif text-[#4A1C1F] mb-2 tracking-tight">Customers</h1>
          <p className="text-[#5C4638] font-light text-sm tracking-wide">Manage your customer relationships</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="border border-[#D4B6A2]/20 shadow-sm bg-white hover:shadow-md transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7E5A34]">Total Customers</CardTitle>
            <div className="p-2 bg-[#F5EFE7] rounded-full group-hover:bg-[#4A1C1F] transition-colors duration-300">
              <Users className="h-3 w-3 text-[#4A1C1F] group-hover:text-[#B38B46] transition-colors" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-serif text-[#4A1C1F]">{customerStats.total}</div>
          </CardContent>
        </Card>

        <Card className="border border-[#D4B6A2]/20 shadow-sm bg-white hover:shadow-md transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7E5A34]">Active</CardTitle>
            <div className="p-2 bg-[#F5EFE7] rounded-full group-hover:bg-[#4A1C1F] transition-colors duration-300">
              <Users className="h-3 w-3 text-[#4A1C1F] group-hover:text-[#B38B46] transition-colors" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-serif text-[#4A1C1F]">{customerStats.active}</div>
          </CardContent>
        </Card>

        <Card className="border border-[#D4B6A2]/20 shadow-sm bg-white hover:shadow-md transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7E5A34]">Inactive</CardTitle>
            <div className="p-2 bg-[#F5EFE7] rounded-full group-hover:bg-[#4A1C1F] transition-colors duration-300">
              <Users className="h-3 w-3 text-[#4A1C1F] group-hover:text-[#B38B46] transition-colors" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-serif text-[#4A1C1F]">{customerStats.inactive}</div>
          </CardContent>
        </Card>

        <Card className="border border-[#D4B6A2]/20 shadow-sm bg-white hover:shadow-md transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7E5A34]">Total Revenue</CardTitle>
            <div className="p-2 bg-[#F5EFE7] rounded-full group-hover:bg-[#4A1C1F] transition-colors duration-300">
              <Users className="h-3 w-3 text-[#4A1C1F] group-hover:text-[#B38B46] transition-colors" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-serif text-[#4A1C1F]">₹{customerStats.totalRevenue.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>

        <Card className="border border-[#D4B6A2]/20 shadow-sm bg-white hover:shadow-md transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7E5A34]">Avg Order Value</CardTitle>
            <div className="p-2 bg-[#F5EFE7] rounded-full group-hover:bg-[#4A1C1F] transition-colors duration-300">
              <Users className="h-3 w-3 text-[#4A1C1F] group-hover:text-[#B38B46] transition-colors" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-serif text-[#4A1C1F]">₹{Math.round(customerStats.avgOrderValue).toLocaleString('en-IN')}</div>
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
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-[#D4B6A2]/30 focus:border-[#B38B46] focus:ring-[#B38B46]/20 rounded-none bg-[#F9F9F7] text-[#4A1C1F]"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-[#D4B6A2]/30 rounded-none text-sm bg-white focus:outline-none focus:border-[#B38B46] text-[#4A1C1F] cursor-pointer min-w-[200px]"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Customers' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="border border-[#D4B6A2]/20 shadow-sm bg-white rounded-none">
        <CardHeader className="border-b border-[#D4B6A2]/10 pb-4">
          <CardTitle className="font-serif text-xl text-[#4A1C1F]">Customer List <span className="text-sm font-sans tracking-wide text-[#7E5A34] ml-2 font-normal">({filteredCustomers.length})</span></CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-[#D4B6A2]/20">
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Customer</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Contact</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Location</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Orders</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Total Spent</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Last Order</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Status</TableHead>
                <TableHead className="text-right text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-[#F9F9F7] border-[#D4B6A2]/10 transition-colors group">
                  <TableCell className="py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#F5EFE7] rounded-full flex items-center justify-center border border-[#D4B6A2]/30">
                        <span className="text-[#4A1C1F] text-sm font-serif font-bold">
                          {customer.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium font-serif text-[#4A1C1F]">{customer.name}</p>
                        <p className="text-xs text-[#5C4638]/70">{customer.id.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-xs text-[#5C4638]">
                        <Mail className="w-3 h-3 mr-2 text-[#B38B46]" />
                        {customer.email}
                      </div>
                      <div className="flex items-center text-xs text-[#5C4638]">
                        <Phone className="w-3 h-3 mr-2 text-[#B38B46]" />
                        {customer.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-[#5C4638]">
                      <MapPin className="w-3 h-3 mr-2 text-[#B38B46]" />
                      <span className="text-xs">{customer.location}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[#5C4638]">{customer.totalOrders}</TableCell>
                  <TableCell className="font-medium text-[#4A1C1F]">₹{customer.totalSpent.toLocaleString('en-IN')}</TableCell>
                  <TableCell>
                    <div className="flex items-center text-[#5C4638]">
                      <Calendar className="w-3 h-3 mr-2 text-[#B38B46]" />
                      <span className="text-xs">{customer.lastOrder}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`rounded-none px-3 py-1 text-[10px] uppercase tracking-widest font-normal hover:bg-opacity-80 border-0 ${getStatusColor(customer.status)}`}>
                      {customer.status}
                    </Badge>
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
                        <DropdownMenuItem className="rounded-none hover:bg-[#F9F9F7] cursor-pointer text-xs uppercase tracking-wider py-2 text-[#4A1C1F]">
                          <Eye className="mr-2 h-3.5 w-3.5 text-[#B38B46]" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-none hover:bg-[#F9F9F7] cursor-pointer text-xs uppercase tracking-wider py-2 text-[#4A1C1F]">
                          <Edit className="mr-2 h-3.5 w-3.5 text-[#B38B46]" />
                          Edit Customer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCustomers;