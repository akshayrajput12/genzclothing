import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, CalendarIcon } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface CouponFormProps {
  coupon?: any;
  isEdit?: boolean;
}

const CouponForm = ({ coupon: propCoupon, isEdit = false }: CouponFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    min_order_amount: 0,
    max_discount_amount: 0,
    usage_limit: 0,
    used_count: 0,
    valid_from: new Date(),
    valid_until: new Date(),
    is_active: true
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id && isEdit) {
      fetchCoupon();
    }
  }, [id, isEdit]);

  const fetchCoupon = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setFormData({
        ...data,
        valid_from: new Date(data.valid_from),
        valid_until: new Date(data.valid_until)
      });
    } catch (error) {
      console.error('Error fetching coupon:', error);
      toast({
        title: "Error",
        description: "Failed to fetch coupon details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateCouponCode = () => {
    const prefix = formData.discount_type === 'percentage' ? 'SAVE' : 'GET';
    const value = formData.discount_value || 10;
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}${value}${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.description || !formData.discount_value) {
      toast({
        title: "Missing required fields",
        description: "Please fill in code, description, and discount value.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const couponData = {
        code: formData.code,
        description: formData.description,
        discount_type: formData.discount_type,
        discount_value: Number(formData.discount_value),
        min_order_amount: Number(formData.min_order_amount) || 0,
        max_discount_amount: Number(formData.max_discount_amount) || null,
        usage_limit: Number(formData.usage_limit) || null,
        used_count: Number(formData.used_count) || 0,
        valid_from: formData.valid_from.toISOString(),
        valid_until: formData.valid_until.toISOString(),
        is_active: formData.is_active
      };

      if (isEdit && id) {
        const { error } = await supabase
          .from('coupons')
          .update(couponData)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('coupons')
          .insert(couponData);

        if (error) throw error;
      }

      toast({
        title: isEdit ? "Coupon updated!" : "Coupon created!",
        description: `Coupon ${formData.code} has been ${isEdit ? 'updated' : 'added'} successfully.`,
      });

      navigate('/admin/coupons');
    } catch (error) {
      console.error('Error saving coupon:', error);
      toast({
        title: "Error",
        description: "Failed to save coupon. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-serif text-[#4A1C1F] tracking-tight">
            {isEdit ? 'Edit Coupon' : 'Add New Coupon'}
          </h1>
          <p className="text-[#5C4638] font-light text-sm tracking-wide">
            {isEdit ? 'Modify existing coupon details' : 'Create a new discount code'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className={CardStyle}>
            <CardHeader className="border-b border-[#D4B6A2]/10 pb-4">
              <CardTitle className="font-serif text-lg text-[#4A1C1F]">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code" className={LabelStyle}>Coupon Code *</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      required
                      className={InputStyle}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleInputChange('code', generateCouponCode())}
                      className="border-[#D4B6A2] text-[#B38B46] hover:bg-[#F9F9F7] uppercase tracking-widest text-xs rounded-none"
                    >
                      Generate
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount_type" className={LabelStyle}>Discount Type *</Label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(value) => handleInputChange('discount_type', value)}
                  >
                    <SelectTrigger className="border-[#D4B6A2]/30 bg-[#F9F9F7] text-[#4A1C1F] rounded-none">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#D4B6A2]/20">
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className={LabelStyle}>Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter coupon description"
                  rows={3}
                  required
                  className={InputStyle}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discount_value" className={LabelStyle}>
                    Discount Value * {formData.discount_type === 'percentage' ? '(%)' : '(₹)'}
                  </Label>
                  <Input
                    id="discount_value"
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) => handleInputChange('discount_value', Number(e.target.value))}
                    placeholder="0"
                    min="0"
                    required
                    className={InputStyle}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_order_amount" className={LabelStyle}>Min Order Value (₹)</Label>
                  <Input
                    id="min_order_amount"
                    type="number"
                    value={formData.min_order_amount}
                    onChange={(e) => handleInputChange('min_order_amount', Number(e.target.value))}
                    placeholder="0"
                    min="0"
                    className={InputStyle}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usage_limit" className={LabelStyle}>Usage Limit</Label>
                  <Input
                    id="usage_limit"
                    type="number"
                    value={formData.usage_limit}
                    onChange={(e) => handleInputChange('usage_limit', Number(e.target.value))}
                    placeholder="0 (Unlimited)"
                    min="0"
                    className={InputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={LabelStyle}>Valid From *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border-[#D4B6A2]/30 bg-[#F9F9F7] text-[#4A1C1F] rounded-none hover:bg-[#F9F9F7] hover:text-[#4A1C1F]",
                          !formData.valid_from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-[#B38B46]" />
                        {formData.valid_from ? format(formData.valid_from, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border-[#D4B6A2]/20 bg-white">
                      <Calendar
                        mode="single"
                        selected={formData.valid_from}
                        onSelect={(date) => handleInputChange('valid_from', date)}
                        initialFocus
                        className="p-3"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className={LabelStyle}>Valid Until *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border-[#D4B6A2]/30 bg-[#F9F9F7] text-[#4A1C1F] rounded-none hover:bg-[#F9F9F7] hover:text-[#4A1C1F]",
                          !formData.valid_until && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-[#B38B46]" />
                        {formData.valid_until ? format(formData.valid_until, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border-[#D4B6A2]/20 bg-white">
                      <Calendar
                        mode="single"
                        selected={formData.valid_until}
                        onSelect={(date) => handleInputChange('valid_until', date)}
                        initialFocus
                        className="p-3"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className={`${CardStyle} border-[#B38B46]/20 bg-[#F5EFE7]/30`}>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Button
                  type="submit"
                  className="w-full bg-[#4A1C1F] hover:bg-[#5C4638] text-white uppercase tracking-widest text-xs h-12 rounded-none transition-all duration-300 shadow-md hover:shadow-lg"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : isEdit ? 'Update Coupon' : 'Create Coupon'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-[#D4B6A2] text-[#5C4638] hover:bg-[#4A1C1F] hover:text-white hover:border-[#4A1C1F] uppercase tracking-widest text-xs h-10 rounded-none transition-all"
                  onClick={() => navigate('/admin/coupons')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default CouponForm;