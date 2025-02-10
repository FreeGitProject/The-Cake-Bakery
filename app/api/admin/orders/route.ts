/* eslint-disable @typescript-eslint/no-explicit-any */
export const dynamic = "force-dynamic"; // Ensure it's always server-rendered

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { Order } from "@/models/order";
import { User } from "@/models/user"; // Assuming you have a User model

// Helper function to check if the user is an admin
async function isAdmin(session: any) {
  return session?.user?.role === "admin";
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(await isAdmin(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await clientPromise; // Ensure MongoDB connection is established
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    // Build the query object
    const query: any = {};
    if (status && status !== "All") query.orderStatus = status;
    if (userId) query.userId = userId;

    // Pre-fetch users based on the search term
    if (search) {
      const users = await User.find({
        $or: [
          { username: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      const userIds = users.map((user) => user._id); // Extract user IDs
      query.userId = { $in: userIds }; // Filter orders by these user IDs
    }

    // Fetch orders with pagination and sorting
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "username email"); // Ensure you populate the correct fields

    // Get total count of matching documents
    const total = await Order.countDocuments(query);

    // Return paginated response
    return NextResponse.json({
      orders,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalOrders: total,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
