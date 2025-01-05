/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCart } from '@/context/CartContext'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutForm() {
  const { cart, getCartTotal, clearCart } = useCart()
  const { data: session } = useSession()
  const { toast } = useToast()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
  })
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

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

    const orderData = {
      orderItems: cart.map(item => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: getCartTotal(),
      paymentMethod,
      shippingAddress: formData,
    };

    if (paymentMethod === 'Razorpay') {
      initializeRazorpayPayment(orderData);
    } else {
      const result = await placeOrder(orderData);
      if (result.success) {
        clearCart();
        toast({
          title: "Order placed successfully!",
          description: "Thank you for your purchase.",
        });
        router.push('/my-orders');
      }
    }
  }

  const initializeRazorpayPayment = async (orderData: any) => {
    try {
      const response = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: orderData.totalAmount }),
      });
      const data = await response.json();
    
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        name: "Cake-Bakery Shop",
        description: "Payment for your order",
        order_id: data.id,
        handler: async function (response: any) {
          const result = await placeOrder({
            ...orderData,
            razorpayOrderId: data.id,
            razorpayPaymentId: response.razorpay_payment_id,
          });
          if (result.success) {
            clearCart();
            toast({
              title: "Order placed successfully!",
              description: "Thank you for your purchase. You will receive a confirmation email shortly.",
            });
            router.push('/my-orders');
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
      console.error('Error initializing Razorpay payment:', error);
      toast({
        title: "Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const placeOrder = async (orderData: any) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        return { success: true };
      } else {
        throw new Error('Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  if (cart.length === 0) {
    return <p>Your cart is empty. Please add some items before checking out.</p>
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {cart.map((item:any) => (
            <div key={item.id} className="flex justify-between py-2">
              <span>{item.name} x {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between py-2 font-bold">
            <span>Total</span>
            <span>${getCartTotal().toFixed(2)}</span>
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
            <Label htmlFor="zipCode">Zip Code</Label>
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
          <RadioGroup defaultValue="Cash on Delivery" onValueChange={setPaymentMethod}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Cash on Delivery" id="cod" />
              <Label htmlFor="cod">Cash on Delivery</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Razorpay" id="razorpay" />
              <Label htmlFor="razorpay">Pay Online (Razorpay)</Label>
            </div>
          </RadioGroup>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">Place Order</Button>
        </CardFooter>
      </Card>
    </form>
  )
}

