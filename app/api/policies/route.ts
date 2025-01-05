import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import clientPromise from "@/lib/mongodb";
import { Policy } from "@/models/policy";
import { User } from "@/models/user"; // Assuming you have a User model

// Helper function to check if the user is an admin
async function isAdmin(userEmail: string) {
  const user = await User.findOne({ email: userEmail });
  return user?.role === "admin";
}
export async function GET() {
  try {
    await clientPromise;
    const policies = await Policy.find({});
    return NextResponse.json(policies);
  } catch (error) {
    console.error("Error fetching policies:", error);
    return NextResponse.json(
      { error: "Failed to fetch policies" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("Policies", session);
    await clientPromise;
    // Fetch user by email
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the user is an admin
    if (!(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("Policies", session);

    const { type, content } = await request.json();
    const policy = await Policy.findOneAndUpdate(
      { type },
      { content },
      { upsert: true, new: true }
    );
    return NextResponse.json(policy);
  } catch (error) {
    console.error("Error updating policy:", error);
    return NextResponse.json(
      { error: "Failed to update policy" },
      { status: 500 }
    );
  }
}
