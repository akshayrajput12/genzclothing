import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateAddressDetails } from '@/utils/validation';
import { formatCurrency } from '@/utils/settingsHelpers';

interface AddressDetails {
  plotNumber: string;
  buildingName: string;
  street: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  addressType: 'home' | 'work' | 'other';
  saveAs: string;
}

interface SavedAddress {
  id: string;
  name: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  type: string;
  is_default: boolean;
}

interface CheckoutAddressDetailsProps {
  addressDetails: AddressDetails;
  setAddressDetails: (details: AddressDetails) => void;
  savedAddresses: SavedAddress[];
  selectedAddress: SavedAddress | null;
  setSelectedAddress: (address: SavedAddress | null) => void;
  useExistingAddress: boolean;
  setUseExistingAddress: (use: boolean) => void;
  showAddressForm: boolean;
  setShowAddressForm: (show: boolean) => void;
  settings: any;
  subtotal: number;
  currentUser: any;
  onNext: () => void;
  onPrev: () => void;
  estimatedDeliveryFee: number | null;
  setEstimatedDeliveryFee: (fee: number | null) => void;
  estimatedDeliveryTime: string | null;
  setEstimatedDeliveryTime: (time: string | null) => void;
  cartItems: any[];
  isPincodeServiceable: boolean;
  setIsPincodeServiceable: (serviceable: boolean) => void;
}

const CheckoutAddressDetails = ({
  addressDetails,
  setAddressDetails,
  savedAddresses,
  selectedAddress,
  setSelectedAddress,
  useExistingAddress,
  setUseExistingAddress,
  showAddressForm,
  setShowAddressForm,
  settings,
  onNext,
  onPrev,
  estimatedDeliveryFee,
  estimatedDeliveryTime,
  currentUser
}: CheckoutAddressDetailsProps) => {
  const [addressErrors, setAddressErrors] = useState<string[]>([]);

  const handleSavedAddressSelect = (address: SavedAddress) => {
    setSelectedAddress(address);
    setUseExistingAddress(true);

    // Pre-fill address details from saved address
    setAddressDetails({
      plotNumber: address.address_line_1.split(',')[0] || '',
      buildingName: '',
      street: address.address_line_2 || '',
      landmark: address.landmark || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode,
      addressType: address.type as 'home' | 'work' | 'other',
      saveAs: address.type === 'other' ? address.name : ''
    });
  };

  const handleNext = () => {
    // Validate city, state, and pincode first
    if (!addressDetails.city || !addressDetails.state || !addressDetails.pincode) {
      // Show error message
      return;
    }

    if (!useExistingAddress) {
      const validation = validateAddressDetails(addressDetails);
      if (!validation.isValid) {
        setAddressErrors(validation.errors);
        return;
      }
    }
    setAddressErrors([]);
    onNext();
  };

  return (
    <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md border border-[#F97316]/20 rounded-xl p-8 shadow-sm font-display relative overflow-hidden">
      {/* Decor */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F97316] to-transparent opacity-20"></div>

      <div className="flex items-center gap-3 mb-8 relative z-10">
        <div className="w-1.5 h-8 bg-[#F97316] rounded-full"></div>
        <h2 className="text-3xl font-bebas text-[#0B0B0F] dark:text-white italic tracking-wide">
          DROP COORDINATES (ADDRESS)
        </h2>
      </div>

      <div className="space-y-8 relative z-10">
        {/* Saved Addresses Section - Intel Cards */}
        {savedAddresses.length > 0 && !useExistingAddress && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-bebas text-gray-500 dark:text-gray-400 text-xl tracking-wide">KNOWN SAFE HOUSES</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddressForm(true)}
                className="rounded-full border-[#F97316]/30 text-[10px] font-bold uppercase tracking-widest hover:border-[#F97316] hover:text-[#F97316] hover:bg-[#F97316]/10 transition-colors"
              >
                + NEW INTEL
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedAddresses.map((address) => (
                <div
                  key={address.id}
                  className={`p-6 border rounded-xl transition-all cursor-pointer group relative overflow-hidden ${selectedAddress?.id === address.id
                    ? 'border-[#F97316] bg-[#F97316]/5'
                    : 'border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 hover:border-[#F97316]/50'
                    }`}
                  onClick={() => handleSavedAddressSelect(address)}
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bebas text-xl text-[#0B0B0F] dark:text-white tracking-wide">{address.name}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-gray-100 dark:bg-white/10 px-2 py-1 rounded text-gray-500 dark:text-gray-300">
                        {address.type}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-gray-500 dark:text-gray-400 leading-relaxed uppercase">
                      {address.address_line_1}
                      {address.address_line_2 && `, ${address.address_line_2}`}<br />
                      {address.city}, {address.state} - <span className="text-[#F97316]">{address.pincode}</span>
                    </p>
                  </div>
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-[#F97316]/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Address Form */}
        {(savedAddresses.length === 0 || showAddressForm || useExistingAddress) && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {useExistingAddress && (
              <div className="flex items-center justify-between p-4 bg-[#F97316]/10 border border-[#F97316]/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#F97316] rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold uppercase tracking-wide text-[#F97316]">
                    Locked On: {selectedAddress?.name}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setUseExistingAddress(false);
                    setSelectedAddress(null);
                    setShowAddressForm(true);
                  }}
                  className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#F97316] transition-colors"
                >
                  Change Target
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="plotNumber" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Sector / Plot No. *
                </Label>
                <Input
                  id="plotNumber"
                  type="text"
                  placeholder="HOUSE NO / BUILDING"
                  value={addressDetails.plotNumber}
                  onChange={(e) => setAddressDetails({ ...addressDetails, plotNumber: e.target.value })}
                  className="h-12 bg-white dark:bg-black/20 border-gray-200 dark:border-white/10 rounded-lg focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/50 transition-all font-mono text-xs placeholder:text-gray-300 dark:placeholder:text-gray-600"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="buildingName" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Complex / Apartment
                </Label>
                <Input
                  id="buildingName"
                  type="text"
                  placeholder="APARTMENT / SUITE"
                  value={addressDetails.buildingName}
                  onChange={(e) => setAddressDetails({ ...addressDetails, buildingName: e.target.value })}
                  className="h-12 bg-white dark:bg-black/20 border-gray-200 dark:border-white/10 rounded-lg focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/50 transition-all font-mono text-xs placeholder:text-gray-300 dark:placeholder:text-gray-600"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="street" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Street / Locality Name *
              </Label>
              <Input
                id="street"
                type="text"
                placeholder="STREET NAME / LOCALITY"
                value={addressDetails.street}
                onChange={(e) => setAddressDetails({ ...addressDetails, street: e.target.value })}
                className="h-12 bg-white dark:bg-black/20 border-gray-200 dark:border-white/10 rounded-lg focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/50 transition-all font-mono text-xs placeholder:text-gray-300 dark:placeholder:text-gray-600"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <Label htmlFor="pincode" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Zip Code *
                </Label>
                <Input
                  id="pincode"
                  type="text"
                  placeholder="XXXXXX"
                  value={addressDetails.pincode}
                  onChange={(e) => setAddressDetails({ ...addressDetails, pincode: e.target.value })}
                  className="h-12 bg-white dark:bg-black/20 border-gray-200 dark:border-white/10 rounded-lg focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/50 transition-all font-mono text-xs placeholder:text-gray-300 dark:placeholder:text-gray-600"
                  maxLength={6}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="city" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  City / District *
                </Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="CITY"
                  value={addressDetails.city}
                  onChange={(e) => setAddressDetails({ ...addressDetails, city: e.target.value })}
                  className="h-12 bg-white dark:bg-black/20 border-gray-200 dark:border-white/10 rounded-lg focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/50 transition-all font-mono text-xs placeholder:text-gray-300 dark:placeholder:text-gray-600"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="state" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  State / Region *
                </Label>
                <Input
                  id="state"
                  type="text"
                  placeholder="STATE"
                  value={addressDetails.state}
                  onChange={(e) => setAddressDetails({ ...addressDetails, state: e.target.value })}
                  className="h-12 bg-white dark:bg-black/20 border-gray-200 dark:border-white/10 rounded-lg focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/50 transition-all font-mono text-xs placeholder:text-gray-300 dark:placeholder:text-gray-600"
                  required
                />
              </div>
            </div>

            {/* Delivery Estimation Display */}
            <div className="py-6 border-t border-b border-dashed border-[#F97316]/20">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Est. Arrival Time</span>
                <div className="text-right">
                  <span className="block font-bebas text-xl text-[#0B0B0F] dark:text-white">
                    {estimatedDeliveryTime || 'CALCULATING...'}
                  </span>
                  {estimatedDeliveryFee !== null && (
                    <span className="text-[10px] font-bold text-[#F97316] mt-1 block uppercase tracking-wide">
                      {estimatedDeliveryFee === 0 ? 'FREE DROP' : `SHIPPING: ${formatCurrency(estimatedDeliveryFee, settings.currency_symbol)}`}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Save Address Option */}
            {currentUser && !useExistingAddress && (
              <div className="flex items-center space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="saveAddress"
                  checked={true}
                  readOnly
                  className="rounded border-gray-300 text-[#F97316] focus:ring-[#F97316] w-4 h-4 bg-transparent"
                />
                <Label htmlFor="saveAddress" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest cursor-pointer hover:text-[#F97316] transition-colors">
                  Add to Mission Archives (Save)
                </Label>
              </div>
            )}
          </div>
        )}

        {addressErrors.length > 0 && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-mono uppercase rounded">
            {addressErrors.map((error, index) => (
              <div key={index}>• {error}</div>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center pt-6 border-t border-dashed border-[#F97316]/20 mt-8">
          <Button
            variant="ghost"
            onClick={onPrev}
            className="text-gray-400 hover:text-[#F97316] hover:bg-transparent px-0 font-bold text-xs tracking-widest uppercase hover:underline"
          >
            ← Retreat
          </Button>
          <Button
            onClick={handleNext}
            disabled={
              useExistingAddress
                ? !selectedAddress || !addressDetails.city || !addressDetails.state || !addressDetails.pincode
                : !addressDetails.plotNumber || !addressDetails.street || !addressDetails.city || !addressDetails.state || !addressDetails.pincode
            }
            className="group relative overflow-hidden bg-[#0B0B0F] dark:bg-white text-white dark:text-black font-bebas text-xl tracking-wider px-10 py-6 hover:scale-105 transition-all duration-300 rounded-lg shadow-xl shadow-[#F97316]/10 disabled:opacity-50 disabled:grayscale"
          >
            <span className="relative z-10 flex items-center gap-2">
              CONFIRM COORDINATES <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward_ios</span>
            </span>
            <div className="absolute inset-0 bg-[#F97316] transform skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutAddressDetails;