/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { Order } from "@/models/order"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await clientPromise

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate") ? new Date(searchParams.get("startDate") as string) : new Date(0)
    const endDate = searchParams.get("endDate") ? new Date(searchParams.get("endDate") as string) : new Date()
    const status = searchParams.get("status")

    const matchStage: any = {
      createdAt: { $gte: startDate, $lte: endDate },
    }

    if (status && status !== "All") {
      matchStage.orderStatus = status
    }

    const [
      dailyStats,
      monthlyStats,
      overallStats,
      revenueTrend,
      bestSellingCakes,
      topCustomers,
      orderStatusDistribution,
    ] = await Promise.all([
      // Daily stats
      Order.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            totalOrders: { $sum: 1 },
            revenue: { $sum: "$totalAmount" },
            pending: { $sum: { $cond: [{ $eq: ["$orderStatus", "Placed"] }, 1, 0] } },
            completed: { $sum: { $cond: [{ $eq: ["$orderStatus", "Delivered"] }, 1, 0] } },
            canceled: { $sum: { $cond: [{ $eq: ["$orderStatus", "Cancelled"] }, 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Monthly stats
      Order.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            totalOrders: { $sum: 1 },
            revenue: { $sum: "$totalAmount" },
            pending: { $sum: { $cond: [{ $eq: ["$orderStatus", "Placed"] }, 1, 0] } },
            completed: { $sum: { $cond: [{ $eq: ["$orderStatus", "Delivered"] }, 1, 0] } },
            canceled: { $sum: { $cond: [{ $eq: ["$orderStatus", "Cancelled"] }, 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Overall stats
      Order.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            revenue: { $sum: "$totalAmount" },
            pending: { $sum: { $cond: [{ $eq: ["$orderStatus", "Placed"] }, 1, 0] } },
            completed: { $sum: { $cond: [{ $eq: ["$orderStatus", "Delivered"] }, 1, 0] } },
            canceled: { $sum: { $cond: [{ $eq: ["$orderStatus", "Cancelled"] }, 1, 0] } },
          },
        },
      ]),

      // Revenue trend
      Order.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$totalAmount" },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Best-selling cakes
      Order.aggregate([
        { $match: matchStage },
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
      ]),

      // Top customers
      Order.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: "$userId",
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: "$totalAmount" },
          },
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $project: {
            _id: 1,
            totalOrders: 1,
            totalSpent: 1,
            username: { $arrayElemAt: ["$userDetails.username", 0] },
            email: { $arrayElemAt: ["$userDetails.email", 0] },
          },
        },
      ]),

      // Order status distribution
      Order.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: "$orderStatus",
            count: { $sum: 1 },
          },
        },
      ]),
    ])

    return NextResponse.json({
      dailyStats,
      monthlyStats,
      overallStats: overallStats[0],
      revenueTrend,
      bestSellingCakes,
      topCustomers,
      orderStatusDistribution,
    })
  } catch (error) {
    console.error("Error fetching order statistics:", error)
    return NextResponse.json({ error: "Failed to fetch order statistics" }, { status: 500 })
  }
}

