import { useState, useEffect } from 'react';
import { Save, Bell, Shield, Palette, Globe, CreditCard, Package, Truck, Clock, DollarSign, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AdminSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('settings')
        .select('key, value, description, category')
        .order('category', { ascending: true });

      if (error) throw error;

      // Convert array to object for easier access
      const settingsObj: Record<string, any> = {};
      data?.forEach(setting => {
        try {
          // Parse JSON values, fallback to string if parsing fails
          settingsObj[setting.key] = typeof setting.value === 'string'
            ? JSON.parse(setting.value)
            : setting.value;
        } catch {
          settingsObj[setting.key] = setting.value;
        }
      });

      setSettings(settingsObj);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Prepare updates for each setting
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value: JSON.stringify(value),
        updated_at: new Date().toISOString()
      }));

      // Update settings in database
      for (const update of updates) {
        const { error } = await supabase
          .from('settings')
          .update({ value: update.value, updated_at: update.updated_at })
          .eq('key', update.key);

        if (error) throw error;
      }

      toast({
        title: "Settings saved!",
        description: "All settings have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B38B46]"></div>
      </div>
    );
  }

  const InputStyle = "border-[#D4B6A2]/30 focus:border-[#B38B46] focus:ring-[#B38B46]/20 bg-[#F9F9F7] text-[#4A1C1F]";
  const LabelStyle = "text-[#7E5A34] text-xs uppercase tracking-widest font-medium";
  const CardStyle = "border border-[#D4B6A2]/20 shadow-sm bg-white hover:shadow-md transition-all duration-300";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center border-b border-[#D4B6A2]/20 pb-6">
        <div>
          <h1 className="text-3xl font-serif text-[#4A1C1F] tracking-tight mb-1">Configuration</h1>
          <p className="text-[#5C4638] font-light text-sm tracking-wide">Manage system settings and preferences</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#4A1C1F] hover:bg-[#5C4638] text-white uppercase tracking-widest text-xs h-10 px-6 rounded-none transition-all duration-300 shadow-md"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-7 bg-[#F5EFE7] p-1 border border-[#D4B6A2]/20 rounded-none mb-6">
          <TabsTrigger value="general" className="data-[state=active]:bg-[#4A1C1F] data-[state=active]:text-white uppercase tracking-wider text-[10px] rounded-none transition-all">General</TabsTrigger>
          <TabsTrigger value="business" className="data-[state=active]:bg-[#4A1C1F] data-[state=active]:text-white uppercase tracking-wider text-[10px] rounded-none transition-all">Business</TabsTrigger>
          <TabsTrigger value="operations" className="data-[state=active]:bg-[#4A1C1F] data-[state=active]:text-white uppercase tracking-wider text-[10px] rounded-none transition-all">Operations</TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-[#4A1C1F] data-[state=active]:text-white uppercase tracking-wider text-[10px] rounded-none transition-all">Payments</TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-[#4A1C1F] data-[state=active]:text-white uppercase tracking-wider text-[10px] rounded-none transition-all">Notifications</TabsTrigger>
          <TabsTrigger value="display" className="data-[state=active]:bg-[#4A1C1F] data-[state=active]:text-white uppercase tracking-wider text-[10px] rounded-none transition-all">Display</TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-[#4A1C1F] data-[state=active]:text-white uppercase tracking-wider text-[10px] rounded-none transition-all">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className={CardStyle}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-[#4A1C1F] font-serif text-lg">
                <Globe className="w-5 h-5 text-[#B38B46]" />
                <span>Store Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="store_name" className={LabelStyle}>Store Name</Label>
                  <Input
                    id="store_name"
                    value={settings.store_name || ''}
                    onChange={(e) => updateSetting('store_name', e.target.value)}
                    className={InputStyle}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store_email" className={LabelStyle}>Store Email</Label>
                  <Input
                    id="store_email"
                    type="email"
                    value={settings.store_email || ''}
                    onChange={(e) => updateSetting('store_email', e.target.value)}
                    className={InputStyle}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="store_description" className={LabelStyle}>Store Description</Label>
                <Textarea
                  id="store_description"
                  value={settings.store_description || ''}
                  onChange={(e) => updateSetting('store_description', e.target.value)}
                  rows={3}
                  className={InputStyle}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="store_phone" className={LabelStyle}>Phone Number</Label>
                  <Input
                    id="store_phone"
                    value={settings.store_phone || ''}
                    onChange={(e) => updateSetting('store_phone', e.target.value)}
                    className={InputStyle}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store_address" className={LabelStyle}>Address</Label>
                  <Input
                    id="store_address"
                    value={settings.store_address || ''}
                    onChange={(e) => updateSetting('store_address', e.target.value)}
                    className={InputStyle}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="store_logo" className={LabelStyle}>Store Logo URL</Label>
                <Input
                  id="store_logo"
                  value={settings.store_logo || ''}
                  onChange={(e) => updateSetting('store_logo', e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className={InputStyle}
                />
              </div>
            </CardContent>
          </Card>

          <Card className={CardStyle}>
            <CardHeader>
              <CardTitle className="text-[#4A1C1F] font-serif text-lg">SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site_title" className={LabelStyle}>Site Title</Label>
                <Input
                  id="site_title"
                  value={settings.site_title || ''}
                  onChange={(e) => updateSetting('site_title', e.target.value)}
                  className={InputStyle}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="site_description" className={LabelStyle}>Site Description</Label>
                <Textarea
                  id="site_description"
                  value={settings.site_description || ''}
                  onChange={(e) => updateSetting('site_description', e.target.value)}
                  rows={2}
                  className={InputStyle}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="site_keywords" className={LabelStyle}>Site Keywords</Label>
                <Input
                  id="site_keywords"
                  value={settings.site_keywords || ''}
                  onChange={(e) => updateSetting('site_keywords', e.target.value)}
                  placeholder="keyword1, keyword2, keyword3"
                  className={InputStyle}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <Card className={CardStyle}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-[#4A1C1F] font-serif text-lg">
                <Clock className="w-5 h-5 text-[#B38B46]" />
                <span>Business Hours & Operations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business_hours_start" className={LabelStyle}>Business Hours Start</Label>
                  <Input
                    id="business_hours_start"
                    type="time"
                    value={settings.business_hours_start || ''}
                    onChange={(e) => updateSetting('business_hours_start', e.target.value)}
                    className={InputStyle}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_hours_end" className={LabelStyle}>Business Hours End</Label>
                  <Input
                    id="business_hours_end"
                    type="time"
                    value={settings.business_hours_end || ''}
                    onChange={(e) => updateSetting('business_hours_end', e.target.value)}
                    className={InputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order_processing_time" className={LabelStyle}>Order Processing Time (hours)</Label>
                  <Input
                    id="order_processing_time"
                    type="number"
                    value={settings.order_processing_time || 0}
                    onChange={(e) => updateSetting('order_processing_time', parseFloat(e.target.value))}
                    className={InputStyle}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery_time_estimate" className={LabelStyle}>Delivery Time Estimate (hours)</Label>
                  <Input
                    id="delivery_time_estimate"
                    type="number"
                    value={settings.delivery_time_estimate || 0}
                    onChange={(e) => updateSetting('delivery_time_estimate', parseFloat(e.target.value))}
                    className={InputStyle}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="low_stock_threshold" className={LabelStyle}>Low Stock Alert Threshold</Label>
                <Input
                  id="low_stock_threshold"
                  type="number"
                  value={settings.low_stock_threshold || 0}
                  onChange={(e) => updateSetting('low_stock_threshold', parseInt(e.target.value))}
                  className={`w-full md:w-1/2 ${InputStyle}`}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-[#4A1C1F]">Auto Approve Orders</Label>
                  <p className="text-xs text-[#5C4638]">Automatically approve new orders</p>
                </div>
                <Switch
                  checked={settings.auto_approve_orders || false}
                  onCheckedChange={(checked) => updateSetting('auto_approve_orders', checked)}
                  className="data-[state=checked]:bg-[#B38B46]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card className={CardStyle}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-[#4A1C1F] font-serif text-lg">
                <CreditCard className="w-5 h-5 text-[#B38B46]" />
                <span>Payment Methods</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-[#4A1C1F]">Razorpay Payments</Label>
                  <p className="text-xs text-[#5C4638]">Enable online payments via Razorpay</p>
                </div>
                <Switch
                  checked={settings.razorpay_enabled || false}
                  onCheckedChange={(checked) => updateSetting('razorpay_enabled', checked)}
                  className="data-[state=checked]:bg-[#B38B46]"
                />
              </div>

              <Separator className="bg-[#D4B6A2]/20" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-[#4A1C1F]">Cash on Delivery</Label>
                  <p className="text-xs text-[#5C4638]">Enable COD payments</p>
                </div>
                <Switch
                  checked={settings.cod_enabled || false}
                  onCheckedChange={(checked) => updateSetting('cod_enabled', checked)}
                  className="data-[state=checked]:bg-[#B38B46]"
                />
              </div>

              <Separator className="bg-[#D4B6A2]/20" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-[#4A1C1F]">UPI Payments</Label>
                  <p className="text-xs text-[#5C4638]">Enable UPI payments</p>
                </div>
                <Switch
                  checked={settings.upi_enabled || false}
                  onCheckedChange={(checked) => updateSetting('upi_enabled', checked)}
                  className="data-[state=checked]:bg-[#B38B46]"
                />
              </div>

              <Separator className="bg-[#D4B6A2]/20" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-[#4A1C1F]">Card Payments</Label>
                  <p className="text-xs text-[#5C4638]">Enable credit/debit card payments</p>
                </div>
                <Switch
                  checked={settings.card_enabled || false}
                  onCheckedChange={(checked) => updateSetting('card_enabled', checked)}
                  className="data-[state=checked]:bg-[#B38B46]"
                />
              </div>

              <Separator className="bg-[#D4B6A2]/20" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-[#4A1C1F]">Net Banking</Label>
                  <p className="text-xs text-[#5C4638]">Enable net banking payments</p>
                </div>
                <Switch
                  checked={settings.netbanking_enabled || false}
                  onCheckedChange={(checked) => updateSetting('netbanking_enabled', checked)}
                  className="data-[state=checked]:bg-[#B38B46]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className={CardStyle}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-[#4A1C1F] font-serif text-lg">
                <Bell className="w-5 h-5 text-[#B38B46]" />
                <span>Admin Notification Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-[#4A1C1F]">Email Notifications</Label>
                  <p className="text-xs text-[#5C4638]">Receive admin notifications via email</p>
                </div>
                <Switch
                  checked={settings.email_notifications || false}
                  onCheckedChange={(checked) => updateSetting('email_notifications', checked)}
                  className="data-[state=checked]:bg-[#B38B46]"
                />
              </div>

              <Separator className="bg-[#D4B6A2]/20" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-[#4A1C1F]">SMS Notifications</Label>
                  <p className="text-xs text-[#5C4638]">Receive admin notifications via SMS</p>
                </div>
                <Switch
                  checked={settings.sms_notifications || false}
                  onCheckedChange={(checked) => updateSetting('sms_notifications', checked)}
                  className="data-[state=checked]:bg-[#B38B46]"
                />
              </div>

              <Separator className="bg-[#D4B6A2]/20" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-[#4A1C1F]">Order Notifications</Label>
                  <p className="text-xs text-[#5C4638]">Get notified about new orders</p>
                </div>
                <Switch
                  checked={settings.order_notifications || false}
                  onCheckedChange={(checked) => updateSetting('order_notifications', checked)}
                  className="data-[state=checked]:bg-[#B38B46]"
                />
              </div>

              <Separator className="bg-[#D4B6A2]/20" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-[#4A1C1F]">Low Stock Alerts</Label>
                  <p className="text-xs text-[#5C4638]">Alert when products are running low</p>
                </div>
                <Switch
                  checked={settings.low_stock_alerts || false}
                  onCheckedChange={(checked) => updateSetting('low_stock_alerts', checked)}
                  className="data-[state=checked]:bg-[#B38B46]"
                />
              </div>

              <Separator className="bg-[#D4B6A2]/20" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-[#4A1C1F]">Payment Notifications</Label>
                  <p className="text-xs text-[#5C4638]">Get notified about payment updates</p>
                </div>
                <Switch
                  checked={settings.payment_notifications || false}
                  onCheckedChange={(checked) => updateSetting('payment_notifications', checked)}
                  className="data-[state=checked]:bg-[#B38B46]"
                />
              </div>

              <Separator className="bg-[#D4B6A2]/20" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-[#4A1C1F]">Customer Notifications</Label>
                  <p className="text-xs text-[#5C4638]">Enable notifications to customers</p>
                </div>
                <Switch
                  checked={settings.customer_notifications || false}
                  onCheckedChange={(checked) => updateSetting('customer_notifications', checked)}
                  className="data-[state=checked]:bg-[#B38B46]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <Card className={CardStyle}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-[#4A1C1F] font-serif text-lg">
                <DollarSign className="w-5 h-5 text-[#B38B46]" />
                <span>Currency & Tax Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency" className={LabelStyle}>Currency</Label>
                  <select
                    id="currency"
                    value={settings.currency || 'INR'}
                    onChange={(e) => updateSetting('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-[#D4B6A2]/30 bg-[#F9F9F7] text-[#4A1C1F] rounded-md text-sm focus:outline-none focus:border-[#B38B46]"
                  >
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency_symbol" className={LabelStyle}>Currency Symbol</Label>
                  <Input
                    id="currency_symbol"
                    value={settings.currency_symbol || ''}
                    onChange={(e) => updateSetting('currency_symbol', e.target.value)}
                    className={InputStyle}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax_rate" className={LabelStyle}>Tax Rate (%)</Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    value={settings.tax_rate || 0}
                    onChange={(e) => updateSetting('tax_rate', parseFloat(e.target.value))}
                    className={InputStyle}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={CardStyle}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-[#4A1C1F] font-serif text-lg">
                <Truck className="w-5 h-5 text-[#B38B46]" />
                <span>Delivery Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="delivery_charge" className={LabelStyle}>Standard Delivery Charge (₹)</Label>
                  <Input
                    id="delivery_charge"
                    type="number"
                    value={settings.delivery_charge || 0}
                    onChange={(e) => updateSetting('delivery_charge', parseFloat(e.target.value))}
                    className={InputStyle}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="free_delivery_threshold" className={LabelStyle}>Free Delivery Above (₹)</Label>
                  <Input
                    id="free_delivery_threshold"
                    type="number"
                    value={settings.free_delivery_threshold || 0}
                    onChange={(e) => updateSetting('free_delivery_threshold', parseFloat(e.target.value))}
                    className={InputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cod_charge" className={LabelStyle}>Cash on Delivery Charge (₹)</Label>
                  <Input
                    id="cod_charge"
                    type="number"
                    value={settings.cod_charge || 0}
                    onChange={(e) => updateSetting('cod_charge', parseFloat(e.target.value))}
                    className={InputStyle}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cod_threshold" className={LabelStyle}>Maximum COD Amount (₹)</Label>
                  <Input
                    id="cod_threshold"
                    type="number"
                    value={settings.cod_threshold || 0}
                    onChange={(e) => updateSetting('cod_threshold', parseFloat(e.target.value))}
                    className={InputStyle}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_delivery_distance" className={LabelStyle}>Maximum Delivery Distance (km)</Label>
                <Input
                  id="max_delivery_distance"
                  type="number"
                  value={settings.max_delivery_distance || 0}
                  onChange={(e) => updateSetting('max_delivery_distance', parseFloat(e.target.value))}
                  className={`w-full md:w-1/2 ${InputStyle}`}
                />
              </div>
            </CardContent>
          </Card>

          <Card className={CardStyle}>
            <CardHeader>
              <CardTitle className="text-[#4A1C1F] font-serif text-lg">Order Limits & Discounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min_order_amount" className={LabelStyle}>Minimum Order Amount (₹)</Label>
                  <Input
                    id="min_order_amount"
                    type="number"
                    value={settings.min_order_amount || 0}
                    onChange={(e) => updateSetting('min_order_amount', parseFloat(e.target.value))}
                    className={InputStyle}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_order_amount" className={LabelStyle}>Maximum Order Amount (₹)</Label>
                  <Input
                    id="max_order_amount"
                    type="number"
                    value={settings.max_order_amount || 0}
                    onChange={(e) => updateSetting('max_order_amount', parseFloat(e.target.value))}
                    className={InputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bulk_discount_threshold" className={LabelStyle}>Bulk Discount Above (₹)</Label>
                  <Input
                    id="bulk_discount_threshold"
                    type="number"
                    value={settings.bulk_discount_threshold || 0}
                    onChange={(e) => updateSetting('bulk_discount_threshold', parseFloat(e.target.value))}
                    className={InputStyle}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bulk_discount_percentage" className={LabelStyle}>Bulk Discount (%)</Label>
                  <Input
                    id="bulk_discount_percentage"
                    type="number"
                    value={settings.bulk_discount_percentage || 0}
                    onChange={(e) => updateSetting('bulk_discount_percentage', parseFloat(e.target.value))}
                    className={InputStyle}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className={CardStyle}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-[#4A1C1F] font-serif text-lg">
                <Shield className="w-5 h-5 text-[#B38B46]" />
                <span>Security Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-[#4A1C1F]">Two-Factor Authentication</Label>
                  <p className="text-xs text-[#5C4638]">Add an extra layer of security</p>
                </div>
                <Switch
                  checked={settings.enable_two_factor || false}
                  onCheckedChange={(checked) => updateSetting('enable_two_factor', checked)}
                  className="data-[state=checked]:bg-[#B38B46]"
                />
              </div>

              <Separator className="bg-[#D4B6A2]/20" />

              <div className="space-y-2">
                <Label htmlFor="session_timeout" className={LabelStyle}>Session Timeout (minutes)</Label>
                <Input
                  id="session_timeout"
                  type="number"
                  value={settings.session_timeout || 30}
                  onChange={(e) => updateSetting('session_timeout', parseInt(e.target.value))}
                  className={`w-full md:w-1/2 ${InputStyle}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_min_length" className={LabelStyle}>Minimum Password Length</Label>
                <Input
                  id="password_min_length"
                  type="number"
                  value={settings.password_min_length || 8}
                  onChange={(e) => updateSetting('password_min_length', parseInt(e.target.value))}
                  className={`w-full md:w-1/2 ${InputStyle}`}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-[#4A1C1F]">Require Email Verification</Label>
                  <p className="text-xs text-[#5C4638]">Require email verification for new accounts</p>
                </div>
                <Switch
                  checked={settings.require_email_verification || false}
                  onCheckedChange={(checked) => updateSetting('require_email_verification', checked)}
                  className="data-[state=checked]:bg-[#B38B46]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="display" className="space-y-6">
          <Card className={CardStyle}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-[#4A1C1F] font-serif text-lg">
                <Palette className="w-5 h-5 text-[#B38B46]" />
                <span>Display Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="products_per_page" className={LabelStyle}>Products Per Page</Label>
                <Input
                  id="products_per_page"
                  type="number"
                  value={settings.products_per_page || 12}
                  onChange={(e) => updateSetting('products_per_page', parseInt(e.target.value))}
                  className={`w-full md:w-1/2 ${InputStyle}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="featured_products_count" className={LabelStyle}>Featured Products Count</Label>
                <Input
                  id="featured_products_count"
                  type="number"
                  value={settings.featured_products_count || 8}
                  onChange={(e) => updateSetting('featured_products_count', parseInt(e.target.value))}
                  className={`w-full md:w-1/2 ${InputStyle}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bestsellers_count" className={LabelStyle}>Bestsellers Count</Label>
                <Input
                  id="bestsellers_count"
                  type="number"
                  value={settings.bestsellers_count || 6}
                  onChange={(e) => updateSetting('bestsellers_count', parseInt(e.target.value))}
                  className={`w-full md:w-1/2 ${InputStyle}`}
                />
              </div>

              <Separator className="bg-[#D4B6A2]/20" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-[#4A1C1F]">Enable Reviews</Label>
                  <p className="text-xs text-[#5C4638]">Allow customers to review products</p>
                </div>
                <Switch
                  checked={settings.enable_reviews || false}
                  onCheckedChange={(checked) => updateSetting('enable_reviews', checked)}
                  className="data-[state=checked]:bg-[#B38B46]"
                />
              </div>

              <Separator className="bg-[#D4B6A2]/20" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-[#4A1C1F]">Enable Ratings</Label>
                  <p className="text-xs text-[#5C4638]">Allow customers to rate products</p>
                </div>
                <Switch
                  checked={settings.enable_ratings || false}
                  onCheckedChange={(checked) => updateSetting('enable_ratings', checked)}
                  className="data-[state=checked]:bg-[#B38B46]"
                />
              </div>

              <Separator className="bg-[#D4B6A2]/20" />

              <div className="space-y-2">
                <Label htmlFor="language" className={LabelStyle}>Language</Label>
                <select
                  id="language"
                  value={settings.language}
                  onChange={(e) => updateSetting('language', e.target.value)}
                  className="w-full md:w-1/2 px-3 py-2 border border-[#D4B6A2]/30 bg-[#F9F9F7] text-[#4A1C1F] rounded-md text-sm focus:outline-none focus:border-[#B38B46]"
                >
                  <option value="english">English</option>
                  <option value="hindi">Hindi</option>
                  <option value="marathi">Marathi</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card className={CardStyle}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-[#4A1C1F] font-serif text-lg">
                <Package className="w-5 h-5 text-[#B38B46]" />
                <span>Third-party Integrations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-[#D4B6A2]/20 rounded-lg bg-[#F9F9F7]">
                <h3 className="font-medium mb-1 text-[#4A1C1F]">Google Maps API - Removed</h3>
                <p className="text-xs text-[#5C4638]">Location features have been removed. Users now manually enter addresses.</p>
              </div>

              <div className="p-4 border border-[#D4B6A2]/20 rounded-lg bg-white">
                <h3 className="font-medium mb-2 text-[#4A1C1F]">Razorpay Payment Gateway</h3>
                <p className="text-xs text-[#5C4638] mb-3">For processing payments</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                  <Input placeholder="Razorpay Key ID" className={InputStyle} />
                  <Input placeholder="Razorpay Secret Key" type="password" className={InputStyle} />
                </div>
                <Button variant="outline" size="sm" className="border-[#D4B6A2] text-[#5C4638] hover:bg-[#F9F9F7] text-xs uppercase tracking-widest">Configure</Button>
              </div>

              <div className="p-4 border border-[#D4B6A2]/20 rounded-lg bg-white">
                <h3 className="font-medium mb-2 text-[#4A1C1F]">SMS Gateway</h3>
                <p className="text-xs text-[#5C4638] mb-3">For sending order notifications</p>
                <Input placeholder="SMS API Key" className={`mb-2 ${InputStyle}`} />
                <Button variant="outline" size="sm" className="border-[#D4B6A2] text-[#5C4638] hover:bg-[#F9F9F7] text-xs uppercase tracking-widest">Configure</Button>
              </div>

              <div className="p-4 border border-[#D4B6A2]/20 rounded-lg bg-white">
                <h3 className="font-medium mb-2 text-[#4A1C1F]">Email Service (SMTP)</h3>
                <p className="text-xs text-[#5C4638] mb-3">For sending email notifications</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                  <Input placeholder="SMTP Host" className={InputStyle} />
                  <Input placeholder="SMTP Port" className={InputStyle} />
                  <Input placeholder="SMTP Username" className={InputStyle} />
                  <Input placeholder="SMTP Password" type="password" className={InputStyle} />
                </div>
                <Button variant="outline" size="sm" className="border-[#D4B6A2] text-[#5C4638] hover:bg-[#F9F9F7] text-xs uppercase tracking-widest">Configure</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;