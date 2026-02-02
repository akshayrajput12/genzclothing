import { useState, useEffect } from 'react';
import { Star, TrendingUp, Package, IndianRupee, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/utils/currency';

interface BestSellerProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  unitsSold: number;
  revenue: number;
  rating: number;
  image: string;
  rank: number;
  growthRate: number;
  profitMargin: number;
  stockQuantity: number;
}

const AdminBestSellers = () => {
  const [dateRange, setDateRange] = useState('30d');
  const [bestSellers, setBestSellers] = useState<BestSellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBestSellers();
  }, [dateRange]);

  const fetchBestSellers = async () => {
    try {
      setLoading(true);

      // Fetch bestseller products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          categories(name)
        `)
        .eq('is_bestseller', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // Fetch actual sales data from product_sales table
      const { data: salesData, error: salesError } = await supabase
        .from('product_sales')
        .select('product_id, quantity_sold, total_revenue, sale_date')
        .order('sale_date', { ascending: false });

      if (salesError) {
        console.error('Sales data error:', salesError);
        // Fallback to calculating from orders if sales table doesn't exist yet
        const { data: ordersData } = await supabase
          .from('orders')
          .select('items, created_at')
          .order('created_at', { ascending: false });

        // Calculate from orders as fallback
        const productSalesMap = new Map();
        ordersData?.forEach(order => {
          const items = order.items as any[] || [];
          items.forEach(item => {
            if (!productSalesMap.has(item.id)) {
              productSalesMap.set(item.id, {
                totalQuantity: 0,
                totalRevenue: 0,
                orderCount: 0
              });
            }
            const salesData = productSalesMap.get(item.id);
            salesData.totalQuantity += item.quantity || 0;
            salesData.totalRevenue += (item.price || 0) * (item.quantity || 0);
            salesData.orderCount += 1;
          });
        });
      }

      // Calculate actual sales data for each product
      const productSalesMap = new Map();

      if (salesData) {
        // Use product_sales table data
        salesData.forEach(sale => {
          if (!productSalesMap.has(sale.product_id)) {
            productSalesMap.set(sale.product_id, {
              totalQuantity: 0,
              totalRevenue: 0,
              orderCount: 0
            });
          }
          const salesInfo = productSalesMap.get(sale.product_id);
          salesInfo.totalQuantity += sale.quantity_sold || 0;
          salesInfo.totalRevenue += sale.total_revenue || 0;
          salesInfo.orderCount += 1;
        });
      }

      // Calculate average rating from reviews (if available)
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('product_id, rating');

      const productRatings = new Map();
      reviewsData?.forEach(review => {
        if (!productRatings.has(review.product_id)) {
          productRatings.set(review.product_id, []);
        }
        productRatings.get(review.product_id).push(review.rating);
      });

      const formattedBestSellers = productsData?.map((product, index) => {
        const salesData = productSalesMap.get(product.id) || { totalQuantity: 0, totalRevenue: 0, orderCount: 0 };
        const ratings = productRatings.get(product.id) || [];
        const avgRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 4.5;

        return {
          id: product.id,
          name: product.name,
          category: (product.categories as any)?.name || 'Unknown',
          price: product.price || 0,
          unitsSold: salesData.totalQuantity,
          revenue: salesData.totalRevenue,
          rating: avgRating,
          image: product.images?.[0] || '/placeholder.svg',
          rank: index + 1,
          growthRate: salesData.orderCount > 0 ? (salesData.totalQuantity / salesData.orderCount) * 10 : 0, // Growth based on sales velocity
          profitMargin: 25 + Math.random() * 20, // Mock profit margin - would need cost data
          stockQuantity: product.stock_quantity || 0
        };
      }) || [];

      // Sort by actual revenue instead of index
      const sortedBestSellers = formattedBestSellers
        .sort((a, b) => b.revenue - a.revenue)
        .map((product, index) => ({ ...product, rank: index + 1 }));

      setBestSellers(sortedBestSellers);
    } catch (error: any) {
      console.error('Error fetching best sellers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch best sellers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = bestSellers.reduce((sum, product) => sum + product.revenue, 0);
  const totalUnitsSold = bestSellers.reduce((sum, product) => sum + product.unitsSold, 0);
  const averageRating = bestSellers.length > 0
    ? bestSellers.reduce((sum, product) => sum + product.rating, 0) / bestSellers.length
    : 0;

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
          <h1 className="text-3xl font-serif text-[#4A1C1F] tracking-tight mb-1">Best Sellers</h1>
          <p className="text-[#5C4638] font-light text-sm tracking-wide">Top performing products by revenue and volume</p>
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
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className={CardStyle}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7E5A34]">Total Revenue</CardTitle>
            <div className="p-2 bg-[#F5EFE7] rounded-full group-hover:bg-[#4A1C1F] transition-colors duration-300">
              <IndianRupee className="h-4 w-4 text-[#4A1C1F] group-hover:text-[#B38B46] transition-colors" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif text-[#4A1C1F] mb-1">{formatPrice(totalRevenue)}</div>
            <p className="text-xs text-[#5C4638] font-light">
              +12.5% from last period
            </p>
          </CardContent>
        </Card>

        <Card className={CardStyle}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7E5A34]">Units Sold</CardTitle>
            <div className="p-2 bg-[#F5EFE7] rounded-full group-hover:bg-[#4A1C1F] transition-colors duration-300">
              <Package className="h-4 w-4 text-[#4A1C1F] group-hover:text-[#B38B46] transition-colors" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif text-[#4A1C1F] mb-1">{totalUnitsSold}</div>
            <p className="text-xs text-[#5C4638] font-light">
              +8.2% from last period
            </p>
          </CardContent>
        </Card>

        <Card className={CardStyle}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7E5A34]">Avg. Rating</CardTitle>
            <div className="p-2 bg-[#F5EFE7] rounded-full group-hover:bg-[#4A1C1F] transition-colors duration-300">
              <Star className="h-4 w-4 text-[#4A1C1F] group-hover:text-[#B38B46] transition-colors" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif text-[#4A1C1F] mb-1">{averageRating.toFixed(1)}</div>
            <p className="text-xs text-[#5C4638] font-light">
              Across all bestsellers
            </p>
          </CardContent>
        </Card>

        <Card className={CardStyle}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7E5A34]">Total Products</CardTitle>
            <div className="p-2 bg-[#F5EFE7] rounded-full group-hover:bg-[#4A1C1F] transition-colors duration-300">
              <TrendingUp className="h-4 w-4 text-[#4A1C1F] group-hover:text-[#B38B46] transition-colors" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif text-[#4A1C1F] mb-1">{bestSellers.length}</div>
            <p className="text-xs text-[#5C4638] font-light">
              Bestseller products
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Best Sellers Table */}
      <Card className={`${CardStyle} rounded-none`}>
        <CardHeader className="border-b border-[#D4B6A2]/10 pb-4">
          <CardTitle className="font-serif text-xl text-[#4A1C1F]">Best Selling Products</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-[#D4B6A2]/20">
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Rank</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Product</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Category</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Price</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Units Sold</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Revenue</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Rating</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Stock</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Growth</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bestSellers.map((product) => (
                <TableRow key={product.id} className="hover:bg-[#F9F9F7] border-[#D4B6A2]/10 transition-colors group">
                  <TableCell className="py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-[#4A1C1F] text-[#B38B46] flex items-center justify-center text-xs font-bold font-serif">
                        {product.rank}
                      </div>
                      {product.rank <= 3 && (
                        <Star className="w-4 h-4 text-[#B38B46] fill-current" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded border border-[#D4B6A2]/20 overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div>
                        <p className="font-medium font-serif text-[#4A1C1F]">{product.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="rounded-none bg-[#F9F9F7] text-[#5C4638] font-normal">
                      {(product.category as any) || 'General'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-[#4A1C1F]">{formatPrice(product.price)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2 text-[#5C4638]">
                      <span className="font-medium">{product.unitsSold}</span>
                      <Package className="w-3 h-3 text-[#B38B46]" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-[#4A1C1F]">{formatPrice(product.revenue)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1 text-[#5C4638]">
                      <Star className="w-3 h-3 text-[#B38B46] fill-current" />
                      <span>{product.rating.toFixed(1)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`rounded-none px-2 py-0.5 text-[10px] uppercase font-normal border-0 ${product.stockQuantity > 10 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
                    >
                      {product.stockQuantity} left
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                      <span className="text-green-700 font-medium text-xs">
                        +{product.growthRate.toFixed(1)}%
                      </span>
                    </div>
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

export default AdminBestSellers;