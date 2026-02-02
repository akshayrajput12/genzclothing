import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Edit2, Trash2, Home, Briefcase, MapIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';


interface Address {
  id: string;
  name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  phone?: string;
  type: 'home' | 'work' | 'other';
  is_default: boolean;
  latitude?: number;
  longitude?: number;
}

interface AddressManagerProps {
  onAddressSelect?: (address: Address) => void;
  selectedAddressId?: string;
  showSelector?: boolean;
}

const AddressManager = ({ onAddressSelect, selectedAddressId, showSelector = false }: AddressManagerProps) => {
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    phone: '',
    type: 'home' as 'home' | 'work' | 'other',
    is_default: false
  });



  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setAddresses((data || []).map(addr => ({ ...addr, type: addr.type as 'home' | 'work' | 'other' })));
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast({
        title: "Error",
        description: "Failed to fetch addresses.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to save addresses.",
          variant: "destructive",
        });
        return;
      }

      const addressData = {
        ...formData,
        user_id: user.id,
        latitude: null,
        longitude: null
      };

      if (editingAddress) {
        // Update existing address
        const { error } = await supabase
          .from('addresses')
          .update(addressData)
          .eq('id', editingAddress.id);

        if (error) throw error;

        toast({
          title: "Address updated!",
          description: "Your address has been updated successfully.",
        });
      } else {
        // Create new address
        const { error } = await supabase
          .from('addresses')
          .insert([addressData]);

        if (error) throw error;

        toast({
          title: "Address saved!",
          description: "Your address has been saved successfully.",
        });
      }

      // If this is set as default, update others
      if (formData.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .neq('id', editingAddress?.id || '');
      }

      fetchAddresses();
      resetForm();
    } catch (error) {
      console.error('Error saving address:', error);
      toast({
        title: "Error",
        description: "Failed to save address.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (addressId: string) => {
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;

      toast({
        title: "Address deleted",
        description: "Address has been removed successfully.",
      });

      fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      toast({
        title: "Error",
        description: "Failed to delete address.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      name: address.name,
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      landmark: address.landmark || '',
      phone: address.phone || '',
      type: address.type,
      is_default: address.is_default
    });


    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
      phone: '',
      type: 'home',
      is_default: false
    });

    setEditingAddress(null);
    setShowForm(false);
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home': return <Home className="h-4 w-4" />;
      case 'work': return <Briefcase className="h-4 w-4" />;
      default: return <MapIcon className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-[#F9F9F7] rounded-lg border border-[#D4B6A2]/20"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-serif text-[#4A1C1F]">Delivery Addresses</h2>
        <Button
          onClick={() => setShowForm(true)}
          size="sm"
          className="bg-[#4A1C1F] hover:bg-[#5C4638] text-white uppercase tracking-widest text-[10px]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Address
        </Button>
      </div>

      {/* Address List */}
      {addresses.length > 0 && (
        <div className="space-y-3">
          {addresses.map((address) => (
            <Card
              key={address.id}
              className={`cursor-pointer transition-all border-white/40 bg-white/40 dark:bg-white/5 backdrop-blur-sm ${selectedAddressId === address.id ? 'ring-1 ring-[#B38B46] border-[#B38B46]' : ''
                } ${showSelector ? 'hover:ring-1 hover:ring-[#B38B46]' : 'hover:shadow-md hover:bg-white/60 dark:hover:bg-white/10'}`}
              onClick={() => showSelector && onAddressSelect?.(address)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="text-[#B38B46]">
                        {getAddressIcon(address.type)}
                      </div>
                      <span className="font-serif font-medium text-[#4A1C1F] dark:text-white">{address.name}</span>
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-[#7E5A34] dark:text-[#EADDCD] border-[#D4B6A2]/30">
                        {address.type.charAt(0).toUpperCase() + address.type.slice(1)}
                      </Badge>
                      {address.is_default && (
                        <Badge className="text-[10px] uppercase tracking-wider bg-[#B38B46] hover:bg-[#B38B46]/90 text-white border-none">Default</Badge>
                      )}
                    </div>

                    <div className="text-sm text-[#5C4638] dark:text-gray-300 space-y-1 font-light">
                      <p>{address.address_line_1}</p>
                      {address.address_line_2 && <p>{address.address_line_2}</p>}
                      <p>{address.city}, {address.state} - {address.pincode}</p>
                      {address.landmark && <p>Near {address.landmark}</p>}
                      {address.phone && <p>Phone: {address.phone}</p>}
                    </div>
                  </div>

                  {!showSelector && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(address)}
                        className="text-[#7E5A34] hover:text-[#4A1C1F] hover:bg-white/20"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(address.id)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No addresses message */}
      {addresses.length === 0 && !showForm && (
        <Card className="border border-white/20 bg-white/10 backdrop-blur-sm">
          <CardContent className="text-center py-12">
            <MapPin className="h-12 w-12 mx-auto text-[#D4B6A2] mb-4" />
            <h3 className="text-lg font-serif text-[#4A1C1F] dark:text-white mb-1">No addresses saved</h3>
            <p className="text-[#5C4638] dark:text-gray-300 mb-6 font-light text-sm">
              Add a delivery address to get started
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-[#4A1C1F] hover:bg-[#5C4638] text-white uppercase tracking-widest text-xs"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Address
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Address Form */}
      {showForm && (
        <Card className="border border-white/30 shadow-sm bg-white/40 dark:bg-black/20 backdrop-blur-md">
          <CardHeader className="bg-white/20 border-b border-white/20 py-4">
            <CardTitle className="font-serif text-[#4A1C1F] dark:text-white text-lg">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Address Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs uppercase tracking-widest text-[#7E5A34] dark:text-[#EADDCD]">Address Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Home, Office"
                    required
                    className="border-white/40 focus:border-[#B38B46] focus:ring-[#B38B46]/20 bg-white/50 dark:bg-white/5 backdrop-blur-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="text-xs uppercase tracking-widest text-[#7E5A34] dark:text-[#EADDCD]">Address Type</Label>
                  <Select value={formData.type} onValueChange={(value: 'home' | 'work' | 'other') => setFormData({ ...formData, type: value })}>
                    <SelectTrigger className="border-white/40 focus:ring-[#B38B46]/20 bg-white/50 dark:bg-white/5 backdrop-blur-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_line_1" className="text-xs uppercase tracking-widest text-[#7E5A34] dark:text-[#EADDCD]">Address Line 1 *</Label>
                <Input
                  id="address_line_1"
                  value={formData.address_line_1}
                  onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
                  placeholder="House/Flat number, Building name"
                  required
                  className="border-white/40 focus:border-[#B38B46] focus:ring-[#B38B46]/20 bg-white/50 dark:bg-white/5 backdrop-blur-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_line_2" className="text-xs uppercase tracking-widest text-[#7E5A34] dark:text-[#EADDCD]">Address Line 2</Label>
                <Input
                  id="address_line_2"
                  value={formData.address_line_2}
                  onChange={(e) => setFormData({ ...formData, address_line_2: e.target.value })}
                  placeholder="Street, Area"
                  className="border-white/40 focus:border-[#B38B46] focus:ring-[#B38B46]/20 bg-white/50 dark:bg-white/5 backdrop-blur-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-xs uppercase tracking-widest text-[#7E5A34] dark:text-[#EADDCD]">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                    required
                    className="border-white/40 focus:border-[#B38B46] focus:ring-[#B38B46]/20 bg-white/50 dark:bg-white/5 backdrop-blur-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state" className="text-xs uppercase tracking-widest text-[#7E5A34] dark:text-[#EADDCD]">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="State"
                    required
                    className="border-white/40 focus:border-[#B38B46] focus:ring-[#B38B46]/20 bg-white/50 dark:bg-white/5 backdrop-blur-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pincode" className="text-xs uppercase tracking-widest text-[#7E5A34] dark:text-[#EADDCD]">Pincode *</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    placeholder="6-digit pincode"
                    required
                    className="border-white/40 focus:border-[#B38B46] focus:ring-[#B38B46]/20 bg-white/50 dark:bg-white/5 backdrop-blur-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="landmark" className="text-xs uppercase tracking-widest text-[#7E5A34] dark:text-[#EADDCD]">Landmark</Label>
                  <Input
                    id="landmark"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    placeholder="Nearby landmark"
                    className="border-white/40 focus:border-[#B38B46] focus:ring-[#B38B46]/20 bg-white/50 dark:bg-white/5 backdrop-blur-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs uppercase tracking-widest text-[#7E5A34] dark:text-[#EADDCD]">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Contact number"
                    className="border-white/40 focus:border-[#B38B46] focus:ring-[#B38B46]/20 bg-white/50 dark:bg-white/5 backdrop-blur-sm"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="rounded border-[#D4B6A2] text-[#4A1C1F] focus:ring-[#B38B46]"
                />
                <Label htmlFor="is_default" className="text-sm font-light text-[#5C4638] cursor-pointer">Set as default address</Label>
              </div>

              <div className="flex space-x-4 pt-2">
                <Button
                  type="submit"
                  className="flex-1 bg-[#4A1C1F] hover:bg-[#5C4638] text-white uppercase tracking-widest text-xs"
                >
                  {editingAddress ? 'Update Address' : 'Save Address'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="border-[#D4B6A2] text-[#5C4638] hover:bg-[#F5EFE7] uppercase tracking-widest text-xs"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AddressManager;