/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import {
  Minus,
  Plus,
  Trash2,
  Clock,
  //MapPin,
  CreditCard,
  Truck,
  Gift,
 // CalendarClock,
  AlertCircle,
  ShoppingBag,
  ChevronRight,
  Sparkles,
  Shield,
  Tag,
  CheckCircle2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import AddonItemsByCategory from "@/components/AddonItemsByCategory"

import DeliveryForm from "@/components/DeliveryForm";
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface DeliverySlot {
  id: string;
  time: string;
  available: boolean;
}

interface Address {
  _id: string;
  type: string;
  isDefault: boolean;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export default function PremiumCheckout() {
  const { cart, getCartTotal, clearCart, updateQuantity, updateCakeMessage,removeFromCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<number>(1);
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();

  // Enhanced state management
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "Noida",
    state: "Utter Pradesh",
    zipCode: "",
    country: "India",
    phone: "",
    specialInstructions: "",
    deliveryDate:"",
    deliverySlot:"",
    isGift:false,
    giftMessage:""


  });

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [couponCode, setCouponCode] = useState("");
  //const [deliveryDate, setDeliveryDate] = useState<string>("");
  const [deliverySlot] = useState<string>("");
  //const [isGift, setIsGift] = useState(false);
  const [giftMessage] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  // Delivery slots
  const deliverySlots: DeliverySlot[] = useMemo(() => [
    { id: "morning", time: "9:00 AM - 12:00 PM", available: true },
    { id: "afternoon", time: "12:00 PM - 3:00 PM", available: true },
    { id: "evening", time: "3:00 PM - 6:00 PM", available: true },
  ], []);

  // Calculate available delivery dates (next 7 days)
  const availableDeliveryDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      });
    }
    return dates;
  }, []);

  // Calculate order summary
  const orderSummary = useMemo(() => {
    const subtotal = getCartTotal();
    const discount = appliedCoupon?.discountAmount || 0;
    const deliveryFee = subtotal > 1000 ? 0 : 50;
    const total = subtotal - discount + deliveryFee;

    return {
      subtotal,
      discount,
      deliveryFee,
      total
    };
  }, [getCartTotal, appliedCoupon]);

  // Fetch user details and saved addresses
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user) return;

      try {
        //we ca also call more than one
        // const [userResponse, addressesResponse] = await Promise.all([
        //   fetch(`/api/user/${session.user.id}`),
        //   fetch(`/api/user/${session.user.id}/addresses`)
        // ]);
        const response = await fetch(`/api/user/${session.user.id}`);//,


        if (response.ok) {
          const userData = await response.json();
          //const addressesData = await addressesResponse.json();
         // const addressesData = userData;
//console.log(addressesData)
//console.log(addressesData.user.addresses)
setFormData(prev => ({
            ...prev,
            name: userData?.user?.username || "",
            email: userData?.user?.email || "",
            phone: userData?.user?.addresses?.find((addr: Address) => addr.isDefault)?.phone || ""
          }));
       //   console.log(userData.addresses)
          setSavedAddresses(userData?.user?.addresses);
          const defaultAddress = userData?.user?.addresses?.find((addr: Address) => addr.isDefault);
          //console.log(defaultAddress)
          if (defaultAddress) {
            setSelectedAddress(defaultAddress._id);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch user data. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchUserData();
  }, [session, toast]);

  // // Handle input changes
  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  //   const { name, value } = e.target;
  //   setFormData(prev => ({ ...prev, [name]: value }));
  // };

  // Handle quantity changes
  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };
  const handleCakeMessageChange = (id: string, message: string) => {
    updateCakeMessage(id, message)
  }
  // Handle coupon application
  const handleApplyCoupon = async () => {
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, orderTotal: getCartTotal() }),
      });

      const data = await response.json();
      if (response.ok) {
        setAppliedCoupon({ code: data.couponCode, discountAmount: data.discountAmount });
        toast({
          title: "Success",
          description: `Coupon applied successfully! You saved ₹${data.discountAmount.toFixed(2)}`,
        });
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast({
        title: "Error",
        description: "Failed to apply coupon. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle address selection
  const handleAddressSelect = (addressId: string) => {
    const selected = savedAddresses.find(addr => addr._id === addressId);
   // console.log(selected)
    if (selected) {
      setSelectedAddress(addressId);
      setFormData(prev => ({
        ...prev,
        address: selected.street,
        city: selected.city,
        state: selected.state,
        zipCode: selected.zipCode,
        country: selected.country,
      }));
    }
  };
   // Handle form data changes
   const handleFormDataChange = (data: any) => {
    setFormData(data);
  };

  // Validate current step
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Cart review
        return cart.length > 0;
      case 2: // Delivery details
        return !!(formData.address && formData.city && formData.state && formData.zipCode && formData.phone && formData.deliveryDate && deliverySlot);
      case 3: // Payment
        return true;
      default:
        return false;
    }
  };

  // Handle step navigation
  const handleNextStep = () => {
    if (validateStep(checkoutStep)) {
      setCheckoutStep(prev => prev + 1);
    } else {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in all required fields to proceed.",
        variant: "destructive",
      });
    }
  };

  // Initialize Razorpay payment
  const initializeRazorpayPayment = async (orderData: any) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create order');

      const { razorpayOrder } = data;
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: "INR",
        name: "The Cake Shop",
        description: "Payment for your order",
        order_id: razorpayOrder.id,
        handler: async function (response: any) {
          const verifyResponse = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyResponse.json();
          if (!verifyResponse.ok) {
            throw new Error(verifyData.error || 'Payment verification failed');
          }

          clearCart();
          toast({
            title: "Order Successful!",
            description: "Thank you for your purchase. You'll receive a confirmation email shortly.",
          });
          router.push("/my-orders");
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#FF9494",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Error initializing Razorpay payment:", error);
      toast({
        title: "Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    if (!session) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to place an order.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Check delivery availability
    try {
      const deliveryCheck = await fetch("/api/check-delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: formData.zipCode }),
      });

      const deliveryData = await deliveryCheck.json();
      if (!deliveryCheck.ok || !deliveryData.deliverable) {
        toast({
          title: "Delivery Unavailable",
          description: deliveryData.message || "We cannot deliver to your location.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const orderData = {
        orderItems: cart
        .filter(item => item.caketype !== 'addon') // Get only cakes & pastries
        .map(item => ({
          productId: item.id,
          name: item.name,
          caketype: item.caketype,
          quantity: item.quantity,
          price: item.price,
          weight: item.weight,
          image: item.image,
          cakeMessage: item.cakeMessage,
        })),
        addonItems: cart
        .filter(item => item.caketype === 'addon') // Get only addon items
        .map(item => ({
          addonId: item.id,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: orderSummary.total,
        paymentMethod,
        shippingAddress: formData,
        deliveryDate:formData?.deliveryDate,
        deliverySlot:formData?.deliverySlot,
        isGift:formData?.isGift,
        giftMessage: formData?.isGift ? giftMessage : "",
        couponCode: appliedCoupon?.code,
        discountAmount: appliedCoupon?.discountAmount,
      };

      if (paymentMethod === "Online Payment") {
        await initializeRazorpayPayment(orderData);
      } else {
       // console.log(orderData)
        const orderResponse = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        });

        if (orderResponse.ok) {
          clearCart();
          toast({
            title: "Order Successful!",
            description: "Thank you for your purchase. You'll receive a confirmation email shortly.",
          });
          router.push("/my-orders");
        } else {
          throw new Error("Failed to place order");
        }
      }
    } catch (error) {
      console.error("Error processing order:", error);
      toast({
        title: "Error",
        description: "Failed to process your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step configuration
  const steps = [
    { number: 1, label: "Review Cart", icon: ShoppingBag },
    { number: 2, label: "Delivery", icon: Truck },
    { number: 3, label: "Payment", icon: CreditCard },
  ];

  // Render premium step indicator
  const renderProgress = () => (
    <div className="mb-10">
      {/* Progress bar track */}
      <div className="relative mb-8">
        <div className="absolute top-5 left-0 right-0 h-[3px] bg-gray-100 rounded-full" />
        <Progress
          value={(checkoutStep / 3) * 100}
          className="absolute top-5 left-0 right-0 h-[3px] [&>div]:bg-gradient-to-r [&>div]:from-[#FF9494] [&>div]:to-[#FFB4B4] [&>div]:transition-all [&>div]:duration-500"
        />

        {/* Step circles */}
        <div className="relative flex justify-between">
          {steps.map((step) => {
            const isCompleted = checkoutStep > step.number;
            const isActive = checkoutStep === step.number;
            const StepIcon = step.icon;

            return (
              <div key={step.number} className="flex flex-col items-center">
                <div
                  className={`
                    relative z-10 flex items-center justify-center w-10 h-10 rounded-full
                    transition-all duration-300 border-2
                    ${isCompleted
                      ? "bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] border-transparent text-white shadow-glow"
                      : isActive
                        ? "bg-white border-[#FF9494] text-[#FF9494] shadow-glow"
                        : "bg-white border-gray-200 text-gray-400"
                    }
                  `}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <StepIcon className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={`
                    mt-2.5 text-xs font-medium tracking-wide transition-colors duration-300
                    ${isCompleted || isActive ? "text-brand-text" : "text-gray-400"}
                  `}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Render cart items
  const renderCartItems = () => (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-brand-cream/60 to-white pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] text-white">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="font-display text-xl text-brand-text">Order Summary</CardTitle>
              <CardDescription className="text-brand-text-secondary mt-0.5">
                {cart.length} {cart.length === 1 ? "item" : "items"} in your cart
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-[340px]">
            <div className="divide-y divide-gray-50">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-start gap-4 p-5 hover:bg-brand-cream/20 transition-all duration-300"
                >
                  {/* Product image */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-[72px] h-[72px] object-cover rounded-xl shadow-sm ring-1 ring-gray-100"
                    />
                    {item.quantity > 1 && (
                      <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] text-white border-0 text-[10px] font-bold shadow-sm px-1.5 py-0.5">
                        x{item.quantity}
                      </Badge>
                    )}
                  </div>

                  {/* Product details */}
                  <div className="flex-grow min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display font-semibold text-brand-text text-[15px] leading-tight truncate">
                        {item.name}
                      </h3>
                      <p className="font-display font-bold text-brand-pink text-[15px] whitespace-nowrap">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-brand-text-secondary">
                      {item.caketype !== "addon" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-brand-cream text-brand-text text-[11px] font-medium">
                          {item.caketype === "cake" ? "Weight" : "Pieces"}: {item.weight}
                          {item.caketype === "cake" ? "Kg" : ""}
                        </span>
                      )}
                      <span className="text-[11px]">₹{item.price.toFixed(2)} each</span>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 rounded-lg border-gray-200 hover:border-brand-pink hover:text-brand-pink transition-all duration-300"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-semibold text-brand-text">
                          {item.quantity}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 rounded-lg border-gray-200 hover:border-brand-pink hover:text-brand-pink transition-all duration-300"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="text-xs">Remove item</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {/* Cake message input */}
                    {item.caketype !== 'pastries' && item.caketype !== "addon" && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
                        <label htmlFor={`cakeMessage-${item.id}`} className="text-xs font-medium text-brand-text-secondary whitespace-nowrap">
                          Cake Message
                        </label>
                        <Input
                          id={`cakeMessage-${item.id}`}
                          type="text"
                          value={item.cakeMessage}
                          onChange={(e) => handleCakeMessageChange(item.id, e.target.value)}
                          minLength={20}
                          className="w-full sm:w-56 h-8 text-xs rounded-xl border-gray-200 focus:border-brand-pink focus:ring-brand-pink/20 transition-all duration-300 placeholder:text-gray-300"
                          placeholder="Write a message on the cake..."
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Coupon and pricing section */}
          <div className="border-t border-gray-100 p-5 space-y-4">
            {/* Coupon input */}
            <div className="flex items-center gap-2">
              <div className="relative flex-grow">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="pl-10 h-10 rounded-xl border-gray-200 focus:border-brand-pink focus:ring-brand-pink/20 transition-all duration-300 text-sm"
                />
              </div>
              <Button
                type="button"
                onClick={handleApplyCoupon}
                disabled={!couponCode || isLoading}
                className="h-10 px-5 rounded-xl bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] hover:shadow-glow text-white border-0 font-medium text-sm transition-all duration-300"
              >
                Apply
              </Button>
            </div>

            {appliedCoupon && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <Gift className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <p className="text-sm text-emerald-700 font-medium">
                  &quot;{appliedCoupon.code}&quot; applied &mdash; You saved ₹{appliedCoupon.discountAmount.toFixed(2)}!
                </p>
              </div>
            )}

            <Separator className="bg-gray-100" />

            {/* Price breakdown */}
            <div className="space-y-2.5">
              <div className="flex justify-between text-sm text-brand-text-secondary">
                <span>Subtotal</span>
                <span className="font-medium text-brand-text">₹{orderSummary.subtotal.toFixed(2)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-600">Discount</span>
                  <span className="font-medium text-emerald-600">-₹{orderSummary.discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm text-brand-text-secondary">
                <span>Delivery Fee</span>
                <span>
                  {orderSummary.deliveryFee === 0 ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                      <Sparkles className="h-3 w-3" /> FREE
                    </span>
                  ) : (
                    <span className="font-medium text-brand-text">₹{orderSummary.deliveryFee.toFixed(2)}</span>
                  )}
                </span>
              </div>

              <Separator className="bg-gray-100" />

              <div className="flex justify-between items-center pt-1">
                <span className="font-display font-bold text-brand-text text-lg">Total</span>
                <span className="font-display font-bold text-brand-pink text-xl">
                  ₹{orderSummary.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Free delivery nudge */}
            {orderSummary.subtotal < 1000 && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-brand-cream/50 border border-brand-cream">
                <AlertCircle className="h-4 w-4 text-brand-pink flex-shrink-0 mt-0.5" />
                <p className="text-sm text-brand-text">
                  Add items worth <span className="font-semibold text-brand-pink">₹{(1000 - orderSummary.subtotal).toFixed(2)}</span> more for free delivery!
                </p>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-5 pt-0">
          <Button
            className="w-full h-12 rounded-xl bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] hover:shadow-glow text-white font-semibold text-[15px] border-0 transition-all duration-300 group"
            onClick={handleNextStep}
            disabled={cart.length === 0}
          >
            Continue to Delivery
            <ChevronRight className="ml-1.5 h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-300" />
          </Button>
        </CardFooter>
      </Card>

      {/* Addon items */}
      <div>
        <AddonItemsByCategory />
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      {renderProgress()}

      {cart.length === 0 ? (
        <Card className="text-center py-16 rounded-2xl shadow-soft border border-gray-100 bg-white animate-scale-in">
          <CardContent className="space-y-5">
            <div className="mx-auto w-20 h-20 rounded-full bg-brand-cream flex items-center justify-center">
              <ShoppingBag className="w-9 h-9 text-brand-pink" />
            </div>
            <CardTitle className="font-display text-2xl text-brand-text">Your cart is empty</CardTitle>
            <CardDescription className="text-brand-text-secondary text-base max-w-sm mx-auto">
              Add some delicious items to your cart and come back!
            </CardDescription>
            <Button
              onClick={() => router.push('/cakes')}
              className="mt-2 h-11 px-8 rounded-xl bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] hover:shadow-glow text-white font-semibold border-0 transition-all duration-300"
            >
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Cart Review */}
          {checkoutStep === 1 && renderCartItems()}

          {/* Step 2: Delivery Details */}
          {checkoutStep === 2 && (
            <DeliveryForm
              formData={formData}
              onFormDataChange={handleFormDataChange}
              savedAddresses={savedAddresses}
              selectedAddress={selectedAddress}
              onAddressSelect={handleAddressSelect}
              availableDeliveryDates={availableDeliveryDates}
              deliverySlots={deliverySlots}
              setCheckoutStep={setCheckoutStep}
            />
          )}

          {/* Step 3: Payment */}
          {checkoutStep === 3 && (
            <Card className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden animate-fade-in">
              <CardHeader className="bg-gradient-to-r from-brand-cream/60 to-white pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] text-white">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="font-display text-xl text-brand-text">Payment Method</CardTitle>
                    <CardDescription className="text-brand-text-secondary mt-0.5">
                      Choose your preferred payment method
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5">
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="space-y-3"
                >
                  {/* COD option */}
                  <div
                    className={`
                      flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300
                      ${paymentMethod === "Cash on Delivery"
                        ? "border-brand-pink bg-brand-cream/30 shadow-sm"
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/50"
                      }
                    `}
                    onClick={() => setPaymentMethod("Cash on Delivery")}
                  >
                    <RadioGroupItem value="Cash on Delivery" id="cod" className="border-brand-pink text-brand-pink" />
                    <Label htmlFor="cod" className="flex-grow cursor-pointer">
                      <div className="font-semibold text-brand-text text-[15px]">Cash on Delivery</div>
                      <div className="text-xs text-brand-text-secondary mt-0.5">Pay when you receive your order</div>
                    </Label>
                    <div className={`p-2.5 rounded-xl transition-colors duration-300 ${paymentMethod === "Cash on Delivery" ? "bg-brand-pink/10" : "bg-gray-100"}`}>
                      <Truck className={`h-5 w-5 transition-colors duration-300 ${paymentMethod === "Cash on Delivery" ? "text-brand-pink" : "text-gray-400"}`} />
                    </div>
                  </div>

                  {/* Online payment option */}
                  <div
                    className={`
                      flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300
                      ${paymentMethod === "Online Payment"
                        ? "border-brand-pink bg-brand-cream/30 shadow-sm"
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/50"
                      }
                    `}
                    onClick={() => setPaymentMethod("Online Payment")}
                  >
                    <RadioGroupItem value="Online Payment" id="razorpay" className="border-brand-pink text-brand-pink" />
                    <Label htmlFor="razorpay" className="flex-grow cursor-pointer">
                      <div className="font-semibold text-brand-text text-[15px]">Pay Online (Razorpay)</div>
                      <div className="text-xs text-brand-text-secondary mt-0.5">Secure payment via Razorpay</div>
                    </Label>
                    <div className={`p-2.5 rounded-xl transition-colors duration-300 ${paymentMethod === "Online Payment" ? "bg-brand-pink/10" : "bg-gray-100"}`}>
                      <CreditCard className={`h-5 w-5 transition-colors duration-300 ${paymentMethod === "Online Payment" ? "text-brand-pink" : "text-gray-400"}`} />
                    </div>
                  </div>
                </RadioGroup>

                {/* Security notice */}
                <div className="mt-5 flex items-center gap-2.5 p-3 rounded-xl bg-brand-cream/40 border border-brand-cream">
                  <Shield className="h-4 w-4 text-brand-pink flex-shrink-0" />
                  <p className="text-xs text-brand-text-secondary">
                    Your payment information is processed securely. We never store your card details.
                  </p>
                </div>

                {/* Order confirmation info */}
                <div className="mt-3 flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <Clock className="h-4 w-4 text-brand-text-secondary flex-shrink-0" />
                  <p className="text-xs text-brand-text-secondary">
                    Your order will be confirmed once payment is completed
                  </p>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between gap-3 p-5 border-t border-gray-100 bg-gray-50/30">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCheckoutStep(2)}
                  className="h-11 px-6 rounded-xl border-gray-200 text-brand-text hover:bg-brand-cream/30 hover:border-brand-pink/30 font-medium transition-all duration-300"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-11 px-8 rounded-xl bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] hover:shadow-glow text-white font-semibold border-0 transition-all duration-300"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      Processing
                      <Truck className="h-4 w-4 animate-bounce" />
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      Pay ₹{orderSummary.total.toFixed(2)}
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}
        </form>
      )}
    </div>
  )
}
