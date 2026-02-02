import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/utils/currency';
import { toNumber, formatCurrency } from '@/utils/settingsHelpers';

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

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

interface CheckoutSummaryProps {
  customerInfo: ContactInfo;
  addressDetails: AddressDetails;
  paymentMethod: string;
  cartItems: any[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  codFee: number;
  discount: number;
  total: number;
  settings: any;
  isMinOrderMet: boolean;
  minOrderShortfall: number;
  isProcessingPayment: boolean;
  estimatedDeliveryFee: number | null;
  estimatedDeliveryTime: string | null;
  couponCode: string;
  setCouponCode: (code: string) => void;
  appliedCoupon: any;
  setAppliedCoupon: (coupon: any) => void;
  availableCoupons: any[];
  onPlaceOrder: () => void;
  onPrev: () => void;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
  isPincodeServiceable: boolean; // Add this prop
}

const CheckoutSummary = ({
  customerInfo,
  addressDetails,
  paymentMethod,
  cartItems,
  subtotal,
  tax,
  deliveryFee,
  codFee,
  discount,
  total,
  settings,
  isMinOrderMet,
  minOrderShortfall,
  isProcessingPayment,
  estimatedDeliveryFee,
  estimatedDeliveryTime,
  couponCode,
  setCouponCode,
  appliedCoupon,
  setAppliedCoupon,
  availableCoupons,
  onPlaceOrder,
  onPrev,
  onApplyCoupon,
  onRemoveCoupon,
  isPincodeServiceable // Add this prop
}: CheckoutSummaryProps) => {
  return (
    <div className="space-y-6">
      {/* Order Summary Header */}
      <div className="space-y-8">
        {/* Order Items */}
        <div className="bg-[#F9F9F7] border border-gray-200 p-8 shadow-sm">
          <h2 className="text-xl font-serif text-[#1a1a1a] mb-6">Your Selection ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})</h2>
          <div className="divide-y divide-gray-100">
            {cartItems.map((item) => (
              <div key={`${item.id}-${item.selectedSize}`} className="py-6 flex items-start space-x-6">
                <div className="w-20 h-24 bg-gray-100 overflow-hidden shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-[#1a1a1a] text-lg truncate">{item.name}</h3>
                  <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">
                    Size: {item.selectedSize || 'Standard'} • {item.weight} • Qty: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-[#1a1a1a] font-serif">{formatPrice(item.price * item.quantity)}</p>
                  <p className="text-xs text-gray-400 mt-1 font-light">
                    {formatPrice(item.price)} each
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Details Summary */}
          <div className="bg-[#F9F9F7] border border-gray-200 p-8 shadow-sm h-fit">
            <h3 className="font-serif text-lg text-[#1a1a1a] mb-6">Shipping Details</h3>
            <div className="space-y-6 text-sm font-light text-gray-600">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Contact</p>
                <p className="text-[#1a1a1a]">{customerInfo.name}</p>
                <p>{customerInfo.email}</p>
                <p>{customerInfo.phone}</p>
              </div>
              <Separator className="bg-gray-100" />
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Shipping To</p>
                <p className="text-[#1a1a1a]">
                  {addressDetails.plotNumber}
                  {addressDetails.buildingName && `, ${addressDetails.buildingName}`}
                </p>
                <p>
                  {addressDetails.street}
                  {addressDetails.landmark && `, Near ${addressDetails.landmark}`}
                </p>
                <p>
                  {addressDetails.city}, {addressDetails.state} - {addressDetails.pincode}
                </p>
              </div>
              <Separator className="bg-gray-100" />
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Method</p>
                <p className="text-[#1a1a1a]">{paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
              </div>
            </div>
          </div>

          {/* Order Totals & Coupon */}
          <div className="bg-[#1a1a1a] text-white p-8 shadow-sm h-fit">
            <h3 className="font-serif text-lg text-white mb-6">Order Summary</h3>

            <div className="space-y-4 text-sm font-light text-gray-300">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="text-white">{deliveryFee === 0 ? 'Complimentary' : formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes</span>
                <span className="text-white">{formatPrice(tax)}</span>
              </div>
              {paymentMethod === 'cod' && Number(settings.cod_charge) > 0 && (
                <div className="flex justify-between">
                  <span>COD Fee</span>
                  <span className="text-white">{formatPrice(codFee)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}

              <div className="pt-6 border-t border-gray-800 my-4">
                <div className="flex justify-between items-end">
                  <span className="font-serif text-xl">Total</span>
                  <div className="text-right">
                    <span className="block text-2xl font-serif">{formatPrice(total)}</span>
                    <span className="text-xs text-gray-500 mt-1">Inclusive of all taxes</span>
                  </div>
                </div>
              </div>

              {/* Sub-total warning */}
              {subtotal < toNumber(settings.min_order_amount) && (
                <div className="bg-red-900/20 border border-red-900/30 p-3 mt-4 text-center">
                  <p className="text-red-400 text-xs tracking-wide uppercase">
                    Minimum Order: {formatCurrency(settings.min_order_amount, settings.currency_symbol)}
                  </p>
                </div>
              )}

              {/* Coupon Section */}
              <div className="pt-6 mt-2">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-gray-800 border border-gray-700">
                    <div>
                      <span className="text-sm font-medium text-white block">
                        {appliedCoupon.code}
                      </span>
                      <span className="text-xs text-green-400 block mt-0.5">Applied Successfully</span>
                    </div>
                    <button onClick={onRemoveCoupon} className="text-gray-400 hover:text-white text-xs uppercase tracking-wider">
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Input
                      placeholder="COUPON CODE"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="bg-transparent border-gray-700 text-white placeholder:text-gray-600 rounded-none focus:border-white h-10 text-xs uppercase tracking-wide"
                    />
                    <Button
                      onClick={onApplyCoupon}
                      className="bg-white text-black hover:bg-gray-200 rounded-none text-xs uppercase font-bold px-6 h-10"
                    >
                      Apply
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={onPlaceOrder}
              size="lg"
              className="w-full mt-8 rounded-none bg-white text-black hover:bg-gray-200 uppercase tracking-[0.2em] h-14 text-xs font-bold transition-all duration-300"
              disabled={isProcessingPayment || !isMinOrderMet || !isPincodeServiceable}
            >
              {isProcessingPayment ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-black"></div>
                  <span>Processing...</span>
                </div>
              ) : !isMinOrderMet ? (
                <span>Add {formatCurrency(minOrderShortfall, settings.currency_symbol)} More</span>
              ) : !isPincodeServiceable ? (
                <span>Not Serviceable</span>
              ) : (
                <span>Pay {formatPrice(total)}</span>
              )}
            </Button>

            {!isPincodeServiceable && (
              <p className="text-red-400 text-xs text-center mt-3 uppercase tracking-wide">
                Delivery not available to pincode {addressDetails.pincode}
              </p>
            )}
          </div>
        </div>

        <div className="text-center pt-8">
          <Button
            variant="ghost"
            onClick={onPrev}
            className="text-gray-400 hover:text-[#1a1a1a] hover:bg-transparent px-0 font-light hover:underline"
          >
            ← Back to Payment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSummary;