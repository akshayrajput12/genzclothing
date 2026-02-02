import { useState, useEffect } from 'react';
import { ArrowLeft, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useStore } from '@/store/useStore';
import { formatPrice } from '@/utils/currency';
import { initiateRazorpayPayment, OrderData } from '@/utils/razorpay';

import Stepper from '@/components/Stepper';
import GuestOrderPopup from '@/components/GuestOrderPopup';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { validateContactInfo, validateAddressDetails, validatePaymentMethod } from '@/utils/validation';
import { useSettings } from '@/hooks/useSettings';
import { toNumber, formatCurrency, calculatePercentage, meetsThreshold } from '@/utils/settingsHelpers';

// Import the new components
import CheckoutContactInfo from './Checkout/CheckoutContactInfo';
import CheckoutAddressDetails from './Checkout/CheckoutAddressDetails';
import CheckoutPayment from './Checkout/CheckoutPayment';
import CheckoutSummary from './Checkout/CheckoutSummary';

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cartItems, clearCart } = useStore();
  const { settings } = useSettings();
  const [currentStep, setCurrentStep] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [useExistingAddress, setUseExistingAddress] = useState(false);
  const [showGuestOrderPopup, setShowGuestOrderPopup] = useState(false);
  const [guestOrderData, setGuestOrderData] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [estimatedDeliveryFee, setEstimatedDeliveryFee] = useState<number | null>(null);
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState<string | null>(null);
  const [isPincodeServiceable, setIsPincodeServiceable] = useState(true);

  // Form validation states
  const [contactErrors, setContactErrors] = useState<string[]>([]);
  const [addressErrors, setAddressErrors] = useState<string[]>([]);

  // Customer Information
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Address Details
  const [addressDetails, setAddressDetails] = useState({
    plotNumber: '',
    buildingName: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    addressType: 'home' as 'home' | 'work' | 'other',
    saveAs: ''
  });

  const steps = [
    { id: 'info', title: 'Contact Info', description: 'Your details' },
    { id: 'address', title: 'Address Details', description: 'Complete address' },
    { id: 'payment', title: 'Payment', description: 'Choose payment method' },
    { id: 'summary', title: 'Order Summary', description: 'Review & confirm' }
  ];

  useEffect(() => {
    fetchProductCoupons();
    fetchSavedAddresses();
    getCurrentUser();
  }, [cartItems]);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error getting current user:', error);
      setCurrentUser(null);
    }
  };

  const fetchSavedAddresses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setSavedAddresses([]);
        return;
      }

      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setSavedAddresses(data || []);
    } catch (error) {
      console.error('Error fetching saved addresses:', error);
    }
  };

  const handleSavedAddressSelect = (address: any) => {
    setSelectedAddress(address);
    setUseExistingAddress(true);

    setAddressDetails({
      plotNumber: address.address_line_1.split(',')[0] || '',
      buildingName: '',
      street: address.address_line_2 || '',
      landmark: address.landmark || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode,
      addressType: address.type,
      saveAs: address.type === 'other' ? address.name : ''
    });
  };

  const saveAddressToProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      if (savedAddresses.length >= 3) {
        toast({
          title: "Address Limit Reached",
          description: "You can only save up to 3 addresses. Please delete an existing address first.",
          variant: "destructive",
        });
        return;
      }

      const addressData = {
        user_id: user.id,
        name: addressDetails.addressType === 'other' ? addressDetails.saveAs : addressDetails.addressType,
        address_line_1: addressDetails.plotNumber,
        address_line_2: addressDetails.street,
        city: addressDetails.city,
        state: addressDetails.state,
        pincode: addressDetails.pincode,
        landmark: addressDetails.landmark,
        type: addressDetails.addressType,
        latitude: null,
        longitude: null,
        is_default: savedAddresses.length === 0
      };

      const { error } = await supabase
        .from('addresses')
        .insert([addressData]);

      if (error) throw error;

      toast({
        title: "Address Saved",
        description: "Your address has been saved to your profile for future use.",
      });

      fetchSavedAddresses();
    } catch (error) {
      console.error('Error saving address:', error);
      toast({
        title: "Error",
        description: "Failed to save address to profile.",
        variant: "destructive",
      });
    }
  };

  const fetchProductCoupons = async () => {
    try {
      const productIds = cartItems.map(item => item.id);
      if (productIds.length === 0) return;

      const { data: productCoupons, error: pcError } = await supabase
        .from('product_coupons')
        .select(`
          coupon_id,
          coupons (
            id,
            code,
            description,
            discount_type,
            discount_value,
            min_order_amount,
            max_discount_amount,
            is_active,
            valid_from,
            valid_until
          )
        `)
        .in('product_id', productIds);

      if (pcError) throw pcError;

      const productSpecificCoupons = productCoupons
        ?.map(pc => pc.coupons)
        .filter(c => c !== null && c.is_active && new Date(c.valid_until) > new Date())
        .filter((coupon, index, self) =>
          index === self.findIndex(c => c.id === coupon.id)
        ) || [];

      setAvailableCoupons(productSpecificCoupons);
    } catch (error) {
      console.error('Error fetching product coupons:', error);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (toNumber(item.price) * toNumber(item.quantity)), 0);
  const tax = calculatePercentage(subtotal, settings.tax_rate);

  useEffect(() => {
    const freeThreshold = toNumber(settings.free_delivery_threshold);
    if (subtotal >= freeThreshold) {
      setEstimatedDeliveryFee(0);
      setEstimatedDeliveryTime('Standard Delivery');
    } else {
      setEstimatedDeliveryFee(toNumber(settings.delivery_charge));
      setEstimatedDeliveryTime('2-5 business days');
    }
  }, [subtotal, settings]);

  const deliveryFee = estimatedDeliveryFee !== null ? estimatedDeliveryFee : (
    meetsThreshold(subtotal, settings.free_delivery_threshold) ? 0 : toNumber(settings.delivery_charge)
  );
  const codFee = paymentMethod === 'cod' ? toNumber(settings.cod_charge) : 0;
  const total = subtotal + tax + deliveryFee + codFee - discount;

  const isMinOrderMet = subtotal >= toNumber(settings.min_order_amount);
  const minOrderShortfall = Math.max(0, toNumber(settings.min_order_amount) - subtotal);

  const applyCoupon = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        toast({
          title: "Invalid coupon",
          description: "Please check your coupon code.",
          variant: "destructive",
        });
        return;
      }

      if (data.min_order_amount && subtotal < data.min_order_amount) {
        toast({
          title: "Minimum order not met",
          description: `Minimum order of ${settings.currency_symbol}${data.min_order_amount} required for this coupon.`,
          variant: "destructive",
        });
        return;
      }

      if (data.usage_limit && data.used_count >= data.usage_limit) {
        toast({
          title: "Coupon expired",
          description: "This coupon has reached its usage limit.",
          variant: "destructive",
        });
        return;
      }

      let discountAmount = 0;
      if (data.discount_type === 'percentage') {
        discountAmount = (subtotal * data.discount_value) / 100;
        if (data.max_discount_amount) {
          discountAmount = Math.min(discountAmount, data.max_discount_amount);
        }
      } else {
        discountAmount = data.discount_value;
      }

      setDiscount(discountAmount);
      setAppliedCoupon(data);
      toast({
        title: "Coupon applied!",
        description: `You saved ${settings.currency_symbol}${discountAmount.toFixed(2)} on your order.`,
      });
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast({
        title: "Error",
        description: "Failed to apply coupon.",
        variant: "destructive",
      });
    }
  };

  const removeCoupon = () => {
    setDiscount(0);
    setAppliedCoupon(null);
    setCouponCode('');
    toast({
      title: "Coupon removed",
      description: "Coupon has been removed from your order.",
    });
  };

  const handleNextStep = () => {
    if (subtotal < toNumber(settings.min_order_amount)) {
      toast({
        title: "Minimum Order Not Met",
        description: `Minimum order amount is ${formatCurrency(settings.min_order_amount, settings.currency_symbol)}. Please add more items to your cart.`,
        variant: "destructive",
      });
      return;
    }

    if (currentStep === 1) {
      const validation = validateContactInfo(customerInfo);
      if (!validation.isValid) {
        setContactErrors(validation.errors);
        toast({
          title: "Invalid Information",
          description: validation.errors[0],
          variant: "destructive",
        });
        return;
      }
      setContactErrors([]);
    } else if (currentStep === 2) {
      if (!addressDetails.city || !addressDetails.state || !addressDetails.pincode) {
        toast({
          title: "Missing Location Information",
          description: "Please fill in city, state, and pincode.",
          variant: "destructive",
        });
        return;
      }

      if (!useExistingAddress) {
        const validation = validateAddressDetails(addressDetails);
        if (!validation.isValid) {
          setAddressErrors(validation.errors);
          toast({
            title: "Invalid Address",
            description: validation.errors[0],
            variant: "destructive",
          });
          return;
        }
      }
      setAddressErrors([]);
    } else if (currentStep === 3) {
      const paymentValidation = validatePaymentMethod(paymentMethod, total, settings);
      if (!paymentValidation.isValid) {
        toast({
          title: "Payment Method Error",
          description: paymentValidation.errors[0],
          variant: "destructive",
        });
        return;
      }
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePlaceOrder = async () => {
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required customer information.",
        variant: "destructive",
      });
      return;
    }

    if (!addressDetails.city || !addressDetails.state) {
      toast({
        title: "Missing Location",
        description: "Please provide your city and state.",
        variant: "destructive",
      });
      return;
    }

    if (!useExistingAddress && (!addressDetails.plotNumber || !addressDetails.street)) {
      toast({
        title: "Missing Address",
        description: "Please provide your complete address details.",
        variant: "destructive",
      });
      return;
    }

    if (!addressDetails.pincode) {
      toast({
        title: "Missing Pincode",
        description: "Please enter your area pincode.",
        variant: "destructive",
      });
      return;
    }

    if (subtotal < Number(settings.min_order_amount)) {
      toast({
        title: "Minimum Order Not Met",
        description: `Minimum order amount is ${settings.currency_symbol}${Number(settings.min_order_amount).toFixed(2)}. Please add more items.`,
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === 'cod') {
      if (!settings.cod_enabled) {
        toast({
          title: "COD Not Available",
          description: "Cash on Delivery is currently not available.",
          variant: "destructive",
        });
        return;
      }

      if (total > Number(settings.cod_threshold)) {
        toast({
          title: "COD Limit Exceeded",
          description: `Cash on Delivery is not available for orders above ${settings.currency_symbol}${Number(settings.cod_threshold).toFixed(2)}. Please choose online payment.`,
          variant: "destructive",
        });
        return;
      }
    }

    setIsProcessingPayment(true);

    try {
      const orderNumber = `SS${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const completeAddress = `${addressDetails.plotNumber}, ${addressDetails.buildingName ? addressDetails.buildingName + ', ' : ''}${addressDetails.street}, ${addressDetails.landmark ? 'Near ' + addressDetails.landmark + ', ' : ''}${addressDetails.city}, ${addressDetails.state} - ${addressDetails.pincode}`;
      const { data: { user } } = await supabase.auth.getUser();

      const orderData = {
        user_id: user?.id || null,
        order_number: orderNumber,
        customer_info: customerInfo as any,
        delivery_location: { address: completeAddress } as any,
        address_details: {
          ...addressDetails,
          complete_address: completeAddress,
          latitude: null,
          longitude: null
        } as any,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          weight: item.weight,
          image: item.image,
          category: item.category || 'bulk',
          selected_size: item.selectedSize || 'Standard'
        })) as any,
        subtotal: subtotal,
        tax: tax,
        delivery_fee: deliveryFee,
        cod_fee: codFee,
        discount: discount,
        total: total,
        payment_method: paymentMethod,
        coupon_code: appliedCoupon?.code || null,
        selected_size: cartItems.map(item => item.selectedSize || 'Standard').join(', ')
      };

      if (paymentMethod === 'cod') {
        const codOrderData = {
          ...orderData,
          payment_status: 'pending',
          order_status: 'placed'
        };

        const { error: dbError } = await supabase
          .from('orders')
          .insert([codOrderData])
          .select()
          .single();

        if (dbError) throw new Error(`Database error: ${dbError.message}`);

        if (!useExistingAddress && currentUser) {
          await saveAddressToProfile();
        }

        if (appliedCoupon) {
          await supabase
            .from('coupons')
            .update({ used_count: appliedCoupon.used_count + 1 })
            .eq('id', appliedCoupon.id);
        }

        if (!currentUser) {
          const guestOrder = {
            orderNumber: orderNumber,
            customerInfo: customerInfo,
            items: cartItems.map(item => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              weight: item.weight,
              image: item.image,
              category: item.category || 'bulk'
            })),
            subtotal: subtotal,
            tax: tax,
            deliveryFee: deliveryFee,
            estimatedDeliveryTime: estimatedDeliveryTime,
            codFee: codFee,
            discount: discount,
            total: total,
            paymentMethod: paymentMethod,
            paymentStatus: 'pending',
            deliveryAddress: {
              plotNumber: addressDetails.plotNumber,
              buildingName: addressDetails.buildingName,
              street: addressDetails.street,
              city: addressDetails.city,
              state: addressDetails.state,
              pincode: addressDetails.pincode,
              landmark: addressDetails.landmark
            },
            orderDate: new Date().toISOString(),
            couponCode: appliedCoupon?.code
          };

          setGuestOrderData(guestOrder);
          setShowGuestOrderPopup(true);

          toast({
            title: "Order Placed Successfully!",
            description: `Your COD order #${orderNumber} has been placed. Please save the order details as you won't be able to view them again.`,
          });
        } else {
          toast({
            title: "Order Placed Successfully!",
            description: `Your COD order #${orderNumber} has been placed. You'll pay ${settings.currency_symbol}${total.toFixed(2)} on delivery.`,
          });

          navigate('/profile?tab=orders');
        }

        clearCart();
      } else {
        const razorpayOrderData: OrderData = {
          orderId: orderNumber,
          amount: Math.round(total),
          currency: 'INR',
          items: cartItems,
          customerInfo,
          deliveryAddress: {
            address: completeAddress,
            lat: 0,
            lng: 0
          }
        };

        await initiateRazorpayPayment(
          razorpayOrderData,
          async (response) => {
            try {
              const onlineOrderData = {
                ...orderData,
                payment_status: 'paid',
                order_status: 'confirmed',
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id
              };

              const { data: savedOrder, error: dbError } = await supabase
                .from('orders')
                .insert([onlineOrderData])
                .select()
                .single();

              if (dbError) throw new Error(`Database error: ${dbError.message}`);

              if (!useExistingAddress && currentUser) {
                await saveAddressToProfile();
              }

              if (appliedCoupon) {
                await supabase
                  .from('coupons')
                  .update({ used_count: appliedCoupon.used_count + 1 })
                  .eq('id', appliedCoupon.id);
              }

              if (!currentUser) {
                const guestOrder = {
                  orderNumber: orderNumber,
                  customerInfo: customerInfo,
                  items: cartItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    weight: item.weight,
                    image: item.image,
                    category: item.category || 'bulk',
                    selected_size: item.selectedSize || 'Standard'
                  })),
                  subtotal: subtotal,
                  tax: tax,
                  deliveryFee: deliveryFee,
                  estimatedDeliveryTime: estimatedDeliveryTime,
                  codFee: codFee,
                  discount: discount,
                  total: total,
                  paymentMethod: paymentMethod,
                  paymentStatus: 'paid',
                  deliveryAddress: {
                    plotNumber: addressDetails.plotNumber,
                    buildingName: addressDetails.buildingName,
                    street: addressDetails.street,
                    city: addressDetails.city,
                    state: addressDetails.state,
                    pincode: addressDetails.pincode,
                    landmark: addressDetails.landmark
                  },
                  orderDate: new Date().toISOString(),
                  couponCode: appliedCoupon?.code
                };

                setGuestOrderData(guestOrder);
                setShowGuestOrderPopup(true);

                toast({
                  title: "Payment Successful!",
                  description: `Order #${orderNumber} confirmed and paid. Please save the order details as you won't be able to view them again.`,
                });
              } else {
                toast({
                  title: "Payment Successful!",
                  description: `Order #${orderNumber} confirmed and paid. Your bulk order is being processed.`,
                });

                navigate('/profile?tab=orders');
              }

              clearCart();
            } catch (error) {
              console.error('Post-payment processing error:', error);
              toast({
                title: "Order Processing Error",
                description: "Payment successful but order processing failed. Please contact support.",
                variant: "destructive",
              });
            }
          },
          (error) => {
            console.error('Payment error:', error);
            toast({
              title: "Payment Failed",
              description: error.message || "Payment was cancelled or failed. Please try again.",
              variant: "destructive",
            });
          }
        );
      }
    } catch (error) {
      console.error('Order logic error:', error);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (cartItems.length === 0 && !showGuestOrderPopup) {
    return (
      <div className="container mx-auto px-4 py-20 text-center bg-[#F9F9F7] min-h-screen flex flex-col justify-center items-center">
        <h2 className="text-4xl font-serif text-[#1a1a1a] mb-6">Your bag is empty</h2>
        <p className="text-gray-500 mb-10 font-light text-lg">Add some luxurious items to your collection.</p>
        <Button onClick={() => navigate('/products')} className="bg-[#1a1a1a] text-white rounded-none uppercase tracking-widest px-12 py-6 text-sm hover:bg-black transition-all">
          Start Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-[#F9F9F7] min-h-screen py-16">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1400px]">

        {/* Header */}
        <div className="flex items-center justify-between mb-16 border-b border-gray-200 pb-6">
          <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => navigate('/cart')}>
            <div className="flex items-center text-[#1a1a1a] hover:text-black transition-colors group">
              <ArrowLeft className="mr-3 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="uppercase tracking-widest text-xs font-bold">Back to Bag</span>
            </div>
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-serif text-[#1a1a1a]">Secure Checkout</h1>
          </div>
          <div className="w-24"></div> {/* Spacer for balance */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main Checkout Section */}
          <div className="lg:col-span-8 space-y-12">
            <Stepper steps={steps} currentStep={currentStep} className="mb-12" />

            <div className="bg-transparent animate-in fade-in slide-in-from-bottom-4 duration-700">
              {currentStep === 1 && (
                <CheckoutContactInfo
                  customerInfo={customerInfo}
                  setCustomerInfo={setCustomerInfo}
                  onNext={handleNextStep}
                  errors={contactErrors}
                />
              )}

              {currentStep === 2 && (
                <CheckoutAddressDetails
                  addressDetails={addressDetails}
                  setAddressDetails={setAddressDetails}
                  savedAddresses={savedAddresses}
                  selectedAddress={selectedAddress}
                  setSelectedAddress={setSelectedAddress}
                  useExistingAddress={useExistingAddress}
                  setUseExistingAddress={setUseExistingAddress}
                  showAddressForm={showAddressForm}
                  setShowAddressForm={setShowAddressForm}
                  settings={settings}
                  subtotal={subtotal}
                  currentUser={currentUser}
                  onNext={handleNextStep}
                  onPrev={handlePrevStep}
                  estimatedDeliveryFee={estimatedDeliveryFee}
                  setEstimatedDeliveryFee={setEstimatedDeliveryFee}
                  estimatedDeliveryTime={estimatedDeliveryTime}
                  setEstimatedDeliveryTime={setEstimatedDeliveryTime}
                  cartItems={cartItems}
                  isPincodeServiceable={isPincodeServiceable}
                  setIsPincodeServiceable={setIsPincodeServiceable}
                />
              )}

              {currentStep === 3 && (
                <CheckoutPayment
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  settings={settings}
                  total={total}
                  onNext={handleNextStep}
                  onPrev={handlePrevStep}
                />
              )}

              {currentStep === 4 && (
                <CheckoutSummary
                  customerInfo={customerInfo}
                  addressDetails={addressDetails}
                  paymentMethod={paymentMethod}
                  cartItems={cartItems}
                  subtotal={subtotal}
                  tax={tax}
                  deliveryFee={deliveryFee}
                  codFee={codFee}
                  discount={discount}
                  total={total}
                  settings={settings}
                  isMinOrderMet={isMinOrderMet}
                  minOrderShortfall={minOrderShortfall}
                  isProcessingPayment={isProcessingPayment}
                  estimatedDeliveryFee={estimatedDeliveryFee}
                  estimatedDeliveryTime={estimatedDeliveryTime}
                  couponCode={couponCode}
                  setCouponCode={setCouponCode}
                  appliedCoupon={appliedCoupon}
                  setAppliedCoupon={setAppliedCoupon}
                  availableCoupons={availableCoupons}
                  onPlaceOrder={handlePlaceOrder}
                  onPrev={handlePrevStep}
                  onApplyCoupon={applyCoupon}
                  onRemoveCoupon={removeCoupon}
                  isPincodeServiceable={true}
                />
              )}
            </div>
          </div>

          {/* Quick Order Summary Sidebar (Visible on large screens) */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="bg-white border border-gray-200 p-10 sticky top-32 shadow-sm transition-all hover:shadow-md">
              <h3 className="font-serif text-2xl text-[#1a1a1a] mb-8 pb-4 border-b border-gray-100">Order Summary</h3>
              <div className="space-y-6">
                <div className="max-h-[400px] overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-gray-200">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-6 group">
                      <div className="w-20 h-24 bg-[#F9F9F7] shrink-0 overflow-hidden relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                      <div className="flex-1 min-w-0 py-1">
                        <p className="font-serif text-[#1a1a1a] truncate text-lg">{item.name}</p>
                        <p className="text-xs text-gray-400 mt-2 uppercase tracking-wide">{item.quantity} x {formatPrice(item.price)}</p>
                      </div>
                      <div className="text-right py-1">
                        <p className="font-medium text-[#1a1a1a]">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-6 bg-gray-100" />

                <div className="space-y-3 text-sm font-light text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-[#1a1a1a] font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-[#1a1a1a] font-medium">{deliveryFee === 0 ? 'Complimentary' : formatPrice(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes</span>
                    <span className="text-[#1a1a1a] font-medium">{formatPrice(tax)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-end pt-6 border-t border-black mt-6">
                    <span className="text-[#1a1a1a] font-serif text-lg">Total</span>
                    <span className="text-[#1a1a1a] font-serif text-2xl">{formatPrice(total)}</span>
                  </div>
                  <div className="text-right text-xs text-gray-400 mt-1 uppercase tracking-wider">Inclusive of all taxes</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <GuestOrderPopup
          isOpen={showGuestOrderPopup}
          onClose={() => {
            setShowGuestOrderPopup(false);
            if (currentUser) {
              navigate('/profile?tab=orders');
            } else {
              navigate('/');
            }
          }}
          orderData={guestOrderData}
        />
      </div>
    </div>
  );
};

export default Checkout;