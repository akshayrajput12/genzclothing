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
            <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-[#0B0B0F]/10 dark:border-[#F8FAFC]/10"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 font-display">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bebas text-[#0B0B0F] dark:text-[#F8FAFC] tracking-wide">Delivery Addresses</h2>
        <Button
          onClick={() => setShowForm(true)}
          size="sm"
          className="bg-[#0B0B0F] hover:bg-[#F97316] text-white border-2 border-[#0B0B0F] hover:border-[#F97316] uppercase tracking-widest text-[10px] font-bold rounded-none transition-all shadow-none hover:translate-x-1 hover:translate-y-1"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Address
        </Button>
      </div>

      {/* Address List */}
      {addresses.length > 0 && (
        <div className="space-y-3">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`cursor-pointer transition-all border-2 p-4 bg-white dark:bg-[#0B0B0F] relative group
                ${selectedAddressId === address.id ? 'border-primary ring-1 ring-primary' : 'border-[#0B0B0F] dark:border-[#F8FAFC] hover:border-primary dark:hover:border-primary'}
                ${showSelector ? 'hover:ring-1 hover:ring-primary' : ''}
              `}
              onClick={() => showSelector && onAddressSelect?.(address)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="text-primary">
                      {getAddressIcon(address.type)}
                    </div>
                    <span className="font-bebas text-xl text-[#0B0B0F] dark:text-[#F8FAFC] tracking-wide">{address.name}</span>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-[#0B0B0F] dark:text-[#F8FAFC] border-[#0B0B0F] dark:border-[#F8FAFC] rounded-sm font-bold">
                      {address.type}
                    </Badge>
                    {address.is_default && (
                      <span className="text-[10px] uppercase tracking-wider bg-primary text-white px-2 py-0.5 font-bold rounded-sm">Default</span>
                    )}
                  </div>

                  <div className="text-sm text-[#0B0B0F]/70 dark:text-[#F8FAFC]/70 space-y-1 font-medium">
                    <p>{address.address_line_1}</p>
                    {address.address_line_2 && <p>{address.address_line_2}</p>}
                    <p>{address.city}, {address.state} - {address.pincode}</p>
                    {address.landmark && <p>Near {address.landmark}</p>}
                    {address.phone && <p>Phone: {address.phone}</p>}
                  </div>
                </div>

                {!showSelector && (
                  <div className="flex items-center space-x-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(address)}
                      className="text-[#0B0B0F] dark:text-[#F8FAFC] hover:text-primary hover:bg-transparent"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(address.id)}
                      className="text-red-400 hover:text-red-600 hover:bg-transparent"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No addresses message */}
      {addresses.length === 0 && !showForm && (
        <div className="border-2 border-dashed border-[#0B0B0F]/20 dark:border-[#F8FAFC]/20 p-8 text-center bg-[#F8FAFC] dark:bg-[#0B0B0F]">
          <MapPin className="h-12 w-12 mx-auto text-[#0B0B0F]/20 dark:text-[#F8FAFC]/20 mb-4" />
          <h3 className="text-xl font-bebas text-[#0B0B0F] dark:text-[#F8FAFC] mb-1">No addresses saved</h3>
          <p className="text-[#0B0B0F]/60 dark:text-[#F8FAFC]/60 mb-6 font-bold text-xs uppercase tracking-widest">
            Add a delivery location to continue missions
          </p>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-primary hover:bg-[#0B0B0F] text-white font-bebas tracking-widest text-lg px-6 py-2 rounded-none transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Location
          </Button>
        </div>
      )}

      {/* Add/Edit Address Form */}
      {showForm && (
        <div className="border-2 border-[#0B0B0F] dark:border-[#F8FAFC] bg-white dark:bg-[#0B0B0F] p-6 relative">
          <h3 className="font-bebas text-2xl text-[#0B0B0F] dark:text-[#F8FAFC] mb-6 border-b border-[#0B0B0F]/10 dark:border-[#F8FAFC]/10 pb-2">
            {editingAddress ? 'EDIT COORDINATES' : 'NEW COORDINATES'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Address Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs uppercase font-black tracking-widest text-[#0B0B0F]/50 dark:text-[#F8FAFC]/50">Address Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Home Base, Hideout"
                  required
                  className="border-2 border-[#0B0B0F] dark:border-[#F8FAFC] focus:ring-2 focus:ring-primary focus:border-primary rounded-none bg-transparent h-12 font-medium"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-xs uppercase font-black tracking-widest text-[#0B0B0F]/50 dark:text-[#F8FAFC]/50">Address Type</Label>
                <Select value={formData.type} onValueChange={(value: 'home' | 'work' | 'other') => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="border-2 border-[#0B0B0F] dark:border-[#F8FAFC] focus:ring-2 focus:ring-primary focus:border-primary rounded-none bg-transparent h-12 font-medium">
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
              <Label htmlFor="address_line_1" className="text-xs uppercase font-black tracking-widest text-[#0B0B0F]/50 dark:text-[#F8FAFC]/50">Address Line 1 *</Label>
              <Input
                id="address_line_1"
                value={formData.address_line_1}
                onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
                placeholder="House/Flat number, Building name"
                required
                className="border-2 border-[#0B0B0F] dark:border-[#F8FAFC] focus:ring-2 focus:ring-primary focus:border-primary rounded-none bg-transparent h-12 font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_line_2" className="text-xs uppercase font-black tracking-widest text-[#0B0B0F]/50 dark:text-[#F8FAFC]/50">Address Line 2</Label>
              <Input
                id="address_line_2"
                value={formData.address_line_2}
                onChange={(e) => setFormData({ ...formData, address_line_2: e.target.value })}
                placeholder="Street, Area"
                className="border-2 border-[#0B0B0F] dark:border-[#F8FAFC] focus:ring-2 focus:ring-primary focus:border-primary rounded-none bg-transparent h-12 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-xs uppercase font-black tracking-widest text-[#0B0B0F]/50 dark:text-[#F8FAFC]/50">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                  required
                  className="border-2 border-[#0B0B0F] dark:border-[#F8FAFC] focus:ring-2 focus:ring-primary focus:border-primary rounded-none bg-transparent h-12 font-medium"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state" className="text-xs uppercase font-black tracking-widest text-[#0B0B0F]/50 dark:text-[#F8FAFC]/50">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="State"
                  required
                  className="border-2 border-[#0B0B0F] dark:border-[#F8FAFC] focus:ring-2 focus:ring-primary focus:border-primary rounded-none bg-transparent h-12 font-medium"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode" className="text-xs uppercase font-black tracking-widest text-[#0B0B0F]/50 dark:text-[#F8FAFC]/50">Pincode *</Label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="Pincode"
                  required
                  className="border-2 border-[#0B0B0F] dark:border-[#F8FAFC] focus:ring-2 focus:ring-primary focus:border-primary rounded-none bg-transparent h-12 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="landmark" className="text-xs uppercase font-black tracking-widest text-[#0B0B0F]/50 dark:text-[#F8FAFC]/50">Landmark</Label>
                <Input
                  id="landmark"
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  placeholder="Nearby landmark"
                  className="border-2 border-[#0B0B0F] dark:border-[#F8FAFC] focus:ring-2 focus:ring-primary focus:border-primary rounded-none bg-transparent h-12 font-medium"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs uppercase font-black tracking-widest text-[#0B0B0F]/50 dark:text-[#F8FAFC]/50">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Contact number"
                  className="border-2 border-[#0B0B0F] dark:border-[#F8FAFC] focus:ring-2 focus:ring-primary focus:border-primary rounded-none bg-transparent h-12 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="is_default"
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                className="rounded-none border-2 border-[#0B0B0F] dark:border-[#F8FAFC] text-primary focus:ring-primary h-5 w-5"
              />
              <Label htmlFor="is_default" className="text-sm font-bold text-[#0B0B0F] dark:text-[#F8FAFC] cursor-pointer">Set as default location</Label>
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-[#0B0B0F] text-white font-bebas text-xl tracking-widest py-6 rounded-none shadow-[4px_4px_0px_0px_rgba(11,11,15,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                {editingAddress ? 'UPDATE LOCATION' : 'SAVE LOCATION'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="border-2 border-[#0B0B0F] dark:border-[#F8FAFC] text-[#0B0B0F] dark:text-[#F8FAFC] hover:bg-[#0B0B0F]/10 font-bebas text-xl tracking-widest py-6 rounded-none bg-transparent"
              >
                CANCEL
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddressManager;