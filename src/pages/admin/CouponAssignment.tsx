import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Link, Unlink, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const CouponAssignment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [coupons, setCoupons] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchCoupons(), fetchProducts(), fetchAssignments()]);
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, images, stock_quantity')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('product_coupons')
        .select(`
          *,
          products(id, name, images),
          coupons(id, code, description)
        `);

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const assignCoupon = async (productId: string) => {
    if (!selectedCoupon) {
      toast({
        title: "No coupon selected",
        description: "Please select a coupon first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('product_coupons')
        .insert([{ product_id: productId, coupon_id: selectedCoupon }]);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already assigned",
            description: "This coupon is already assigned to this product.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Coupon assigned!",
        description: "Coupon has been assigned to the product successfully.",
      });

      fetchAssignments();
    } catch (error) {
      console.error('Error assigning coupon:', error);
      toast({
        title: "Error",
        description: "Failed to assign coupon.",
        variant: "destructive",
      });
    }
  };

  const unassignCoupon = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('product_coupons')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      toast({
        title: "Coupon unassigned",
        description: "Coupon has been removed from the product.",
      });

      fetchAssignments();
    } catch (error) {
      console.error('Error unassigning coupon:', error);
      toast({
        title: "Error",
        description: "Failed to unassign coupon.",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProductAssignments = (productId: string) => {
    return assignments.filter(assignment => assignment.product_id === productId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B38B46]"></div>
      </div>
    );
  }

  const CardStyle = "border border-[#D4B6A2]/20 shadow-sm bg-white hover:shadow-md transition-all duration-300";
  const LabelStyle = "text-[#7E5A34] text-xs uppercase tracking-widest font-medium";
  const InputStyle = "border-[#D4B6A2]/30 focus:border-[#B38B46] bg-[#F9F9F7] text-[#4A1C1F] rounded-none focus:ring-[#B38B46]/20";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-[#D4B6A2]/20 pb-6">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/coupons')}
            className="text-[#5C4638] hover:text-[#4A1C1F] hover:bg-[#F9F9F7] p-0 mb-2 h-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="uppercase tracking-widest text-xs">Back to Coupons</span>
          </Button>
          <h1 className="text-3xl font-serif text-[#4A1C1F] tracking-tight">Coupon Assignment</h1>
          <p className="text-[#5C4638] font-light text-sm tracking-wide">
            Assign coupons to specific products for targeted discounts
          </p>
        </div>
      </div>

      {/* Coupon Selection */}
      <Card className={CardStyle}>
        <CardHeader className="border-b border-[#D4B6A2]/10 pb-4">
          <CardTitle className="font-serif text-lg text-[#4A1C1F]">Select Coupon to Assign</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="coupon" className={LabelStyle}>Choose Coupon</Label>
              <Select value={selectedCoupon} onValueChange={setSelectedCoupon}>
                <SelectTrigger className="border-[#D4B6A2]/30 bg-[#F9F9F7] text-[#4A1C1F] rounded-none">
                  <SelectValue placeholder="Select a coupon to assign" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#D4B6A2]/20">
                  {coupons.map((coupon) => (
                    <SelectItem key={coupon.id} value={coupon.id} className="text-[#4A1C1F] focus:bg-[#F9F9F7]">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-[#B38B46]">{coupon.code}</span>
                        <span className="text-xs text-[#5C4638] uppercase tracking-wide">
                          ({coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`} off)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCoupon && (
              <div className="p-4 bg-[#F5EFE7]/50 border border-[#D4B6A2]/30 rounded-none animate-in fade-in">
                {(() => {
                  const coupon = coupons.find(c => c.id === selectedCoupon);
                  return coupon ? (
                    <div>
                      <h3 className="font-serif font-bold text-[#4A1C1F] text-lg">{coupon.code}</h3>
                      <p className="text-sm text-[#5C4638] italic">"{coupon.description}"</p>
                      <Badge className="mt-2 bg-[#4A1C1F] text-[#F5EFE7] rounded-none border-0 uppercase tracking-widest text-[10px]">
                        {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% discount` : `₹${coupon.discount_value} off`}
                        {coupon.min_order_amount && ` (Min order: ₹${coupon.min_order_amount})`}
                      </Badge>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Product Search and Assignment */}
      <Card className={CardStyle}>
        <CardHeader className="border-b border-[#D4B6A2]/10 pb-4">
          <CardTitle className="font-serif text-lg text-[#4A1C1F]">Assign to Products</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7E5A34] h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 ${InputStyle}`}
              />
            </div>

            {/* Products List */}
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
              {filteredProducts.map((product) => {
                const productAssignments = getProductAssignments(product.id);
                const isAssigned = productAssignments.some(a => a.coupon_id === selectedCoupon);

                return (
                  <div key={product.id} className="flex items-center justify-between p-4 border border-[#D4B6A2]/20 rounded-none bg-[#F9F9F7] hover:bg-white transition-colors group">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 border border-[#D4B6A2]/20 rounded-none overflow-hidden">
                        <img
                          src={product.images?.[0] || '/placeholder.svg'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-serif text-[#4A1C1F] font-medium text-sm">{product.name}</h3>
                        <p className="text-xs text-[#7E5A34] tracking-wide">₹{product.price}</p>
                        <p className="text-[10px] text-[#5C4638] uppercase tracking-wider">Stock: {product.stock_quantity}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Show assigned coupons */}
                      {productAssignments.length > 0 && (
                        <div className="flex flex-wrap gap-1 mr-2 justify-end max-w-[200px]">
                          {productAssignments.map((assignment) => (
                            <div key={assignment.id} className="flex items-center">
                              <Badge
                                variant="secondary"
                                className="text-[10px] flex items-center space-x-1 rounded-none bg-[#E5D8C6] text-[#4A1C1F] border border-[#D4B6A2]/30"
                              >
                                <span>{assignment.coupons?.code}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-3 w-3 p-0 hover:bg-transparent text-[#4A1C1F] hover:text-red-600"
                                  onClick={() => unassignCoupon(assignment.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Assign/Unassign button */}
                      {selectedCoupon && (
                        <Button
                          size="sm"
                          variant={isAssigned ? "destructive" : "default"}
                          onClick={() => {
                            if (isAssigned) {
                              const assignment = productAssignments.find(a => a.coupon_id === selectedCoupon);
                              if (assignment) {
                                unassignCoupon(assignment.id);
                              }
                            } else {
                              assignCoupon(product.id);
                            }
                          }}
                          disabled={!selectedCoupon}
                          className={`uppercase tracking-widest text-[10px] h-8 w-24 rounded-none ${isAssigned ? 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200' : 'bg-[#4A1C1F] text-white hover:bg-[#5C4638]'}`}
                        >
                          {isAssigned ? (
                            <>
                              <Unlink className="h-3 w-3 mr-1" />
                              Remove
                            </>
                          ) : (
                            <>
                              <Link className="h-3 w-3 mr-1" />
                              Assign
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-8 text-[#5C4638] bg-[#F9F9F7] border border-[#D4B6A2]/10 rounded-none">
                No products found matching your search.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assignment Summary */}
      <Card className={CardStyle}>
        <CardHeader className="border-b border-[#D4B6A2]/10 pb-4">
          <CardTitle className="font-serif text-lg text-[#4A1C1F]">Current Assignments ({assignments.length})</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between p-3 bg-[#F9F9F7] border border-[#D4B6A2]/10 rounded-none hover:border-[#D4B6A2]/30 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-none overflow-hidden border border-[#D4B6A2]/20">
                    <img
                      src={assignment.products?.images?.[0] || '/placeholder.svg'}
                      alt={assignment.products?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-serif text-[#4A1C1F] font-medium text-sm">{assignment.products?.name}</h4>
                    <Badge variant="outline" className="text-[10px] border-[#B38B46] text-[#B38B46] uppercase tracking-widest rounded-none">
                      {assignment.coupons?.code}
                    </Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => unassignCoupon(assignment.id)}
                  className="text-red-400 hover:text-red-600 hover:bg-[#F5EFE7]"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {assignments.length === 0 && (
            <div className="text-center py-8 text-[#5C4638] bg-[#F9F9F7] border border-[#D4B6A2]/10 rounded-none">
              No coupon assignments yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CouponAssignment;