import type { Metadata } from "next"
import AdminLocations from "@/components/Admin/AdminLocations"

export const metadata: Metadata = {
  title: "Manage Locations | Admin Dashboard",
  description: "Manage delivery locations for your Cake-Bakery Shop",
}

export default function AdminLocationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* <h1 className="text-3xl font-bold mb-6">Manage Locations</h1> */}
      <AdminLocations />
    </div>
  )
}

