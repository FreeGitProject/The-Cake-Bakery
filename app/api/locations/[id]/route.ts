import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { Location } from "@/models/location"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await clientPromise
    const { id } = params
    const deletedLocation = await Location.findByIdAndDelete(id)

    if (!deletedLocation) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Location deleted successfully" })
  } catch (error) {
    console.error("Error deleting location:", error)
    return NextResponse.json({ error: "Failed to delete location" }, { status: 500 })
  }
}


export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await clientPromise;
    const { id } = params;
    const body = await request.json();

    const updatedLocation = await Location.findByIdAndUpdate(id, body, { new: true });

    if (!updatedLocation) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Location updated successfully", location: updatedLocation });
  } catch (error) {
    console.error("Error updating location:", error);
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 });
  }
}

