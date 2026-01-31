"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient, useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import Link from "next/link";
import { 
  Search,
  Package,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  CreditCard,
  User,
  Tag,
  Mail,
  Timer,
  Bell,
  Users,
  Wifi,
  WifiOff
} from 'lucide-react';
import React from "react";

// 🔥 YOUR INTERFACES (UNCHANGED)
interface AddOnItem {
  addonId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}
interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  cakeMessage: string;
}
interface ShippingAddress {
  name: string
  address: string
  city: string
  zipCode: string
  country: string
}
interface Order {
  _id: string;
  orderId: string;
  userId: {
    _id: string;
    username: string;
    email: string;
  };
  orderItems: OrderItem[];
  addonItems: AddOnItem[];
  totalAmount: number;
  orderStatus: string;
  orderNumber: string;
  paymentStatus: string;
  createdAt: string;
  shippingAddress: ShippingAddress;
  couponCode?: string;
  discountAmount?: number;
  deliveryDate: string ;
  deliverySlot:string ;
  isGift: boolean; 
  giftMessage:  string ;
}

// 🔥 YOUR BADGES (UNCHANGED)
const OrderStatusBadge = ({ status }: { status: string }) => {
  const getStatusStyle = () => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      case 'shipped':
        return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white';
      case 'placed':
        return 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white';
      case 'cancelled':
        return 'bg-gradient-to-r from-red-500 to-pink-500 text-white';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
    }
  };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle()} shadow-sm`}>
      {status}
    </span>
  );
};

const PaymentStatusBadge = ({ status }: { status: string }) => {
  const getStatusStyle = () => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      case 'pending':
        return 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white';
      case 'failed':
        return 'bg-gradient-to-r from-red-500 to-pink-500 text-white';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
    }
  };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle()} shadow-sm`}>
      {status}
    </span>
  );
};

// 🔥 WEBSOCKET HOOK (SELF-CONTAINED)
const useOrderWebSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [onlineAdmins, setOnlineAdmins] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001'); // Your WebSocket server
    
    ws.onopen = () => {
      console.log('🔥 WebSocket Connected');
      setIsConnected(true);
      ws.send(JSON.stringify({ type: 'admin-join', userId: 'admin-dashboard' }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'online-admins') {
        setOnlineAdmins(data.admins);
      } else if (data.type === 'new-order') {
        // Dispatch custom event for React Query to catch
        window.dispatchEvent(new CustomEvent('orderUpdate', { detail: data }));
      } else if (data.type === 'order-status-update') {
        window.dispatchEvent(new CustomEvent('orderUpdate', { detail: data }));
      }
    };

    ws.onclose = () => {
      console.log('🔥 WebSocket Disconnected');
      setIsConnected(false);
      // Auto-reconnect after 3s
      setTimeout(() => useOrderWebSocket(), 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
      setIsConnected(false);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  const emitStatusUpdate = useCallback((orderId: string, newStatus: string, type: 'orderStatus' | 'paymentStatus') => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'admin-status-update',
        orderId,
        status: newStatus,
        statusType: type
      }));
    }
  }, [socket]);

  return { onlineAdmins, isConnected, emitStatusUpdate };
};

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { toast } = useToast();
  
  // 🔥 STATE
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // 🔥 WEBSOCKET
  const { onlineAdmins, isConnected, emitStatusUpdate } = useOrderWebSocket();

  // 🔥 REACT QUERY - Orders
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['admin-orders', currentPage, statusFilter, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        status: statusFilter === 'All' ? '' : statusFilter,
        search: searchTerm,
      });
      const response = await fetch(`/api/admin/orders?${params}`);
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    },
    staleTime: 1000, // Always fresh for live updates
    refetchInterval: isConnected ? 5000 : false, // Poll every 5s when connected
  });

  const orders = ordersData?.orders || [];
  const totalPages = ordersData?.totalPages || 1;
  const totalRecords = ordersData?.totalOrders || 0;

  // 🔥 MUTATIONS - Status Updates
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus, type }: { 
      orderId: string; 
      newStatus: string; 
      type: 'orderStatus' | 'paymentStatus' 
    }) => {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [type]: newStatus }),
      });
      if (!response.ok) throw new Error(`Failed to update ${type}`);
      
      // 🔥 Emit to WebSocket
      emitStatusUpdate(orderId, newStatus, type);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({
        title: "✅ Success",
        description: "Status updated & broadcasted live to all admins!",
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    },
  });

  // 🔥 LIVE UPDATES LISTENER
  useEffect(() => {
    const handleLiveUpdate = (e: any) => {
      const data = e.detail;
      console.log('🔥 LIVE ORDER UPDATE:', data.type, data.order?.orderNumber);
      
      if (data.type === 'new-order') {
        toast({
          title: "🆕 New Order Received!",
          description: `Order #${data.order.orderNumber}`,
          duration: 6000,
        });
        // Jump to first page for new orders
        if (currentPage !== 1) setCurrentPage(1);
      }
      
      // Always refetch for status updates
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    };

    window.addEventListener('orderUpdate', handleLiveUpdate);
    return () => window.removeEventListener('orderUpdate', handleLiveUpdate);
  }, [queryClient, toast, currentPage]);

  // 🔥 ADMIN ACCESS CHECK
  if (session?.user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Package className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900">Access Denied</h3>
        <p className="text-gray-500 mt-2">You don't have permission to view this page.</p>
      </div>
    );
  }

  // 🔥 LOADING SKELETON
  if (isLoading) {
    return (
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-lg w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
        <div className="grid gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="p-6">
                <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="flex gap-2">
                  <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                  <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-6 h-48 bg-gray-200 rounded-lg"></div>
                <div className="h-64 bg-gray-200 rounded-lg"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* 🔥 LIVE DASHBOARD HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-8 bg-gradient-to-br from-indigo-50 via-white to-pink-50 rounded-3xl border border-indigo-100 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-indigo-900 to-pink-600 bg-clip-text text-transparent tracking-tight">
              Live Order Management
            </h2>
            <Badge variant={isConnected ? "default" : "secondary"} className={isConnected ? "animate-pulse bg-green-500" : "bg-orange-500"}>
              {isConnected ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </Badge>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{onlineAdmins.length} admins online</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span>{totalRecords} total orders</span>
            </div>
          </div>
        </div>

        {/* 🔥 CONTROLS */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="🔍 Search orders by ID, customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && queryClient.invalidateQueries({ queryKey: ['admin-orders'] })}
              className="pl-12 h-12 bg-white/80 backdrop-blur-sm border-gray-200 hover:border-primary focus:border-primary"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px] h-12">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Placed">Placed</SelectItem>
              <SelectItem value="Shipped">Shipped</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 🔥 ORDERS GRID - YOUR EXACT UI */}
      <div className="grid gap-6">
        {orders.map((order) => (
          <Card key={order._id} className="overflow-hidden hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-primary/50 group">
            <CardHeader className="bg-gradient-to-r from-indigo-50 via-white to-pink-50 border-b border-indigo-100 p-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors">
                    Order #{order.orderNumber ?? order.orderId.slice(-8)}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {new Date(order.createdAt).toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <OrderStatusBadge status={order.orderStatus} />
                  <PaymentStatusBadge status={order.paymentStatus} />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8">
              {/* 🔥 YOUR EXACT DETAILS LAYOUT */}
              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-2xl">
                    <User className="w-6 h-6 text-indigo-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-lg">{order.userId?.username}</p>
                      <div className="flex items-center text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {order.userId?.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-emerald-50/50 rounded-2xl">
                    <MapPin className="w-6 h-6 text-emerald-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-lg mb-2">📍 Shipping Address</p>
                      <p className="text-gray-700">{order.shippingAddress.name}</p>
                      <p className="text-gray-700">{order.shippingAddress.address}</p>
                      <p className="text-gray-700">
                        {order.shippingAddress.city}, {order.shippingAddress.zipCode}
                      </p>
                      <p className="text-gray-700 font-medium">{order.shippingAddress.country}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-2xl">
                    <CreditCard className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-lg mb-3">💳 Payment Details</p>
                      <p className="text-2xl font-bold text-gray-900 mb-2">
                        ₹{order.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </p>
                      {order.couponCode && (
                        <div className="flex items-center gap-2 text-green-600 bg-green-100 px-3 py-1 rounded-full">
                          <Tag className="w-4 h-4" />
                          <span>{order.couponCode} (-₹{order.discountAmount?.toFixed(2)})</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-purple-50/50 rounded-2xl">
                    <Timer className="w-6 h-6 text-purple-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-lg mb-3">📅 Delivery Schedule</p>
                      <p className="text-xl font-bold text-gray-900 mb-2">
                        📦 {order.deliveryDate} | {order.deliverySlot}
                      </p>
                      {order.isGift && (
                        <div className="bg-pink-100 p-3 rounded-xl">
                          <p className="font-semibold text-pink-800">
                            🎁 Gift Message: "{order.giftMessage}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 🔥 YOUR EXACT ORDER ITEMS TABLE */}
              <div className="overflow-x-auto mb-8">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-t-2xl mb-2 font-bold text-lg">
                  🎂 Main Order Items
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="w-16">Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Cake Message</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right font-bold">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.orderItems.map((item, index) => (
                      <TableRow key={index} className="hover:bg-indigo-50/50 border-b border-indigo-100/50">
                        <TableCell>
                          <Link href={`/cakes/${item.productId}`} className="block w-16 h-16 relative rounded-xl overflow-hidden shadow-lg hover:scale-105 transition-transform">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </Link>
                        </TableCell>
                        <TableCell className="font-semibold text-gray-900">{item.name}</TableCell>
                        <TableCell className="max-w-xs">
                          <div className="bg-yellow-100 p-2 rounded-lg text-sm font-medium text-gray-800 max-h-20 overflow-y-auto">
                            "{item.cakeMessage || 'No message'}"
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg text-indigo-600">{item.quantity}</TableCell>
                        <TableCell className="text-right font-mono">₹{item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-bold text-xl text-gray-900">
                          ₹{(item.quantity * item.price).toLocaleString('en-IN')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* 🔥 ADDON ITEMS TABLE */}
              {order?.addonItems?.length > 0 && (
                <div className="overflow-x-auto mb-8">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-t-2xl mb-2 font-bold text-lg">
                    ✨ Add-on Items
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50">
                        <TableHead className="w-16">Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right font-bold">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.addonItems.map((item, index) => (
                        <TableRow key={index} className="hover:bg-emerald-50/50 border-b border-emerald-100/50">
                          <TableCell className="relative w-16 h-16 rounded-xl overflow-hidden shadow-lg">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </TableCell>
                          <TableCell className="font-semibold text-gray-900">{item.name}</TableCell>
                          <TableCell className="text-right font-bold text-lg text-emerald-600">{item.quantity}</TableCell>
                          <TableCell className="text-right font-mono">₹{item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-bold text-xl text-gray-900">
                            ₹{(item.quantity * item.price).toLocaleString('en-IN')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* 🔥 LIVE STATUS CONTROLS */}
              <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-8 rounded-3xl border-2 border-dashed border-indigo-200 backdrop-blur-sm">
                <div className="flex flex-col lg:flex-row gap-6 items-end justify-between">
                  <div className="text-center lg:text-left">
                    <p className="text-sm text-indigo-600 mb-2 font-medium">🔴 LIVE STATUS UPDATE</p>
                    <p className="text-2xl font-bold text-gray-900">
                      Update will sync instantly across all admin dashboards
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <Select
                      onValueChange={(value) => updateStatusMutation.mutate({
                        orderId: order._id,
                        newStatus: value,
                        type: 'orderStatus'
                      })}
                      value={order.orderStatus}
                      disabled={updateStatusMutation.isPending}
                    >
                      <SelectTrigger className="w-full sm:w-[220px] h-14 bg-white shadow-lg hover:shadow-xl transition-all">
                        <Package className="w-5 h-5 mr-3 text-indigo-500" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Placed">📋 Placed</SelectItem>
                        <SelectItem value="Shipped">🚚 Shipped</SelectItem>
                        <SelectItem value="Delivered">✅ Delivered</SelectItem>
                        <SelectItem value="Cancelled">❌ Cancelled</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      onValueChange={(value) => updateStatusMutation.mutate({
                        orderId: order._id,
                        newStatus: value,
                        type: 'paymentStatus'
                      })}
                      value={order.paymentStatus}
                      disabled={updateStatusMutation.isPending}
                    >
                      <SelectTrigger className="w-full sm:w-[220px] h-14 bg-white shadow-lg hover:shadow-xl transition-all">
                        <CreditCard className="w-5 h-5 mr-3 text-emerald-500" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">⏳ Pending</SelectItem>
                        <SelectItem value="Completed">✅ Completed</SelectItem>
                        <SelectItem value="Failed">❌ Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {updateStatusMutation.isPending && (
                  <div className="mt-4 flex items-center gap-2 text-indigo-600 font-medium animate-pulse">
                    <Bell className="w-4 h-4 animate-bounce" />
                    Broadcasting update to all admins...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 🔥 YOUR EXACT PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-12">
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-8 py-4 rounded-2xl shadow-xl border border-gray-200">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-12 h-12 p-0 hover:bg-primary/90 transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => 
                page === 1 || 
                page === totalPages || 
                (page >= currentPage - 1 && page <= currentPage + 1)
              )
              .map((page, i, array) => (
                <React.Fragment key={page}>
                  {i > 0 && array[i - 1] !== page - 1 && (
                    <span className="px-3 text-gray-400 font-mono">...</span>
                  )}
                  <Button
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className={`w-12 h-12 p-0 ${currentPage === page ? 'shadow-lg scale-105' : 'hover:bg-primary/80'}`}
                  >
                    {page}
                  </Button>
                </React.Fragment>
              ))}

            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-12 h-12 p-0 hover:bg-primary/90 transition-all"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            
            <div className="ml-8 pl-8 border-l border-gray-200 text-sm text-gray-600 font-mono min-w-[140px] text-center">
              Page {currentPage} of {totalPages} • {totalRecords.toLocaleString()} orders
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
