"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Package, CreditCard, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useOrderSocket } from '@/hooks/useOrderSocket';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';

interface OrderItem {
  productId: string;
  name: string;
  caketype: string;
  quantity: number;
  weight: number;
  price: number;
  image: string;
}

interface AddOnItem {
  addonId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  _id: string;
  orderId: string;
  orderItems: OrderItem[];
  addonItems: AddOnItem[];
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
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
      case 'completed': return { color: 'bg-gradient-to-r from-green-500 to-emerald-500', textColor: 'text-white' };
      case 'pending': return { color: 'bg-gradient-to-r from-yellow-400 to-orange-400', textColor: 'text-white' };
      case 'failed': return { color: 'bg-gradient-to-r from-red-500 to-pink-500', textColor: 'text-white' };
      default: return { color: 'bg-gradient-to-r from-gray-400 to-gray-500', textColor: 'text-white' };
    }
  };
  const { color, textColor } = getPaymentStatusInfo();
  return (
    <span className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${color} ${textColor} shadow-sm`}>
      {status}
    </span>
  );
};

export default function MyOrders() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<any[]>([]);

  // 🔥 WEBSOCKET: Auto-connect
  const { onlineAdmins } = useOrderSocket(session?.user?.id);

  // React Query for orders (with manual refetch)
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['user-orders', session?.user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/orders?userId=${session?.user.id}`);
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    },
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // 🔥 WEBSOCKET: Listen for real-time updates
  useEffect(() => {
    const handleOrderUpdate = (e: any) => {
      const data = e.detail;
      console.log('🔥 LIVE ORDER UPDATE:', data);
      
      // Show notification
      setNotifications(prev => [
        { 
          id: Date.now(), 
          message: data.type === 'NEW_ORDER' ? 'Order confirmed!' : `Status: ${data.status}`,
          type: data.type 
        },
        ...prev.slice(0, 2)
      ]);

      // Refetch orders instantly
      queryClient.invalidateQueries({ queryKey: ['user-orders', session?.user?.id] });
    };

    window.addEventListener('orderUpdate', handleOrderUpdate);
    return () => window.removeEventListener('orderUpdate', handleOrderUpdate);
  }, [queryClient, session?.user?.id]);

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <Package className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900">Please log in</h3>
        <p className="text-gray-500 mt-2 text-center">Sign in to view your orders</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 py-6">
      {/* 🔥 Header + Live Status */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">My Orders</h2>
          <p className="text-gray-500">
            Live updates • {onlineAdmins.length} admins online
          </p>
        </div>
        
        {/* 🔥 Live Notifications */}
        {notifications.length > 0 && (
          <div className="flex gap-2">
            {notifications.map((notif) => (
              <Badge 
                key={notif.id} 
                variant="destructive" 
                className="bg-green-500 hover:bg-green-600 animate-pulse flex items-center gap-1"
              >
                <Bell className="w-3 h-3" />
                {notif.message}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-20 bg-gray-200 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Orders */}
      {!isLoading && orders && (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {orders.map((order) => (
            <Card key={order._id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {/* Your existing Card content - unchanged */}
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
              
              {/* Rest of your existing card content stays EXACTLY the same */}
              <CardContent className="p-4 sm:p-6">
                {/* ... your existing order items rendering ... */}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {orders?.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
          <Package className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900">No orders yet</h3>
          <p className="text-gray-500 mt-2 text-center">When you place orders, they will appear here with live updates!</p>
        </div>
      )}
    </div>
  );
}
