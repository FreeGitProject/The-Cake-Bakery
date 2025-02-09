"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
//import { Badge } from '@/components/ui/badge';
import { Calendar, Package, CreditCard, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface OrderItem {
  productId: string;
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
  couponCode?: string;
  discountAmount?: number;
}

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
      {status}
    </span>
  );
};

const PaymentStatusBadge = ({ status }: { status: string }) => {
  const getPaymentStatusInfo = () => {
    switch (status.toLowerCase()) {
      case 'completed':
        return {
          color: 'bg-gradient-to-r from-green-500 to-emerald-500',
          icon: <CheckCircle className="w-4 h-4 mr-1" />,
          textColor: 'text-white'
        };
      case 'pending':
        return {
          color: 'bg-gradient-to-r from-yellow-400 to-orange-400',
          icon: <AlertCircle className="w-4 h-4 mr-1" />,
          textColor: 'text-white'
        };
      case 'failed':
        return {
          color: 'bg-gradient-to-r from-red-500 to-pink-500',
          icon: <XCircle className="w-4 h-4 mr-1" />,
          textColor: 'text-white'
        };
      default:
        return {
          color: 'bg-gradient-to-r from-gray-400 to-gray-500',
          icon: <AlertCircle className="w-4 h-4 mr-1" />,
          textColor: 'text-white'
        };
    }
  };

  const { color, icon, textColor } = getPaymentStatusInfo();

  return (
    <span className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${color} ${textColor} shadow-sm`}>
      {icon}
      {status}
    </span>
  );
};

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
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <Package className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900">Please log in</h3>
        <p className="text-gray-500 mt-2 text-center">Sign in to view your orders</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <Package className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900">No orders yet</h3>
        <p className="text-gray-500 mt-2 text-center">When you place orders, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">My Orders</h2>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {orders.map((order) => (
          <Card key={order._id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 bg-white backdrop-blur-lg">
            <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                <div className="space-y-1">
                  <CardTitle className="text-lg">Order #{order.orderNumber ?? order.orderId}</CardTitle>
                  <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 space-y-1 sm:space-y-0 sm:space-x-4">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <CreditCard className="w-4 h-4 mr-1" />
                      {order.paymentMethod}
                    </span>
                  </div>
                </div>
                <StatusBadge status={order.orderStatus} />
              </div>
            </CardHeader>
            
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                {order.orderItems.map((item, index) => (
                  <div key={index} 
                       className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 
                                hover:bg-gray-50 p-3 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                    <Link href={`/cakes/${item.productId}`} className="flex-shrink-0 w-full sm:w-auto">
                      <div className="relative w-full sm:w-20 h-40 sm:h-20 rounded-lg overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Link>
                    
                    <div className="flex-grow space-y-1">
                      <Link href={`/cakes/${item.productId}`}>
                        <h4 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                          {item.name}
                        </h4>
                      </Link>
                      <div className="text-sm text-gray-500">
                        <p>{item.caketype === "cake" ? `${item.weight}kg` : `${item.weight} pieces`}</p>
                        <p>Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    
                    <div className="text-right w-full sm:w-auto">
                      <p className="font-semibold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-sm text-gray-500">₹{item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4 space-y-3">
                  {order.couponCode && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 flex items-center">
                        <span className="font-medium">Coupon Applied: {order.couponCode}</span>
                      </span>
                      <span className="text-green-600">-₹{order.discountAmount?.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                    <span className="font-medium text-gray-900">Total Amount</span>
                    <span className="text-xl font-bold text-gray-900 ">
                      ₹{order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className="text-sm text-gray-500">Status: {order.orderStatus}</span>
                    </div>
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}