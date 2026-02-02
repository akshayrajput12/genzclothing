import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Tag, Calendar, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { formatPrice } from '@/utils/currency';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Coupon {
  id: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  status: 'active' | 'inactive' | 'expired';
}

const AdminCoupons = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);

      const { data: couponsData, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedCoupons = couponsData?.map(coupon => ({
        id: coupon.id,
        code: coupon.code,
        description: coupon.description || '',
        type: coupon.discount_type === 'percentage' ? 'percentage' as const : 'fixed' as const,
        value: coupon.discount_value,
        minOrderValue: coupon.min_order_amount || 0,
        maxDiscountAmount: coupon.max_discount_amount,
        usageLimit: coupon.usage_limit || 0,
        usedCount: coupon.used_count || 0,
        validFrom: coupon.valid_from,
        validUntil: coupon.valid_until,
        status: !coupon.is_active ? 'inactive' as const :
          (coupon.valid_until && new Date(coupon.valid_until) < new Date()) ? 'expired' as const :
            'active' as const
      })) || [];

      setCoupons(formattedCoupons);
    } catch (error: any) {
      console.error('Error fetching coupons:', error);
      toast({
        title: "Error",
        description: "Failed to fetch coupons",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Coupon deleted successfully",
      });

      fetchCoupons();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coupon.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-500 border-gray-200';
      case 'expired':
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center border-b border-[#D4B6A2]/20 pb-6">
        <div>
          <h1 className="text-3xl font-serif text-[#4A1C1F] tracking-tight mb-1">Coupons</h1>
          <p className="text-[#5C4638] font-light text-sm tracking-wide">Manage discounts and seasonal offers</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => navigate('/admin/coupons/assign')}
            variant="outline"
            className="border-[#D4B6A2] text-[#5C4638] hover:bg-[#F9F9F7] text-xs uppercase tracking-widest rounded-none"
          >
            <Tag className="w-4 h-4 mr-2" />
            Assign Coupons
          </Button>
          <Button
            onClick={() => navigate('/admin/coupons/add')}
            className="bg-[#4A1C1F] hover:bg-[#5C4638] text-white uppercase tracking-widest text-xs rounded-none transition-all duration-300 shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Coupon
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border border-[#D4B6A2]/20 shadow-sm bg-white hover:shadow-md transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7E5A34]">Total Coupons</CardTitle>
            <div className="p-2 bg-[#F5EFE7] rounded-full group-hover:bg-[#4A1C1F] transition-colors duration-300">
              <Tag className="h-4 w-4 text-[#4A1C1F] group-hover:text-[#B38B46] transition-colors" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif text-[#4A1C1F]">{coupons.length}</div>
          </CardContent>
        </Card>

        <Card className="border border-[#D4B6A2]/20 shadow-sm bg-white hover:shadow-md transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7E5A34]">Active</CardTitle>
            <div className="p-2 bg-[#F5EFE7] rounded-full group-hover:bg-[#4A1C1F] transition-colors duration-300">
              <TrendingUp className="h-4 w-4 text-[#4A1C1F] group-hover:text-[#B38B46] transition-colors" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif text-[#4A1C1F]">
              {coupons.filter(c => c.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#D4B6A2]/20 shadow-sm bg-white hover:shadow-md transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7E5A34]">Total Uses</CardTitle>
            <div className="p-2 bg-[#F5EFE7] rounded-full group-hover:bg-[#4A1C1F] transition-colors duration-300">
              <Users className="h-4 w-4 text-[#4A1C1F] group-hover:text-[#B38B46] transition-colors" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif text-[#4A1C1F]">
              {coupons.reduce((sum, c) => sum + c.usedCount, 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#D4B6A2]/20 shadow-sm bg-white hover:shadow-md transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7E5A34]">Expired</CardTitle>
            <div className="p-2 bg-[#F5EFE7] rounded-full group-hover:bg-[#4A1C1F] transition-colors duration-300">
              <Calendar className="h-4 w-4 text-[#4A1C1F] group-hover:text-[#B38B46] transition-colors" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif text-[#4A1C1F]">
              {coupons.filter(c => c.status === 'expired').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border border-[#D4B6A2]/20 shadow-sm bg-white rounded-none">
        <CardContent className="p-6">
          <Input
            placeholder="Search coupons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm border-[#D4B6A2]/30 focus:border-[#B38B46] focus:ring-[#B38B46]/20 bg-[#F9F9F7] text-[#4A1C1F] rounded-none"
          />
        </CardContent>
      </Card>

      {/* Coupons Table */}
      <Card className="border border-[#D4B6A2]/20 shadow-sm bg-white rounded-none">
        <CardHeader className="border-b border-[#D4B6A2]/10 pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="font-serif text-xl text-[#4A1C1F]">Coupons List</CardTitle>
            <span className="text-xs text-[#7E5A34] uppercase tracking-widest">{filteredCoupons.length} records</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-[#D4B6A2]/20">
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Code</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Description</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Type</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Value</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Usage</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Valid Until</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Status</TableHead>
                <TableHead className="text-right text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCoupons.map((coupon) => (
                <TableRow key={coupon.id} className="hover:bg-[#F9F9F7] border-[#D4B6A2]/10 transition-colors group">
                  <TableCell className="py-4">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="font-mono text-xs border-[#D4B6A2]/30 text-[#4A1C1F] bg-[#F5EFE7]">
                        {coupon.code}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-[#5C4638] max-w-xs truncate font-light">
                      {coupon.description}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="rounded-none bg-[#F9F9F7] text-[#5C4638] font-normal hover:bg-[#F0F0F0]">
                      {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-[#5C4638]">
                      <p>Min: {formatPrice(coupon.minOrderValue)}</p>
                      {coupon.maxDiscountAmount && (
                        <p className="text-[#B38B46]">Max: {formatPrice(coupon.maxDiscountAmount)}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-[#5C4638] w-24">
                      <div className="flex justify-between mb-1">
                        <span>{coupon.usedCount}</span>
                        <span>{coupon.usageLimit || '∞'}</span>
                      </div>
                      <div className="w-full bg-[#F5EFE7] rounded-full h-1">
                        <div
                          className="bg-[#B38B46] h-1 rounded-full"
                          style={{
                            width: coupon.usageLimit ? `${(coupon.usedCount / coupon.usageLimit) * 100}%` : '0%'
                          }}
                        ></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-[#5C4638] font-light">
                    {coupon.validUntil ? format(new Date(coupon.validUntil), 'MMM dd, yyyy') : 'No expiry'}
                  </TableCell>
                  <TableCell>
                    <Badge className={`rounded-none px-3 py-1 text-[10px] uppercase tracking-widest font-normal hover:bg-opacity-80 border-0 ${getStatusColor(coupon.status)}`}>
                      {coupon.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/coupons/edit/${coupon.id}`)}
                        className="text-[#7E5A34] hover:text-[#4A1C1F] hover:bg-[#F9F9F7]"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(coupon.id)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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

export default AdminCoupons;