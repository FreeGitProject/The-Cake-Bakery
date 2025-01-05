'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
//import { useToast } from "@/components/ui/use-toast"
import { useToast } from "@/hooks/use-toast"

interface Order {
  _id: string
  orderId: string
  userId: {
    _id: string
    username: string
    email: string
  }
  totalAmount: number
  orderStatus: string
  paymentStatus: string
  createdAt: string
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [userIdFilter, setUserIdFilter] = useState('')
  const { data: session } = useSession()
  const { toast } = useToast()
//console.log("AdminOrders",session)
  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchOrders()
    }
  }, [session, currentPage, statusFilter, userIdFilter])

  const fetchOrders = async () => {
    try {
      const response = await fetch(
        `/api/admin/orders?page=${currentPage}&status=${statusFilter=='All'?'':statusFilter}&userId=${userIdFilter}`
      )
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
        setTotalPages(data.totalPages)
      } else {
        throw new Error('Failed to fetch orders')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
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
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus }),
      })
      if (response.ok) {
        fetchOrders()
        toast({
          title: "Success",
          description: "Order status updated successfully.",
        })
      } else {
        throw new Error('Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (session?.user?.role !== 'admin') {
    return <p>You do not have permission to view this page.</p>
  }

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
            placeholder="Filter by User ID"
            value={userIdFilter}
            onChange={(e) => setUserIdFilter(e.target.value)}
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
                <p><strong>User:</strong> {order.userId.username}</p>
                <p><strong>Email:</strong> {order.userId.email}</p>
                <p><strong>Total Amount:</strong> ${order.totalAmount.toFixed(2)}</p>
              </div>
              <div>
                <p><strong>Order Status:</strong> {order.orderStatus}</p>
                <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
                <p><strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-4">
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
            </div>
          </CardContent>
        </Card>
      ))}
      <div className="flex justify-center space-x-2">
        <Button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

