/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { Order } from "@/models/order"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await clientPromise

    // Get total orders and revenue
    const totalOrdersAndRevenue = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ])

    // Get orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
        },
      },
    ])

    // Get orders trend (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const ordersTrend = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ])

    // Get top selling products
    const topSellingProducts = await Order.aggregate([
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.productId",
          name: { $first: "$orderItems.name" },
          totalQuantity: { $sum: "$orderItems.quantity" },
          totalRevenue: { $sum: { $multiply: ["$orderItems.quantity", "$orderItems.price"] } },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
    ])

    // Get payment method distribution
    const paymentMethodDistribution = await Order.aggregate([
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
        },
      },
    ])

    return NextResponse.json({
      totalOrdersAndRevenue: totalOrdersAndRevenue[0],
      ordersByStatus,
      ordersTrend,
      topSellingProducts,
      paymentMethodDistribution,
    })
  } catch (error) {
    console.error("Error fetching order statistics:", error)
    return NextResponse.json({ error: "Failed to fetch order statistics" }, { status: 500 })
  }
}

