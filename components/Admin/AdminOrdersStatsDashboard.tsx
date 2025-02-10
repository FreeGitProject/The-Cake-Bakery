"use client"
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
} from "recharts";

// Type Definitions
interface OrderStats {
  totalOrdersAndRevenue: {
    totalOrders: number;
    totalRevenue: number;
  };
  ordersByStatus: Array<{
    _id: string;
    count: number;
  }>;
  ordersTrend: Array<{
    _id: string;
    count: number;
    revenue: number;
  }>;
  topSellingProducts: Array<{
    _id: string;
    name: string;
    image: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  paymentMethodDistribution: Array<{
    _id: string;
    count: number;
  }>;
}

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
}

interface ChartStyles extends React.CSSProperties {
  fontSize: string;
  fontFamily: string;
}

// Constants
const COLORS: string[] = ["#6366f1", "#06b6d4", "#f59e0b", "#10b981", "#8b5cf6"];
const CHART_STYLES: ChartStyles = {
  fontSize: "12px",
  fontFamily: "Inter, sans-serif",
};

// Component Definitions
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon }) => (
  <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {icon}
    </div>
  </div>
);

const AdminOrdersStatsDashboard: React.FC = () => {
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { data: session } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchOrderStats();
    }
  }, [session]);

  const fetchOrderStats = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/order-stats");
      if (!response.ok) throw new Error("Failed to fetch order statistics");
      const data: OrderStats = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching order statistics:", error);
      toast({
        title: "Error",
        description: "Failed to fetch order statistics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number): string => 
    new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0 
    }).format(value);

  if (isLoading) return <LoadingSpinner />;
  if (!stats) return null;

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Orders Dashboard</h2>
        <button 
          onClick={fetchOrderStats}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Orders"
          value={stats.totalOrdersAndRevenue.totalOrders.toLocaleString()}
          icon={<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalOrdersAndRevenue.totalRevenue)}
          icon={<div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>}
        />
        <StatCard
          title="Average Order Value"
          value={formatCurrency(stats.totalOrdersAndRevenue.totalRevenue / stats.totalOrdersAndRevenue.totalOrders)}
          icon={<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Orders by Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.ordersByStatus} style={CHART_STYLES}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="_id" stroke="#888888" />
                <YAxis stroke="#888888" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Orders Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.ordersTrend} style={CHART_STYLES}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="_id" stroke="#888888" />
                <YAxis yAxisId="left" stroke="#6366f1" />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ fill: "#6366f1" }}
                  activeDot={{ r: 8 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981" }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topSellingProducts.map((product) => (
                <div key={product._id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="relative w-16 h-16">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{product.name}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-500">
                        Quantity: {product.totalQuantity.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500">
                        Revenue: {formatCurrency(product.totalRevenue)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart style={CHART_STYLES}>
                <Pie
                  data={stats.paymentMethodDistribution}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }: { name: string; percent: number }) => 
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {stats.paymentMethodDistribution.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                      className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOrdersStatsDashboard;