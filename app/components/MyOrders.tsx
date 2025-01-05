'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface Order {
  _id: string
  orderId: string
  orderItems: OrderItem[]
  totalAmount: number
  paymentStatus: string
  paymentMethod: string
  orderStatus: string
  createdAt: string
}

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const { data: session } = useSession()

  useEffect(() => {
    if (session) {
      fetchOrders()
    }
  }, [session])

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/orders?userId=${session?.user.id}`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      } else {
        throw new Error('Failed to fetch orders')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  if (!session) {
    return <p>Please log in to view your orders.</p>
  }

  return (
    <div className="space-y-6">
      {orders.length === 0 ? (
        <p>You haven&apos;t placed any orders yet.</p>
      ) : (
        orders.map((order) => (
          <Card key={order._id}>
            <CardHeader>
              <CardTitle>Order #{order.orderId}</CardTitle>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
                <Badge variant={order.orderStatus === 'Delivered' ? 'default' : 'secondary'}>
                  {order.orderStatus}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {order.orderItems.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{item.name} x {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold pt-2">
                  <span>Total</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
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
  )
}

