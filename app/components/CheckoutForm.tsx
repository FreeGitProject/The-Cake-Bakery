/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  //CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { 
  Minus, 
  Plus, 
  Trash2, 
  Timer, 
  ShoppingBag, 
  Truck, 
  CreditCard,
  Gift,
 // AlertCircle,
  CheckCircle2,
 // MapPin,
 // Calendar,
 // Clock
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PremiumCheckoutForm() {
  const { cart, getCartTotal, clearCart, updateQuantity, removeFromCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  
  // Enhanced state management
  const [currentStep, setCurrentStep] = useState(1);
  const [orderTimer, setOrderTimer] = useState(900);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isAddressValid, setIsAddressValid] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Available delivery time slots
  const timeSlots = [
    "10:00 AM - 12:00 PM",
    "12:00 PM - 2:00 PM",
    "2:00 PM - 4:00 PM",
    "4:00 PM - 6:00 PM",
  ];

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setOrderTimer((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          // Handle expired timer
          toast({
            title: "Session Expired",
            description: "Your checkout session has expired. Please start over.",
            variant: "destructive",
          });
          router.push("/cart");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, toast]);

  // Fetch user details and saved addresses
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user) return;

      try {
        const response = await fetch(`/api/user/${session.user.id}`);
        const data = await response.json();

        if (response.ok) {
          const user = data.user;
          setFormData({
            name: user.username || "",
            email: user.email || "",
            phone: user.phone || "",
            address: user.address?.street || "",
            city: user.address?.city || "",
            state: user.address?.state || "",
            zipCode: user.address?.zipCode || "",
            country: user.address?.country || "",
          });
          setSavedAddresses(user.addresses || []);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        });
      }
    };

    fetchUserData();
  }, [session, toast]);

  // Validate delivery availability whenever zipCode changes
  useEffect(() => {
    const validateDelivery = async () => {
      if (!formData.zipCode || formData.zipCode.length < 6) return;

      try {
        const response = await fetch("/api/check-delivery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ location: formData.zipCode }),
        });

        const data = await response.json();
        setIsAddressValid(data.deliverable);

        if (!data.deliverable) {
          toast({
            title: "Delivery Unavailable",
            description: data.message || "We cannot deliver to your location.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error checking delivery:", error);
        setIsAddressValid(false);
      }
    };

    validateDelivery();
  }, [formData.zipCode, toast]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const calculateProgress = () => {
    return ((3 - currentStep + 1) / 3) * 100;
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleAddressSelect = (address: React.SetStateAction<null>) => {
    setSelectedAddress(address);
    setFormData({
      ...formData,
      address: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a coupon code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          code: couponCode, 
          orderTotal: getCartTotal(),
          userId: session?.user?.id
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setAppliedCoupon({
          code: data.couponCode,
          discountAmount: data.discountAmount,
          type: data.type
        });
        toast({
          title: "Success!",
          description: `Discount of ₹${data.discountAmount.toFixed(2)} applied!`,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to apply coupon",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const initializeRazorpayPayment = async (orderData: any) => {
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
          try {
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
              description: "Thank you for your purchase. You will receive a confirmation email shortly.",
            });
            router.push("/my-orders");
          } catch (error) {
            console.error("Payment verification error:", error);
            toast({
              title: "Payment Error",
              description: "There was an issue verifying your payment. Please contact support.",
              variant: "destructive",
            });
          }
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
      console.error("Razorpay initialization error:", error);
      toast({
        title: "Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    }
  };

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

    if (!isAddressValid) {
      toast({
        title: "Invalid Address",
        description: "We cannot deliver to your location.",
        variant: "destructive",
      });
      return;
    }

    if (!deliveryDate || !deliveryTime) {
      toast({
        title: "Delivery Details Required",
        description: "Please select delivery date and time.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const orderData = {
      orderItems: cart.map((item) => ({
        productId: item.id,
        name: item.name,
        caketype: item.caketype,
        quantity: item.quantity,
        price: item.price,
        weight: item.weight,
        image: item.image,
      })),
      totalAmount: getCartTotal() - (appliedCoupon?.discountAmount || 0),
      paymentMethod,
      shippingAddress: formData,
      couponCode: appliedCoupon?.code,
      discountAmount: appliedCoupon?.discountAmount,
      deliveryDate,
      deliveryTime,
      specialInstructions,
    };

    if (paymentMethod === "Online Payment") {
      await initializeRazorpayPayment(orderData);
    } else {
      try {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        });

        if (response.ok) {
          clearCart();
          toast({
            title: "Order Successful!",
            description: "Your order has been placed successfully.",
          });
          router.push("/my-orders");
        } else {
          throw new Error("Failed to place order");
        }
      } catch (error) {
        console.error("Order placement error:", error);
        toast({
          title: "Error",
          description: "Failed to place order. Please try again.",
          variant: "destructive",
        });
      }
    }
    setIsLoading(false);
  };

  return (
    <div>

      {/* Progress Tracker */}
<div className="max-w-4xl mx-auto p-4">
  <div className="mb-8">
    <Progress value={calculateProgress()} className="h-2" />
    <div className="flex justify-between mt-2 text-sm text-gray-600">
      <span className={currentStep === 1 ? "text-primary font-bold" : ""}>Cart Review</span>
      <span className={currentStep === 2 ? "text-primary font-bold" : ""}>Shipping</span>
      <span className={currentStep === 3 ? "text-primary font-bold" : ""}>Payment</span>
    </div>
  </div>

  {/* Timer Alert */}
  <Alert className="mb-6">
    <Timer className="h-4 w-4" />
    <AlertDescription>
      Complete your order within <span className="font-bold">{formatTime(orderTimer)}</span>
    </AlertDescription>
  </Alert>

  <form onSubmit={handleSubmit} className="space-y-6">
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {currentStep === 1 && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingBag className="w-5 h-5" />
                  <span>Order Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center space-x-4 py-4 border-b last:border-0"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg shadow-sm"
                    />
                    <div className="flex-grow space-y-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-500">
                        {item.caketype === "cake" ? "Weight" : "Pieces"}: {item.weight}
                        {item.caketype === "cake" ? "Kg" : ""}
                      </p>
                      <p className="text-sm text-gray-500">₹{item.price.toFixed(2)}</p>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{getCartTotal().toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-₹{appliedCoupon.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>₹{(getCartTotal() - (appliedCoupon?.discountAmount || 0)).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gift className="w-5 h-5" />
                  <span>Apply Coupon</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-grow"
                  />
                  <Button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isLoading}
                    className="min-w-[100px]"
                  >
                    {isLoading ? "Applying..." : "Apply"}
                  </Button>
                </div>
                {appliedCoupon && (
                  <div className="mt-2 p-2 bg-green-50 text-green-600 rounded flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Coupon applied successfully!</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Truck className="w-5 h-5" />
                <span>Shipping Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {savedAddresses.length > 0 && (
                <div className="space-y-2">
                  <Label>Saved Addresses</Label>
                  <Select onValueChange={handleAddressSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a saved address" />
                    </SelectTrigger>
                    <SelectContent>
                      {savedAddresses.map((address, index) => (
                        <SelectItem key={index} value={address}>
                          {address.street}, {address.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">PIN Code</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Delivery Date</Label>
                <Input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Delivery Time</Label>
                <Select onValueChange={setDeliveryTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select delivery time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Special Instructions</Label>
                <Textarea
                  id="instructions"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Any special instructions for delivery?"
                  className="h-24"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Payment Method</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2 rounded-lg border p-4">
                  <RadioGroupItem value="Cash on Delivery" id="cod" />
                  <Label htmlFor="cod" className="flex-grow cursor-pointer">
                    Cash on Delivery
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-lg border p-4">
                  <RadioGroupItem value="Online Payment" id="online" />
                  <Label htmlFor="online" className="flex-grow cursor-pointer">
                    Pay Online (Razorpay)
                  </Label>
                </div>
              </RadioGroup>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{getCartTotal().toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-₹{appliedCoupon.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total Amount</span>
                  <span>₹{(getCartTotal() - (appliedCoupon?.discountAmount || 0)).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </AnimatePresence>

    <div className="flex justify-between mt-6">
      <Button
        type="button"
        variant="outline"
        onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
        disabled={currentStep === 1}
      >
        Back
      </Button>
      <Button
        type="button"
        onClick={() => {
          if (currentStep === 3) {
            handleSubmit(event as any);
          } else {
            setCurrentStep((prev) => Math.min(prev + 1, 3));
          }
        }}
        disabled={isLoading}
      >
        {currentStep === 3
          ? isLoading
            ? "Processing..."
            : "Place Order"
          : "Continue"}
      </Button>
    </div>
  </form>
</div>
    </div>
  )
};