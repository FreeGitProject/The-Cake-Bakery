/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus, Trash2 } from "lucide-react";
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutForm() {
  const { cart, getCartTotal, clearCart, updateQuantity, removeFromCart } = useCart();
  const [isLoading, setIsLoading] = useState(false)
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null)

  // Fetch user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!session?.user) return;

      try {
        const response = await fetch(`/api/user/${session.user.id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const data = await response.json();
        //  console.log("data", data);
          const user = data.user;
          // Bind data to formData, ensure proper mapping
          setFormData({
            name: user.username || "",
            email: user.email || "",
            address: user.address?.street || "",
            city: user.address?.city || "",
            state: user.address?.state || "",
            zipCode: user.address?.zipCode || "",
            country: user.address?.country || "",
          });
        } else {
          throw new Error("Failed to fetch user details");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        toast({
          title: "Error",
          description: "Failed to fetch user details. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchUserDetails();
  }, [session, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };
  const handleApplyCoupon = async () => {
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, orderTotal: getCartTotal() }),
      })
      const data = await response.json()
      if (response.ok) {
        setAppliedCoupon({ code: data.couponCode, discountAmount: data.discountAmount })
        toast({
          title: "Coupon Applied",
          description: `Discount of ₹${data.discountAmount.toFixed(2)} applied to your order.`,
        })
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error applying coupon:", error)
      toast({
        title: "Error",
        description: "Failed to apply coupon. Please try again.",
        variant: "destructive",
      })
    }
  }
  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true)
      if (!session) {
        toast({
          title: "Please log in",
          description: "You need to be logged in to place an order.",
          variant: "destructive",
        });
        return;
      }

    // Check delivery availability
    const pincode = formData.zipCode;
    try {
      const response = await fetch("api/check-delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: pincode }),
      });

   const data = await response.json();

   if (!response.ok || !data.deliverable) {
     toast({
       title: "Delivery Unavailable",
       description: data.message || "We cannot deliver to your location.",
       variant: "destructive",
     });
     setIsLoading(false)
     return;
   }
 } catch (error) {
   console.error("Error checking delivery availability:", error);
   toast({
     title: "Error",
     description: "Failed to check delivery availability. Please try again.",
     variant: "destructive",
   });
   return;
 }

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
    };
    //console.log("orderData",orderData)
    if (paymentMethod === "Online Payment") {
     await initializeRazorpayPayment(orderData);
    } else {
      const result = await placeOrder(orderData);
      if (result.success) {
        clearCart();
        toast({
          title: "Order placed successfully!",
          description: "Thank you for your purchase.",
        });
        setIsLoading(false)
        router.push("/my-orders");
      }
    }
   
  };

  const initializeRazorpayPayment = async (orderData: any) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }
      const { razorpayOrder } = data;
     // const { razorpayOrder, order } = data;

     // console.log('Backend Order:', order);
      //console.log('Razorpay Order:', razorpayOrder);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: "INR",
        name: "The Cake Shop",
        description: "Payment for your order",
        order_id: razorpayOrder.id,
        handler: async function (response: any) {
          //remove old way to create a order 
          // const result = await placeOrder({
          //   ...orderData,
          //   razorpayOrderId: data.id,
          //   razorpayPaymentId: response.razorpay_payment_id,
          // });
            // Call backend API to verify payment and update order
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
        else  {
            clearCart();
            toast({
              title: "Order placed successfully!",
              description:
                "Thank you for your purchase. You will receive a confirmation email shortly.",
            });
            setIsLoading(false)
            router.push("/my-orders");
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
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
    }
    //setIsLoading(false)
  };

  const placeOrder = async (orderData: any) => {
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        return { success: true };
      } else {
        throw new Error("Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  // if (cart.length === 0) {
  //    redirect('/login'); 
  // }
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {cart.map((item) => (
            <div key={item.id} className="flex items-center space-x-4 py-2">
              <img
                src={item.image}
                alt={item.name}
                className="w-12 h-12 object-cover rounded"
              />
              <div className="flex-grow">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-500">
                {item.caketype === "cake" ? "Weight" : "Pieces"}  : {item.caketype === "cake"  ? item.weight.toFixed(1) : item.weight}{item.caketype === "cake" ? "Kg" : ""}
                </p>
                <p className="text-sm text-gray-500">
                ₹{item.price.toFixed(2)}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity - 1)
                    }
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span>{item.quantity}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity + 1)
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
              <p className="font-semibold">
              ₹{(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
          <div className="flex justify-between items-center pt-4 border-t mt-4">
            <span className="font-bold">Subtotal</span>
            <span className="font-bold">₹{getCartTotal().toFixed(2)}</span>
          </div>
          {appliedCoupon && (
            <div className="flex justify-between items-center pt-2">
              <span className="font-bold text-green-600">Discount</span>
              <span className="font-bold text-green-600">-₹{appliedCoupon.discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-4 border-t mt-4">
            <span className="font-bold">Total</span>
            <span className="font-bold">₹{(getCartTotal() - (appliedCoupon?.discountAmount || 0)).toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Apply Coupon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Enter coupon code" />
            <Button type="button" onClick={handleApplyCoupon}>
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Shipping Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
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
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="city">State</Label>
            <Input
              id="state"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="zipCode">Pin Code</Label>
            <Input
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            defaultValue="Cash on Delivery"
            onValueChange={setPaymentMethod}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Cash on Delivery" id="cod" />
              <Label htmlFor="cod">Cash on Delivery</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Online Payment" id="razorpay" />
              <Label htmlFor="razorpay">Pay Online (Razorpay)</Label>
            </div>
          </RadioGroup>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            
            {isLoading ? "Processing..." : "Place Order"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
