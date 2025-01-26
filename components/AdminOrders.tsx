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
//import { useToast } from "@/components/ui/use-toast"
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
interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
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
  paymentStatus: string;
  createdAt: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [statusFilter, setStatusFilter] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const { data: session } = useSession();
  const { toast } = useToast();
  //console.log("AdminOrders",session)
  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchOrders();
    }
  }, [session, currentPage, statusFilter]);

  // const fetchOrders = async () => {
  //   try {
  //     const response = await fetch(
  //       `/api/admin/orders?page=${currentPage}&status=${
  //         statusFilter == "All" ? "" : statusFilter
  //       }&userId=${userIdFilter}`
  //     );
  //     if (response.ok) {
  //       const data = await response.json();
  //       setOrders(data.orders);
  //       setTotalPages(data.totalPages);
  //     } else {
  //       throw new Error("Failed to fetch orders");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching orders:", error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to fetch orders. Please try again.",
  //       variant: "destructive",
  //     });
  //   }
  // };
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

  if (session?.user?.role !== "admin") {
    return <p>You do not have permission to view this page.</p>;
  }
  const renderPagination = () => {
    const pages = [];
    const ellipsis = "...";

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(
          <Button
            key={i}
            variant={currentPage === i ? "default" : "outline"}
            onClick={() => setCurrentPage(i)}
          >
            {i}
          </Button>
        );
      } else if (
        (i === currentPage - 2 && i > 1) ||
        (i === currentPage + 2 && i < totalPages)
      ) {
        pages.push(
          <span key={`ellipsis-${i}`} className="px-2">
            {ellipsis}
          </span>
        );
      }
    }

    return (
      <div className="flex items-center space-x-2">
        <Button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          {"<"}
        </Button>
        {pages}
        <Button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          {">"}
        </Button>
        <span className="ml-4 text-sm text-muted-foreground bg">
          Total Records: {totalRecords}
        </span>
      </div>
    );
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Orders</h2>
        <div className="flex space-x-2">
          <Select onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Placed">Placed</SelectItem>
              <SelectItem value="Shipped">Shipped</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Search by username or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                fetchOrders()
              }
            }}
          />
        </div>
      </div>
      {orders.map((order) => (
        <Card key={order._id}>
          <CardHeader>
            <CardTitle>Order #{order.orderId}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p>
                  <strong>User:</strong> {order.userId?.username}
                </p>
                <p>
                  <strong>Email:</strong> {order.userId?.email}
                </p>
                <p>
                  <strong>Total Amount:</strong> ₹{order.totalAmount.toFixed(2)}
                </p>
              </div>
              <div>
                <p>
                  <strong>Order Status:</strong> {order.orderStatus}
                </p>
                <p>
                  <strong>Payment Status:</strong> {order.paymentStatus}
                </p>
                <p>
                  <strong>Created At:</strong>{" "}
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.orderItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={50}
                        height={50}
                        className="rounded-md object-cover"
                      />
                    </TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>₹{item.price.toFixed(2)}</TableCell>
                    <TableCell>
                    ₹{(item.quantity * item.price).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 flex justify-between">
              <Select
                onValueChange={(value) => updateOrderStatus(order._id, value)}
                defaultValue={order.orderStatus}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Update Status" />
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
                <SelectTrigger className="w-[180px]">
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
       <div className="flex justify-center space-x-2 mt-4">
        {renderPagination()}
      </div>
    </div>
  );
}
