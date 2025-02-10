import type { Metadata } from "next"
import AdminOrdersStatsDashboard from "@/components/Admin/AdminOrdersStatsDashboard"

export const metadata: Metadata = {
  title: "Order Statistics | Admin Dashboard",
  description: "View order statistics and analytics for your Cake-Bakery Shop",
}

export default function AdminOrderStatsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* <h1 className="text-3xl font-bold mb-6">Order Statistics</h1> */}
      <AdminOrdersStatsDashboard />
    </div>
  )
}

