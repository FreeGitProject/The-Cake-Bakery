"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
  Mail
} from 'lucide-react';
import React from "react";
interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
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
  totalAmount: number;
  orderStatus: string;
  orderNumber: string;
  paymentStatus: string;
  createdAt: string;
  shippingAddress: ShippingAddress
  couponCode?: string
  discountAmount?: number
}
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

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [statusFilter, setStatusFilter] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const { data: session } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchOrders();
    }
  }, [session, currentPage, statusFilter]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/admin/orders?page=${currentPage}&status=${statusFilter}&search=${searchTerm}`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
        setTotalPages(data.totalPages)
        setTotalRecords(data.totalOrders);
      } else {
        throw new Error("Failed to fetch orders")
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive",
      })
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      if (response.ok) {
        fetchOrders();
        toast({
          title: "Success",
          description: "Order status updated successfully.",
        });
      } else {
        throw new Error("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    }
  };
  const updatePaymentStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: newStatus }),
      });
      if (response.ok) {
        fetchOrders();
        toast({
          title: "Success",
          description: "Payment status updated successfully.",
        });
      } else {
        throw new Error("Failed to update payment status");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast({
        title: "Error",
        description: "Failed to update payment status. Please try again.",
        variant: "destructive",
      });
    }
  };
  // const renderPagination = () => {
  //   const pages = [];
  //   const ellipsis = "...";

  //   for (let i = 1; i <= totalPages; i++) {
  //     if (
  //       i === 1 ||
  //       i === totalPages ||
  //       (i >= currentPage - 1 && i <= currentPage + 1)
  //     ) {
  //       pages.push(
  //         <Button
  //           key={i}
  //           variant={currentPage === i ? "default" : "outline"}
  //           onClick={() => setCurrentPage(i)}
  //         >
  //           {i}
  //         </Button>
  //       );
  //     } else if (
  //       (i === currentPage - 2 && i > 1) ||
  //       (i === currentPage + 2 && i < totalPages)
  //     ) {
  //       pages.push(
  //         <span key={`ellipsis-${i}`} className="px-2">
  //           {ellipsis}
  //         </span>
  //       );
  //     }
  //   }

  //   return (
  //     <div className="flex items-center space-x-2">
  //       <Button
  //         onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
  //         disabled={currentPage === 1}
  //       >
  //         {"<"}
  //       </Button>
  //       {pages}
  //       <Button
  //         onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
  //         disabled={currentPage === totalPages}
  //       >
  //         {">"}
  //       </Button>
  //       <span className="ml-4 text-sm text-muted-foreground bg">
  //         Total Records: {totalRecords}
  //       </span>
  //     </div>
  //   );
  // };
  if (session?.user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Package className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900">Access Denied</h3>
        <p className="text-gray-500 mt-2">You don&apos;t have permission to view this page.</p>
      </div>
    );
  }
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
        Order Management
      </h2>
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && fetchOrders()}
            className="pl-10 w-full"
          />
        </div>
        <Select onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter Status" />
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

    <div className="grid gap-6">
      {orders.map((order) => (
        <Card key={order._id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <CardTitle className="text-lg">
                  Order #{order.orderNumber ?? order.orderId}
                </CardTitle>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="flex gap-2">
                <OrderStatusBadge status={order.orderStatus} />
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <User className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium">{order.userId?.username}</p>
                    <div className="flex items-center text-gray-500">
                      <Mail className="w-4 h-4 mr-1" />
                      {order.userId?.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium">Shipping Address</p>
                    <p className="text-gray-600">{order.shippingAddress.name}</p>
                    <p className="text-gray-600">{order.shippingAddress.address}</p>
                    <p className="text-gray-600">
                      {order.shippingAddress.city}, {order.shippingAddress.zipCode}
                    </p>
                    <p className="text-gray-600">{order.shippingAddress.country}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <CreditCard className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium">Payment Details</p>
                    <p className="text-gray-600">
                      Total Amount: <span className="font-semibold">₹{order.totalAmount.toFixed(2)}</span>
                    </p>
                    {order.couponCode && (
                      <div className="flex items-center text-green-600">
                        <Tag className="w-4 h-4 mr-1" />
                        <span>
                          {order.couponCode} (-₹{order.discountAmount?.toFixed(2)})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.orderItems.map((item, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell>
                        <Link href={`/cakes/${item.productId}`} className="block w-12 h-12 relative rounded-lg overflow-hidden">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">₹{item.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{(item.quantity * item.price).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row justify-between gap-4">
              <Select
                onValueChange={(value) => updateOrderStatus(order._id, value)}
                defaultValue={order.orderStatus}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Package className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Update Order Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Placed">Placed</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select
                onValueChange={(value) => updatePaymentStatus(order._id, value)}
                defaultValue={order.paymentStatus}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <CreditCard className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Update Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    <div className="flex justify-center mt-8">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="w-10 h-10 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(
            page =>
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)
          )
          .map((page, i, array) => (
            <React.Fragment key={page}>
              {i > 0 && array[i - 1] !== page - 1 && (
                <span className="px-2">...</span>
              )}
              <Button
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => setCurrentPage(page)}
                className="w-10 h-10 p-0"
              >
                {page}
              </Button>
            </React.Fragment>
          ))}
        <Button
          variant="outline"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="w-10 h-10 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <span className="ml-4 text-sm text-muted-foreground">
          Total Records: {totalRecords}
        </span>
      </div>
    </div>
  </div>
  );
}
