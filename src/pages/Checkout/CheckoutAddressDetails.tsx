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
    <div className="bg-[#F9F9F7] border border-gray-200 p-8 shadow-sm">
      <div className="flex items-center mb-8">
        <h2 className="text-2xl font-serif text-[#1a1a1a]">Delivery Information</h2>
      </div>

      <div className="space-y-8">
        {/* Saved Addresses Section */}
        {savedAddresses.length > 0 && !useExistingAddress && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-serif text-[#1a1a1a] text-lg">Saved Locations</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddressForm(true)}
                className="rounded-none border-gray-300 text-xs uppercase tracking-widest hover:bg-[#1a1a1a] hover:text-white transition-colors"
              >
                Add New
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {savedAddresses.map((address) => (
                <div
                  key={address.id}
                  className={`p-6 border transition-all cursor-pointer group ${selectedAddress?.id === address.id
                    ? 'border-[#1a1a1a] bg-white'
                    : 'border-gray-200 bg-white hover:border-gray-400'
                    }`}
                  onClick={() => handleSavedAddressSelect(address)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-serif text-lg text-[#1a1a1a]">{address.name}</span>
                        <span className="text-[10px] uppercase tracking-widest bg-gray-100 px-2 py-1 text-gray-500">
                          {address.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 font-light leading-relaxed">
                        {address.address_line_1}
                        {address.address_line_2 && `, ${address.address_line_2}`}<br />
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Address Form */}
        {(savedAddresses.length === 0 || showAddressForm || useExistingAddress) && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {useExistingAddress && (
              <div className="flex items-center justify-between p-4 bg-white border border-[#1a1a1a]">
                <div className="flex items-center space-x-3">
                  <span className="w-1.5 h-1.5 bg-[#1a1a1a] rounded-full"></span>
                  <span className="text-sm uppercase tracking-wide text-[#1a1a1a]">
                    Selected: {selectedAddress?.name}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setUseExistingAddress(false);
                    setSelectedAddress(null);
                    setShowAddressForm(true);
                  }}
                  className="text-xs uppercase tracking-widest text-gray-400 hover:text-[#1a1a1a] transition-colors"
                >
                  Change
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="plotNumber" className="text-xs uppercase tracking-widest text-[#1a1a1a]">
                  Address Line 1 *
                </Label>
                <Input
                  id="plotNumber"
                  type="text"
                  placeholder="HOUSE NO / BUILDING"
                  value={addressDetails.plotNumber}
                  onChange={(e) => setAddressDetails({ ...addressDetails, plotNumber: e.target.value })}
                  className="h-14 bg-white border-gray-200 focus:border-black rounded-none transition-all placeholder:text-gray-300"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="buildingName" className="text-xs uppercase tracking-widest text-[#1a1a1a]">
                  Address Line 2
                </Label>
                <Input
                  id="buildingName"
                  type="text"
                  placeholder="APARTMENT / SUITE"
                  value={addressDetails.buildingName}
                  onChange={(e) => setAddressDetails({ ...addressDetails, buildingName: e.target.value })}
                  className="h-14 bg-white border-gray-200 focus:border-black rounded-none transition-all placeholder:text-gray-300"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="street" className="text-xs uppercase tracking-widest text-[#1a1a1a]">
                Street / Area *
              </Label>
              <Input
                id="street"
                type="text"
                placeholder="STREET NAME / LOCALITY"
                value={addressDetails.street}
                onChange={(e) => setAddressDetails({ ...addressDetails, street: e.target.value })}
                className="h-14 bg-white border-gray-200 focus:border-black rounded-none transition-all placeholder:text-gray-300"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <Label htmlFor="pincode" className="text-xs uppercase tracking-widest text-[#1a1a1a]">
                  Pincode *
                </Label>
                <Input
                  id="pincode"
                  type="text"
                  placeholder="XXXXXX"
                  value={addressDetails.pincode}
                  onChange={(e) => setAddressDetails({ ...addressDetails, pincode: e.target.value })}
                  className="h-14 bg-white border-gray-200 focus:border-black rounded-none transition-all placeholder:text-gray-300"
                  maxLength={6}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="city" className="text-xs uppercase tracking-widest text-[#1a1a1a]">
                  City *
                </Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="CITY"
                  value={addressDetails.city}
                  onChange={(e) => setAddressDetails({ ...addressDetails, city: e.target.value })}
                  className="h-14 bg-white border-gray-200 focus:border-black rounded-none transition-all placeholder:text-gray-300"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="state" className="text-xs uppercase tracking-widest text-[#1a1a1a]">
                  State *
                </Label>
                <Input
                  id="state"
                  type="text"
                  placeholder="STATE"
                  value={addressDetails.state}
                  onChange={(e) => setAddressDetails({ ...addressDetails, state: e.target.value })}
                  className="h-14 bg-white border-gray-200 focus:border-black rounded-none transition-all placeholder:text-gray-300"
                  required
                />
              </div>
            </div>

            {/* Delivery Estimation Display */}
            <div className="py-6 border-t border-b border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-light">Delivery Method</span>
                <div className="text-right">
                  <span className="block font-medium text-[#1a1a1a]">
                    {estimatedDeliveryTime || 'Calculated at checkout'}
                  </span>
                  {estimatedDeliveryFee !== null && (
                    <span className="text-xs text-gray-400 mt-1 block uppercase tracking-wide">
                      {estimatedDeliveryFee === 0 ? formatCurrency(0, settings.currency_symbol) : `Fee: ${formatCurrency(estimatedDeliveryFee, settings.currency_symbol)}`}
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
                  className="rounded-none border-gray-300 text-black focus:ring-0 w-4 h-4"
                />
                <Label htmlFor="saveAddress" className="text-xs text-gray-500 uppercase tracking-wide cursor-pointer">
                  Save to address book
                </Label>
              </div>
            )}
          </div>
        )}

        {addressErrors.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
            {addressErrors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-8">
          <Button
            variant="ghost"
            onClick={onPrev}
            className="text-gray-400 hover:text-[#1a1a1a] hover:bg-transparent px-0 font-light"
          >
            ← Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={
              useExistingAddress
                ? !selectedAddress || !addressDetails.city || !addressDetails.state || !addressDetails.pincode
                : !addressDetails.plotNumber || !addressDetails.street || !addressDetails.city || !addressDetails.state || !addressDetails.pincode
            }
            className="rounded-none bg-[#1a1a1a] text-white hover:bg-black uppercase tracking-[0.2em] px-10 h-14 text-xs font-bold transition-all duration-300"
          >
            Continue to Payment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutAddressDetails;