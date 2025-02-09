"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";

interface OrderItem {
  productId:string;
  name: string;
  caketype: string;
  quantity: number;
  weight: number;
  price: number;
  image: string;
}

interface Order {
  _id: string;
  orderId: string;
  orderItems: OrderItem[];
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  orderStatus: string;
  orderNumber: string;
  createdAt: string;
  couponCode?: string
  discountAmount?: number
}

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      fetchOrders();
    }
  }, [session]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/orders?userId=${session?.user.id}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        throw new Error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  if (!session) {
    return <p>Please log in to view your orders.</p>;
  }

  return (
    <div className="space-y-6">
      {orders.length === 0 ? (
        <p>You haven&apos;t placed any orders yet.</p>
      ) : (
        orders.map((order) => (
          <Card key={order._id}>
            <CardHeader>
              <CardTitle>Order #{order.orderNumber ?? order.orderId}</CardTitle>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
                <Badge
                  variant={
                    order.orderStatus === "Delivered" ? "default" : "secondary"
                  }
                >
                  {order.orderStatus}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.orderItems.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                     <Link href={`/cakes/${item.productId}`} >
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={50}
                      height={50}
                      className="rounded-md object-cover"
                    />
                    </Link>
                    <div className="flex-grow">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-500">
                      {item.caketype === "cake" ? "Weight" : "Pieces"}  : {item.weight}{item.caketype === "cake" ? "Kg" : ""}
                      </p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity} x ₹{item.price.toFixed(2)}
                      </p>
                    </div>
                    <span className="font-semibold">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                    {order.couponCode && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Coupon Applied: {order.couponCode}</span>
                    <span>-₹{order.discountAmount?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold pt-4 border-t">
                  <span>Total</span>
                  <span> ₹{order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Payment Method</span>
                  <span>{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Payment Status</span>
                  <span>{order.paymentStatus}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
