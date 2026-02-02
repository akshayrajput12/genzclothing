import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  ShoppingCart,
  IndianRupee,
  Calendar,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/utils/currency';

const AdminAnalytics = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    revenue: { current: 0, previous: 0, growth: 0, trend: 'up' as 'up' | 'down' },
    orders: { current: 0, previous: 0, growth: 0, trend: 'up' as 'up' | 'down' },
    customers: { current: 0, previous: 0, growth: 0, trend: 'up' as 'up' | 'down' },
    avgOrderValue: { current: 0, previous: 0, growth: 0, trend: 'up' as 'up' | 'down' }
  });
  const [topCategories, setTopCategories] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Calculate date ranges
      const now = new Date();
      const daysBack = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const currentPeriodStart = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
      const previousPeriodStart = new Date(currentPeriodStart.getTime() - (daysBack * 24 * 60 * 60 * 1000));

      // Fetch all orders
      const { data: allOrders, error: ordersError } = await supabase
        .from('orders')
        .select('total, created_at, customer_info, items, user_id')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, created_at, full_name, email');

      if (profilesError) throw profilesError;

      // Filter orders by date periods
      const currentPeriodOrders = allOrders?.filter(order =>
        new Date(order.created_at) >= currentPeriodStart
      ) || [];

      const previousPeriodOrders = allOrders?.filter(order =>
        new Date(order.created_at) >= previousPeriodStart &&
        new Date(order.created_at) < currentPeriodStart
      ) || [];

      // Calculate current period metrics
      const currentRevenue = currentPeriodOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const currentOrderCount = currentPeriodOrders.length;
      const currentCustomers = profiles?.filter(profile =>
        new Date(profile.created_at) >= currentPeriodStart
      ).length || 0;
      const currentAvgOrderValue = currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0;

      // Calculate previous period metrics
      const previousRevenue = previousPeriodOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const previousOrderCount = previousPeriodOrders.length;
      const previousCustomers = profiles?.filter(profile =>
        new Date(profile.created_at) >= previousPeriodStart &&
        new Date(profile.created_at) < currentPeriodStart
      ).length || 0;
      const previousAvgOrderValue = previousOrderCount > 0 ? previousRevenue / previousOrderCount : 0;

      // Calculate growth percentages
      const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
      const ordersGrowth = previousOrderCount > 0 ? ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100 : 0;
      const customersGrowth = previousCustomers > 0 ? ((currentCustomers - previousCustomers) / previousCustomers) * 100 : 0;
      const avgOrderValueGrowth = previousAvgOrderValue > 0 ? ((currentAvgOrderValue - previousAvgOrderValue) / previousAvgOrderValue) * 100 : 0;

      setAnalyticsData({
        revenue: {
          current: currentRevenue,
          previous: previousRevenue,
          growth: revenueGrowth,
          trend: currentRevenue >= previousRevenue ? 'up' : 'down'
        },
        orders: {
          current: currentOrderCount,
          previous: previousOrderCount,
          growth: ordersGrowth,
          trend: currentOrderCount >= previousOrderCount ? 'up' : 'down'
        },
        customers: {
          current: currentCustomers,
          previous: previousCustomers,
          growth: customersGrowth,
          trend: currentCustomers >= previousCustomers ? 'up' : 'down'
        },
        avgOrderValue: {
          current: currentAvgOrderValue,
          previous: previousAvgOrderValue,
          growth: avgOrderValueGrowth,
          trend: currentAvgOrderValue >= previousAvgOrderValue ? 'up' : 'down'
        }
      });

      // Calculate real category performance from sales data
      try {
        // Try to use product_sales table with product categories
        const { data: salesWithCategories, error: salesError } = await supabase
          .from('product_sales')
          .select(`
            quantity_sold,
            total_revenue,
            sale_date,
            products (
              categories (
                name
              )
            )
          `)
          .gte('sale_date', currentPeriodStart.toISOString())
          .order('sale_date', { ascending: false });

        const categoryStats = new Map();

        if (salesWithCategories && !salesError) {
          // Use sales tracking data
          salesWithCategories.forEach(sale => {
            const categoryName = (sale.products as any)?.categories?.name || 'General Items';

            if (!categoryStats.has(categoryName)) {
              categoryStats.set(categoryName, { revenue: 0, orders: 0, items: 0 });
            }
            const stats = categoryStats.get(categoryName);
            stats.revenue += sale.total_revenue || 0;
            stats.orders += 1;
            stats.items += sale.quantity_sold || 0;
          });
        } else {
          // Fallback to calculating from orders
          currentPeriodOrders.forEach(order => {
            const items = order.items as any[] || [];
            items.forEach(item => {
              // Try to get proper category name
              let category = 'General Items';
              if (item.category && item.category !== 'bulk' && item.category !== 'meat') {
                category = item.category;
              } else {
                // Map old categories to new ones
                if (item.category === 'meat' || item.category === 'bulk') {
                  category = 'Bulk Groceries';
                } else if (item.category) {
                  category = item.category;
                }
              }

              if (!categoryStats.has(category)) {
                categoryStats.set(category, { revenue: 0, orders: 0, items: 0 });
              }
              const stats = categoryStats.get(category);
              stats.revenue += (item.price * item.quantity) || 0;
              stats.orders += 1;
              stats.items += item.quantity || 0;
            });
          });
        }

        // Calculate growth by comparing with previous period
        const previousPeriodSales = await supabase
          .from('product_sales')
          .select(`
            total_revenue,
            products (
              categories (
                name
              )
            )
          `)
          .gte('sale_date', previousPeriodStart.toISOString())
          .lt('sale_date', currentPeriodStart.toISOString());

        const previousCategoryStats = new Map();
        if (previousPeriodSales.data) {
          previousPeriodSales.data.forEach(sale => {
            const categoryName = (sale.products as any)?.categories?.name || 'General Items';
            if (!previousCategoryStats.has(categoryName)) {
              previousCategoryStats.set(categoryName, 0);
            }
            previousCategoryStats.set(categoryName,
              previousCategoryStats.get(categoryName) + (sale.total_revenue || 0)
            );
          });
        }

        const formattedCategories = Array.from(categoryStats.entries())
          .map(([name, stats]: [string, any]) => {
            const previousRevenue = previousCategoryStats.get(name) || 0;
            const growth = previousRevenue > 0 ? ((stats.revenue - previousRevenue) / previousRevenue) * 100 : 0;

            return {
              name,
              revenue: stats.revenue,
              orders: stats.orders,
              growth: growth
            };
          })
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        setTopCategories(formattedCategories);
      } catch (error) {
        console.error('Error calculating category performance:', error);
        setTopCategories([]);
      }

      // Calculate real top customers from orders
      const customerStats = new Map();
      currentPeriodOrders.forEach(order => {
        const customerId = order.user_id || (order.customer_info as any)?.email || 'guest';

        // Try to get customer name from multiple sources
        let customerName = 'Guest Customer';
        if (order.user_id) {
          // Try to find in profiles first
          const profile = profiles?.find(p => p.id === order.user_id);
          customerName = profile?.full_name || profile?.email || 'Registered User';
        } else if (order.customer_info) {
          // Fallback to customer_info
          const customerInfo = order.customer_info as any;
          customerName = customerInfo?.name || customerInfo?.full_name || customerInfo?.email || 'Guest Customer';
        }

        if (!customerStats.has(customerId)) {
          customerStats.set(customerId, {
            name: customerName,
            orders: 0,
            totalSpent: 0
          });
        }
        const stats = customerStats.get(customerId);
        stats.orders += 1;
        stats.totalSpent += order.total || 0;
      });

      const formattedCustomers = Array.from(customerStats.values())
        .map((customer: any) => ({
          ...customer,
          avgOrderValue: customer.orders > 0 ? customer.totalSpent / customer.orders : 0
        }))
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5);

      setTopCustomers(formattedCustomers);

    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B38B46]"></div>
      </div>
    );
  }

  const CardStyle = "border border-[#D4B6A2]/20 shadow-sm bg-white hover:shadow-md transition-all duration-300 group";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center border-b border-[#D4B6A2]/20 pb-6">
        <div>
          <h1 className="text-3xl font-serif text-[#4A1C1F] tracking-tight mb-1">Analytics</h1>
          <p className="text-[#5C4638] font-light text-sm tracking-wide">Insights into your business performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-[#D4B6A2]/30 bg-white text-[#4A1C1F] text-xs uppercase tracking-widest rounded-none focus:outline-none focus:border-[#B38B46]"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button variant="outline" size="sm" className="border-[#D4B6A2] text-[#5C4638] hover:bg-[#F9F9F7] text-xs uppercase tracking-widest rounded-none">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className={CardStyle}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7E5A34]">Total Revenue</CardTitle>
            <div className="p-2 bg-[#F5EFE7] rounded-full group-hover:bg-[#4A1C1F] transition-colors duration-300">
              <IndianRupee className="h-4 w-4 text-[#4A1C1F] group-hover:text-[#B38B46] transition-colors" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif text-[#4A1C1F] mb-1">{formatPrice(analyticsData.revenue.current)}</div>
            <div className="flex items-center text-xs">
              {analyticsData.revenue.trend === 'up' ? (
                <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-600 mr-1" />
              )}
              <span className={analyticsData.revenue.trend === 'up' ? 'text-green-700' : 'text-red-700'}>
                {analyticsData.revenue.growth.toFixed(1)}%
              </span>
              <span className="text-[#5C4638] font-light ml-1">vs prev period</span>
            </div>
          </CardContent>
        </Card>

        <Card className={CardStyle}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7E5A34]">Total Orders</CardTitle>
            <div className="p-2 bg-[#F5EFE7] rounded-full group-hover:bg-[#4A1C1F] transition-colors duration-300">
              <ShoppingCart className="h-4 w-4 text-[#4A1C1F] group-hover:text-[#B38B46] transition-colors" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif text-[#4A1C1F] mb-1">{analyticsData.orders.current}</div>
            <div className="flex items-center text-xs">
              {analyticsData.orders.trend === 'up' ? (
                <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-600 mr-1" />
              )}
              <span className={analyticsData.orders.trend === 'up' ? 'text-green-700' : 'text-red-700'}>
                {analyticsData.orders.growth.toFixed(1)}%
              </span>
              <span className="text-[#5C4638] font-light ml-1">vs prev period</span>
            </div>
          </CardContent>
        </Card>

        <Card className={CardStyle}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7E5A34]">New Customers</CardTitle>
            <div className="p-2 bg-[#F5EFE7] rounded-full group-hover:bg-[#4A1C1F] transition-colors duration-300">
              <Users className="h-4 w-4 text-[#4A1C1F] group-hover:text-[#B38B46] transition-colors" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif text-[#4A1C1F] mb-1">{analyticsData.customers.current}</div>
            <div className="flex items-center text-xs">
              {analyticsData.customers.trend === 'up' ? (
                <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-600 mr-1" />
              )}
              <span className={analyticsData.customers.trend === 'up' ? 'text-green-700' : 'text-red-700'}>
                {analyticsData.customers.growth.toFixed(1)}%
              </span>
              <span className="text-[#5C4638] font-light ml-1">vs prev period</span>
            </div>
          </CardContent>
        </Card>

        <Card className={CardStyle}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7E5A34]">Avg. Order Value</CardTitle>
            <div className="p-2 bg-[#F5EFE7] rounded-full group-hover:bg-[#4A1C1F] transition-colors duration-300">
              <BarChart3 className="h-4 w-4 text-[#4A1C1F] group-hover:text-[#B38B46] transition-colors" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif text-[#4A1C1F] mb-1">{formatPrice(analyticsData.avgOrderValue.current)}</div>
            <div className="flex items-center text-xs">
              {analyticsData.avgOrderValue.trend === 'up' ? (
                <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-600 mr-1" />
              )}
              <span className={analyticsData.avgOrderValue.trend === 'up' ? 'text-green-700' : 'text-red-700'}>
                {analyticsData.avgOrderValue.growth.toFixed(1)}%
              </span>
              <span className="text-[#5C4638] font-light ml-1">vs prev period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList className="bg-[#F5EFE7] p-1 border border-[#D4B6A2]/20 rounded-none w-auto inline-flex">
          <TabsTrigger value="categories" className="data-[state=active]:bg-[#4A1C1F] data-[state=active]:text-white uppercase tracking-wider text-[10px] rounded-none transition-all px-6">Top Categories</TabsTrigger>
          <TabsTrigger value="customers" className="data-[state=active]:bg-[#4A1C1F] data-[state=active]:text-white uppercase tracking-wider text-[10px] rounded-none transition-all px-6">Top Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <Card className={`${CardStyle} rounded-none`}>
            <CardHeader className="border-b border-[#D4B6A2]/10 pb-4">
              <CardTitle className="font-serif text-xl text-[#4A1C1F]">Top Performing Categories</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {topCategories.map((category: any, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-[#D4B6A2]/10 rounded bg-[#F9F9F7] hover:bg-white transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-[#4A1C1F] rounded-full flex items-center justify-center text-[#B38B46] text-sm font-bold font-serif">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-[#4A1C1F] font-serif">{category.name}</p>
                        <p className="text-xs text-[#7E5A34] uppercase tracking-wider">{category.orders} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-[#4A1C1F]">{formatPrice(category.revenue)}</p>
                      <p className="text-xs text-green-700">+{category.growth.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <Card className={`${CardStyle} rounded-none`}>
            <CardHeader className="border-b border-[#D4B6A2]/10 pb-4">
              <CardTitle className="font-serif text-xl text-[#4A1C1F]">Top Customers</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {topCustomers.map((customer: any, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-[#D4B6A2]/10 rounded bg-[#F9F9F7] hover:bg-white transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-[#F5EFE7] border border-[#D4B6A2]/30 rounded-full flex items-center justify-center text-[#4A1C1F] text-sm font-bold font-serif">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-[#4A1C1F] font-serif">{customer.name}</p>
                        <p className="text-xs text-[#7E5A34] uppercase tracking-wider">{customer.orders} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-[#4A1C1F]">{formatPrice(customer.totalSpent)}</p>
                      <p className="text-xs text-[#5C4638] font-light">Avg: {formatPrice(customer.avgOrderValue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;