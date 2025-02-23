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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import AddonItemsByCategory from "@/components/AddonItemsByCategory"
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
    city: "",
    state: "",
    zipCode: "",
    country: "",
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
  const [deliveryDate, setDeliveryDate] = useState<string>("");
  const [deliverySlot, setDeliverySlot] = useState<string>("");
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
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

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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

  // Render progress bar
  const renderProgress = () => (
    <div className="mb-6">
      <Progress value={(checkoutStep / 3) * 100} className="h-2" />
      <div className="flex justify-between mt-2 text-sm text-gray-600">
        <span className={checkoutStep >= 1 ? "text-primary" : ""}>Review Cart</span>
        <span className={checkoutStep >= 2 ? "text-primary" : ""}>Delivery Details</span>
        <span className={checkoutStep >= 3 ? "text-primary" : ""}>Payment</span>
      </div>
    </div>
  );

  // Render cart items
  const renderCartItems = () => (
    <div>
        <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
        <CardDescription>Review your items</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center space-x-4 py-4 border-b last:border-0">
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded"
                />
                {item.quantity > 1 && (
                  <Badge className="absolute -top-2 -right-2 bg-primary">
                    x{item.quantity}
                  </Badge>
                )}
              </div>
              
              <div className="flex-grow space-y-1">
                <div className="flex justify-between">
                  <h3 className="font-semibold text-base">{item.name}</h3>
                  <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                <span className="mr-2">
                    {item.caketype !== "addon" && (
                      <>
                        {item.caketype === "cake" ? "Weight" : "Pieces"}: {item.weight}
                        {item.caketype === "cake" ? "Kg" : ""}
                      </>
                    )}
                </span>
                  <span>₹{item.price.toFixed(2)} each</span>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive/90"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Remove item</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
               {item.caketype !== 'pastries' && item.caketype !== "addon" && (
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 gap-2 sm:gap-4">
                 <label htmlFor="cakeMessage" className="text-sm sm:text-base font-medium">
                 Cake Message
                 </label>
                 <Input
                 id="cakeMessage"
                 type="text"
                 value={item.cakeMessage}
                 onChange={(e) => handleCakeMessageChange(item.id, e.target.value)}
                 minLength={20}
                 className="w-full sm:w-64 p-2 border rounded-md"
                 placeholder="Enter at least 20 characters"
                 />
               </div>
               )}

              </div>
            </div>
          ))}
        </ScrollArea>

        <div className="mt-6 space-y-4">
          <div className="flex items-center">
            <Input
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="flex-grow mr-2"
            />
            <Button 
              type="button" 
              onClick={handleApplyCoupon}
              disabled={!couponCode || isLoading}
            >
              Apply
            </Button>
          </div>

          {appliedCoupon && (
            <Alert className="bg-green-50 border-green-200">
              <Gift className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                Coupon &quot;{appliedCoupon.code}&quot; applied - You saved ₹{appliedCoupon.discountAmount.toFixed(2)}!
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>₹{orderSummary.subtotal.toFixed(2)}</span>
            </div>
            
            {appliedCoupon && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-₹{orderSummary.discount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span>Delivery Fee</span>
              <span>
                {orderSummary.deliveryFee === 0 ? (
                  <span className="text-green-600">FREE</span>
                ) : (
                  `₹${orderSummary.deliveryFee.toFixed(2)}`
                )}
              </span>
            </div>

            <Separator />
            
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>₹{orderSummary.total.toFixed(2)}</span>
            </div>
          </div>

          {orderSummary.subtotal < 1000 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Add items worth ₹{(1000 - orderSummary.subtotal).toFixed(2)} more for free delivery!
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full"
          onClick={handleNextStep}
          disabled={cart.length === 0}
        >
          Continue to Delivery
        </Button>
      </CardFooter>
    </Card>
    <div>
      <>
      <AddonItemsByCategory />
      </>
    </div>
    </div>
  );
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {renderProgress()}

      {cart.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent className="space-y-4">
            <div className="text-4xl">🛒</div>
            <CardTitle>Your cart is empty</CardTitle>
            <CardDescription>Add some delicious items to your cart and come back!</CardDescription>
            <Button onClick={() => router.push('/cakes')}>
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
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Choose your preferred payment method</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="Cash on Delivery" id="cod" />
                    <Label htmlFor="cod" className="flex-grow cursor-pointer">
                      <div className="font-semibold">Cash on Delivery</div>
                      <div className="text-sm text-gray-500">Pay when you receive your order</div>
                    </Label>
                    <Truck className="h-6 w-6 text-gray-400" />
                  </div>

                  <div className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="Online Payment" id="razorpay" />
                    <Label htmlFor="razorpay" className="flex-grow cursor-pointer">
                      <div className="font-semibold">Pay Online (Razorpay)</div>
                      <div className="text-sm text-gray-500">Secure payment via Razorpay</div>
                    </Label>
                    <CreditCard className="h-6 w-6 text-gray-400" />
                  </div>
                </RadioGroup>

                <div className="mt-6">
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      Your order will be confirmed once payment is completed
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setCheckoutStep(2)}
                >
                  Back
                </Button>
                <Button 
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      Processing... <Truck className="ml-2 h-4 w-4 animate-bounce" />
                    </span>
                  ) : (
                    `Pay ₹${orderSummary.total.toFixed(2)}`
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}
        </form>
      )}
    </div>
  )
};