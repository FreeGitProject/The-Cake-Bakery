"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { addDays } from "date-fns"

interface OrderStats {
  dailyStats: Array<{
    _id: string
    totalOrders: number
    revenue: number
    pending: number
    completed: number
    canceled: number
  }>
  monthlyStats: Array<{
    _id: string
    totalOrders: number
    revenue: number
    pending: number
    completed: number
    canceled: number
  }>
  overallStats: {
    totalOrders: number
    revenue: number
    pending: number
    completed: number
    canceled: number
  }
  revenueTrend: Array<{
    _id: string
    revenue: number
  }>
  bestSellingCakes: Array<{
    _id: string
    name: string
    totalQuantity: number
    totalRevenue: number
  }>
  topCustomers: Array<{
    _id: string
    username: string
    email: string
    totalOrders: number
    totalSpent: number
  }>
  orderStatusDistribution: Array<{
    _id: string
    count: number
  }>
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function AdminOrdersStatsDashboard() {
  const [stats, setStats] = useState<OrderStats | null>(null)
  const { data: session } = useSession()
  const { toast } = useToast()
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  })
  const [orderStatus, setOrderStatus] = useState("All")

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchOrderStats()
    }
  }, [session])

  const fetchOrderStats = async () => {
    try {
      const queryParams = new URLSearchParams({
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
        status: orderStatus,
      })
      const response = await fetch(`/api/admin/order-stats?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        throw new Error("Failed to fetch order statistics")
      }
    } catch (error) {
      console.error("Error fetching order statistics:", error)
      toast({
        title: "Error",
        description: "Failed to fetch order statistics. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!stats) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Orders Statistics Dashboard</h2>

      <div className="flex space-x-4">
        <DatePickerWithRange date={dateRange} setDate={setDateRange} />
        <Select value={orderStatus} onValueChange={setOrderStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Order Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="Placed">Placed</SelectItem>
            <SelectItem value="Shipped">Shipped</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={fetchOrderStats}>Apply Filters</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Overall Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Total Orders: {stats.overallStats.totalOrders}</p>
            <p>Total Revenue: ₹{stats.overallStats.revenue.toFixed(2)}</p>
            <p>Pending Orders: {stats.overallStats.pending}</p>
            <p>Completed Orders: {stats.overallStats.completed}</p>
            <p>Canceled Orders: {stats.overallStats.canceled}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.orderStatusDistribution}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {stats.orderStatusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Best Selling Cakes</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.bestSellingCakes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalQuantity" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {stats.topCustomers.map((customer) => (
                <li key={customer._id} className="flex justify-between">
                  <span>{customer.username}</span>
                  <span>₹{customer.totalSpent.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Statistics</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalOrders" fill="#8884d8" />
                <Bar dataKey="revenue" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

