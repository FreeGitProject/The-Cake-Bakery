/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Download,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  CreditCard,
  Calendar,
  Filter,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
} from "recharts";
import { format, subMonths } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DateRange } from "react-day-picker";

interface OrderStats {
  dailyStats: Array<{
    _id: string;
    totalOrders: number;
    revenue: number;
    pending: number;
    completed: number;
    canceled: number;
  }>;
  monthlyStats: Array<{
    _id: string;
    totalOrders: number;
    revenue: number;
    pending: number;
    completed: number;
    canceled: number;
  }>;
  overallStats: {
    totalOrders: number;
    revenue: number;
    pending: number;
    completed: number;
    canceled: number;
  };
  revenueTrend: Array<{
    _id: string;
    revenue: number;
  }>;
  bestSellingCakes: Array<{
    _id: string;
    name: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  topCustomers: Array<{
    _id: string;
    username: string;
    email: string;
    totalOrders: number;
    totalSpent: number;
  }>;
  orderStatusDistribution: Array<{
    _id: string;
    count: number;
  }>;
}

// Extended with richer color palette
const COLORS = [
  "#4361ee",
  "#3a0ca3",
  "#7209b7",
  "#f72585",
  "#4cc9f0",
  "#4895ef",
  "#560bad",
  "#f15bb5",
  "#00bbf9",
  "#00f5d4",
];

const CHART_GRID_COLOR = "#f0f0f0";
//const TREND_UP_COLOR = "#10b981";
//const TREND_DOWN_COLOR = "#ef4444";

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border rounded-md shadow-md">
        <p className="font-medium">{`${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value.toLocaleString("en-IN", {
              style: entry.name.toLowerCase().includes("revenue")
                ? "currency"
                : "decimal",
              currency: "INR",
              maximumFractionDigits: 0,
            })}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Format date for display
const formatDate = (dateString: string) => {
  // Check if it's a month-year format
  if (dateString.length <= 7) {
    return dateString; // Return as is for month names or year-month formats
  }

  try {
    return format(new Date(dateString), "dd MMM yyyy");
  } catch (e) {
    return dateString;
  }
};

// Calculate percent change
const calculateChange = (current: number, previous: number) => {
  if (previous === 0) return 100;
  return ((current - previous) / previous) * 100;
};

export default function AdminOrdersStatsDashboard() {
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("overview");
  const { data: session } = useSession();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<
    { from: Date; to: Date } | undefined
  >({
    from: subMonths(new Date(), 3),
    to: new Date(),
  });
  const [prevDateRange, setPrevDateRange] = useState({
    from: subMonths(subMonths(new Date(), 3), 3),
    to: subMonths(new Date(), 3),
  });
  const [orderStatus, setOrderStatus] = useState("All");
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);
  const [detailType, setDetailType] = useState("");

  // Comparison stats for showing trends (calculated from previous period)
  const [comparisonStats, setComparisonStats] = useState<{
    revenueChange: number;
    ordersChange: number;
    avgOrderValueChange: number;
  }>({
    revenueChange: 0,
    ordersChange: 0,
    avgOrderValueChange: 0,
  });

  // Calculate average order value
  const avgOrderValue = useMemo(() => {
    if (!stats?.overallStats) return 0;
    return stats.overallStats.revenue / stats.overallStats.totalOrders;
  }, [stats?.overallStats]);

  const handleDateChange = (date: DateRange | undefined) => {
    if (date) {
      setDateRange({
        from: date.from || new Date(),
        to: date.to || new Date(),
      });
    }
  };

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchOrderStats();
    }
  }, [session]);

  // Fetch comparison stats for previous period
  const fetchComparisonStats = async () => {
    try {
      const queryParams = new URLSearchParams({
        startDate: prevDateRange.from.toISOString(),
        endDate: prevDateRange.to.toISOString(),
        status: orderStatus,
      });
      const response = await fetch(`/api/admin/order-stats?${queryParams}`);
      if (response.ok) {
        const prevData = await response.json();

        // Calculate percentage changes
        const currentStats = stats?.overallStats;
        if (currentStats && prevData.overallStats) {
          const prevStats = prevData.overallStats;
          const prevAvgOrderValue = prevStats.revenue / prevStats.totalOrders;

          setComparisonStats({
            revenueChange: calculateChange(
              currentStats.revenue,
              prevStats.revenue
            ),
            ordersChange: calculateChange(
              currentStats.totalOrders,
              prevStats.totalOrders
            ),
            avgOrderValueChange: calculateChange(
              avgOrderValue,
              prevAvgOrderValue
            ),
          });
        }
      }
    } catch (error) {
      console.error("Error fetching comparison statistics:", error);
    }
  };

  const fetchOrderStats = async () => {
    try {
      if (!dateRange?.from || !dateRange?.to) {
        throw new Error("Invalid date range selected");
      }
      setLoading(true);
      const queryParams = new URLSearchParams({
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
        status: orderStatus,
      });
      const response = await fetch(`/api/admin/order-stats?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        // Once we have the current stats, fetch comparison stats
        await fetchComparisonStats();
      } else {
        throw new Error("Failed to fetch order statistics");
      }
    } catch (error) {
      console.error("Error fetching order statistics:", error);
      toast({
        title: "Error",
        description: "Failed to fetch order statistics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to export data as CSV
  const exportData = (dataType: string) => {
    if (!stats) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    const rows = [];

    // Create different CSV content based on the data type
    if (dataType === "revenue") {
      rows.push(["Date", "Revenue"]);
      stats.revenueTrend.forEach((item) => {
        rows.push([item._id, item.revenue]);
      });
    } else if (dataType === "bestsellers") {
      rows.push(["Cake Name", "Quantity Sold", "Revenue"]);
      stats.bestSellingCakes.forEach((item) => {
        rows.push([item.name, item.totalQuantity, item.totalRevenue]);
      });
    } else if (dataType === "customers") {
      rows.push(["Username", "Email", "Orders", "Total Spent"]);
      stats.topCustomers.forEach((item) => {
        rows.push([
          item.username,
          item.email,
          item.totalOrders,
          item.totalSpent,
        ]);
      });
    }

    // Convert rows to CSV format
    rows.forEach((row) => {
      csvContent += row.join(",") + "\r\n";
    });

    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${dataType}_${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    document.body.appendChild(link);

    // Download the file
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: `${dataType} data has been exported as CSV.`,
    });
  };

  // Function to show detailed data in a dialog
  const showDetails = (type: string, data: any) => {
    setDetailType(type);
    setDetailData(data);
    setShowDetailDialog(true);
  };

  // Display loading skeleton during data fetch
  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Orders Statistics Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-4" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i + 4}>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // If stats are missing, handle gracefully
  if (!stats) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">No Data Available</h2>
        <p>Please adjust your filters and try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Orders Analytics Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Reset to default date range (last 3 months)
              setDateRange({
                from: subMonths(new Date(), 3),
                to: new Date(),
              });
              setPrevDateRange({
                from: subMonths(subMonths(new Date(), 3), 3),
                to: subMonths(new Date(), 3),
              });
              setOrderStatus("All");
              fetchOrderStats();
            }}
          >
            Reset Filters
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Export Data</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => exportData("revenue")}>
                Revenue Trend
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportData("bestsellers")}>
                Best Selling Products
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportData("customers")}>
                Top Customers
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Date Range</p>
              <DatePickerWithRange
                date={dateRange}
                setDate={handleDateChange}
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Order Status</p>
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
            </div>
            <Button className="mt-4 md:mt-0" onClick={fetchOrderStats}>
              <Filter className="mr-2 h-4 w-4" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs
        value={currentView}
        onValueChange={setCurrentView}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">
                      ₹{stats?.overallStats?.revenue.toLocaleString("en-IN")}
                    </div>
                    <div className="flex items-center mt-1">
                      {comparisonStats?.revenueChange >= 0 ? (
                        <div className="flex items-center text-green-600">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span className="text-xs">
                            +{comparisonStats?.revenueChange?.toFixed(1)}%
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <TrendingDown className="h-4 w-4 mr-1" />
                          <span className="text-xs">
                            {comparisonStats?.revenueChange?.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">
                      {stats?.overallStats?.totalOrders.toLocaleString()}
                    </div>
                    <div className="flex items-center mt-1">
                      {comparisonStats.ordersChange >= 0 ? (
                        <div className="flex items-center text-green-600">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span className="text-xs">
                            +{comparisonStats?.ordersChange.toFixed(1)}%
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <TrendingDown className="h-4 w-4 mr-1" />
                          <span className="text-xs">
                            {comparisonStats?.ordersChange?.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Order Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">
                      ₹{avgOrderValue.toFixed(0)}
                    </div>
                    <div className="flex items-center mt-1">
                      {comparisonStats?.avgOrderValueChange >= 0 ? (
                        <div className="flex items-center text-green-600">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span className="text-xs">
                            +{comparisonStats?.avgOrderValueChange?.toFixed(1)}%
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <TrendingDown className="h-4 w-4 mr-1" />
                          <span className="text-xs">
                            {comparisonStats.avgOrderValueChange.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Order Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">
                      {(
                        (stats.overallStats.completed /
                          stats.overallStats.totalOrders) *
                        100
                      ).toFixed(1)}
                      %
                    </div>
                    <div className="flex items-center mt-1">
                      <div className="text-xs text-muted-foreground">
                        {stats?.overallStats?.completed} of{" "}
                        {stats?.overallStats?.totalOrders}
                      </div>
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Revenue over time</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => exportData("revenue")}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={stats.revenueTrend}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#4361ee"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#4361ee"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={CHART_GRID_COLOR}
                    />
                    <XAxis
                      dataKey="_id"
                      tickFormatter={formatDate}
                      tick={{ fontSize: 12 }}
                      angle={-30}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      tickFormatter={(value) => `₹${value.toLocaleString()}`}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#4361ee"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      name="Revenue"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Order Status Distribution</CardTitle>
                  <CardDescription>Current order statuses</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    showDetails("status", stats.orderStatusDistribution)
                  }
                >
                  Details
                </Button>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.orderStatusDistribution}
                      dataKey="count"
                      nameKey="_id"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      label={(entry) => `${entry._id}: ${entry.count}`}
                    >
                      {stats.orderStatusDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-4 border rounded-md shadow-md">
                              <p className="font-medium">{data._id}</p>
                              <p>Count: {data.count}</p>
                              <p>
                                Percentage:{" "}
                                {(
                                  (data.count /
                                    stats.overallStats.totalOrders) *
                                  100
                                ).toFixed(1)}
                                %
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      formatter={(value) => (
                        <span className="text-xs">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Stats Chart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Monthly Performance</CardTitle>
                <CardDescription>Orders and revenue by month</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.monthlyStats}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={CHART_GRID_COLOR}
                  />
                  <XAxis
                    dataKey="_id"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={(value) => `₹${value / 1000}K`}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: 20 }} />
                  <Bar
                    yAxisId="left"
                    dataKey="totalOrders"
                    fill="#4361ee"
                    radius={[4, 4, 0, 0]}
                    name="Orders"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="revenue"
                    fill="#7209b7"
                    radius={[4, 4, 0, 0]}
                    name="Revenue (₹)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PRODUCTS TAB */}
        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Best Selling Cakes</CardTitle>
                  <CardDescription>By quantity sold</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => exportData("bestsellers")}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.bestSellingCakes}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={CHART_GRID_COLOR}
                    />
                    <XAxis type="number" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fontSize: 12 }}
                      width={80}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="totalQuantity"
                      fill="#4361ee"
                      name="Quantity Sold"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Product Revenue</CardTitle>
                  <CardDescription>By total revenue generated</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    showDetails("products", stats.bestSellingCakes)
                  }
                >
                  Details
                </Button>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.bestSellingCakes}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={CHART_GRID_COLOR}
                    />
                    <XAxis
                      type="number"
                      tickFormatter={(value) => `₹${value / 1000}K`}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fontSize: 12 }}
                      width={80}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="totalRevenue"
                      fill="#7209b7"
                      name="Revenue (₹)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            {/* Product Performance Comparison */}
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Product Performance Metrics</CardTitle>
                  <CardDescription>Revenue vs Quantity</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={CHART_GRID_COLOR}
                    />
                    <XAxis
                      type="number"
                      dataKey="totalQuantity"
                      name="Quantity Sold"
                      label={{
                        value: "Quantity Sold",
                        position: "insideBottom",
                        offset: -10,
                      }}
                    />
                    <YAxis
                      type="number"
                      dataKey="totalRevenue"
                      name="Revenue"
                      label={{
                        value: "Revenue (₹)",
                        angle: -90,
                        position: "insideLeft",
                      }}
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(1)}K`}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-4 border rounded-md shadow-md">
                              <p className="font-medium">{data.name}</p>
                              <p>Quantity: {data.totalQuantity}</p>
                              <p>
                                Revenue: ₹{data.totalRevenue.toLocaleString()}
                              </p>
                              <p>
                                Avg Price: ₹
                                {(
                                  data.totalRevenue / data.totalQuantity
                                ).toFixed(0)}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Scatter
                      name="Products"
                      data={stats.bestSellingCakes}
                      fill="#4cc9f0"
                      shape={(props: { payload?: any; cx?: any; cy?: any }) => {
                        const { cx, cy } = props;
                        const size = 50; // Base size
                        const { totalQuantity, totalRevenue } = props.payload;
                        // Scale dot size based on revenue
                        const scaledSize = Math.max(
                          20,
                          Math.min(
                            60,
                            (totalRevenue /
                              Math.max(
                                ...stats.bestSellingCakes.map(
                                  (c) => c.totalRevenue
                                )
                              )) *
                              size
                          )
                        );
                        return (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={scaledSize / 4}
                            fill="#4cc9f0"
                            fillOpacity={0.7}
                            stroke="#4361ee"
                            strokeWidth={1}
                          />
                        );
                      }}
                      label={(props) => {
                        const { x, y, name } = props;
                        return (
                          <text
                            x={x}
                            y={y - 10}
                            textAnchor="middle"
                            fill="#333"
                            fontSize={10}
                          >
                            {name.length > 10
                              ? `${name.substring(0, 10)}...`
                              : name}
                          </text>
                        );
                      }}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        {/* CUSTOMERS TAB */}
        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Top Customers</CardTitle>
                  <CardDescription>By total spent</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => exportData("customers")}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {stats.topCustomers.slice(0, 5).map((customer) => (
                    <div key={customer._id} className="flex items-center">
                      <div className="mr-4 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                        {customer.username?.[0].toUpperCase()}
                      </div>
                      <div className="space-y-1 flex-1">
                        <p className="text-sm font-medium leading-none">
                          {customer.username}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {customer.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          ₹{customer.totalSpent.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {customer.totalOrders} orders
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {stats.topCustomers.length > 5 && (
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      variant="ghost"
                      className="w-full text-sm"
                      onClick={() =>
                        showDetails("customers", stats.topCustomers)
                      }
                    >
                      View All Customers
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Customer Insights</CardTitle>
                  <CardDescription>
                    Orders and spending patterns
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    outerRadius={90}
                    data={stats.topCustomers.slice(0, 5)}
                  >
                    <PolarGrid stroke={CHART_GRID_COLOR} />
                    <PolarAngleAxis dataKey="username" />
                    <PolarRadiusAxis angle={30} domain={[0, "auto"]} />
                    <Radar
                      name="Orders"
                      dataKey="totalOrders"
                      stroke="#4361ee"
                      fill="#4361ee"
                      fillOpacity={0.5}
                    />
                    <Radar
                      name="Spent (₹1000s)"
                      dataKey="totalSpent"
                      stroke="#7209b7"
                      fill="#7209b7"
                      fillOpacity={0.5}
                      // Scale down the spending values to fit on the same chart
                      // We'll divide by 1000 to show in thousands
                      // dataKey={(entry) => entry.totalSpent / 1000}
                    />
                    <Legend />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const customer = payload[0].payload;
                          const metric = payload[0].dataKey;
                          let value = metric ? customer[metric] : undefined;
                          let label = payload[0].name;

                          // If we're looking at the scaled spending
                          if (metric === "totalSpent") {
                            value = customer.totalSpent;
                            label = "Total Spent";
                          }

                          return (
                            <div className="bg-white p-4 border rounded-md shadow-md">
                              <p className="font-medium">{customer.username}</p>
                              <p>
                                {label}:{" "}
                                {metric === "totalSpent"
                                  ? `₹${value.toLocaleString()}`
                                  : value}
                              </p>
                              <p>
                                Avg Order: ₹
                                {(
                                  customer.totalSpent / customer.totalOrders
                                ).toFixed(0)}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          {/* Customer Retention Analysis */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Customer Spending Analysis</CardTitle>
                <CardDescription>Orders vs Average Order Value</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={CHART_GRID_COLOR}
                  />
                  <XAxis
                    type="number"
                    dataKey="totalOrders"
                    name="Total Orders"
                    label={{
                      value: "Number of Orders",
                      position: "insideBottom",
                      offset: -10,
                    }}
                  />
                  <YAxis
                    type="number"
                    dataKey="avgOrderValue"
                    name="Average Order Value"
                    label={{
                      value: "Avg Order Value (₹)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                    // Transform the data to calculate average order value
                     // tickFormatter={(value) => ₹${value}}
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(1)}K`}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const customer = payload[0].payload;
                        return (
                          <div className="bg-white p-4 border rounded-md shadow-md">
                            <p className="font-medium">{customer.username}</p>
                            <p>Email: {customer.email}</p>
                            <p>Orders: {customer.totalOrders}</p>
                            <p>
                              Total Spent: ₹
                              {customer.totalSpent.toLocaleString()}
                            </p>
                            <p>
                              Avg Order: ₹
                              {(
                                customer.totalSpent / customer.totalOrders
                              ).toFixed(0)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Scatter
                    name="Customers"
                    // Transform the data to include average order value
                    data={stats.topCustomers.map((customer) => ({
                      ...customer,
                      avgOrderValue: (
                        customer.totalSpent / customer.totalOrders
                      ).toFixed(0),
                    }))}
                    fill="#f72585"
                    shape={(props: { payload?: any; cx?: any; cy?: any }) => {
                      const { cx, cy } = props;
                      const { totalSpent } = props.payload;
                      // Scale dot size based on total spent
                      const maxSpent = Math.max(
                        ...stats.topCustomers.map((c) => c.totalSpent)
                      );
                      const size = 10 + (totalSpent / maxSpent) * 30;
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={size / 4}
                          fill="#f72585"
                          fillOpacity={0.7}
                          stroke="#f15bb5"
                          strokeWidth={1}
                        />
                      );
                    }}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              {detailType === "status" && "Order Status Details"}
              {detailType === "products" && "Product Sales Details"}
              {detailType === "customers" && "Customer Details"}
            </DialogTitle>
            <DialogDescription>
              Detailed breakdown of the selected data
            </DialogDescription>
          </DialogHeader>
          {detailType === "status" && detailData && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailData.map((item: any) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          item._id === "Delivered"
                            ? "bg-green-100 text-green-800"
                            : item._id === "Cancelled"
                            ? "bg-red-100 text-red-800"
                            : item._id === "Placed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }
                      >
                        {item._id}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.count}</TableCell>
                    <TableCell>
                      {(
                        (item.count / stats.overallStats.totalOrders) *
                        100
                      ).toFixed(1)}
                      %
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {detailType === "products" && detailData && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity Sold</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Avg. Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailData.map((item: any) => (
                  <TableRow key={item._id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.totalQuantity}</TableCell>
                    <TableCell>₹{item.totalRevenue.toLocaleString()}</TableCell>
                    <TableCell>
                      ₹{(item.totalRevenue / item.totalQuantity).toFixed(0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {detailType === "customers" && detailData && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Avg. Order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailData.map((item: any) => (
                  <TableRow key={item._id}>
                    <TableCell>{item.username}</TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{item.totalOrders}</TableCell>
                    <TableCell>₹{item.totalSpent.toLocaleString()}</TableCell>
                    <TableCell>
                      ₹{(item.totalSpent / item.totalOrders).toFixed(0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
