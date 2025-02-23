import type { Metadata } from "next"
import AdminAddonItems from "@/components/AdminAddonItems"

export const metadata: Metadata = {
  title: "Manage Addon Items | Admin Dashboard",
  description: "Manage addon items for your Cake-Bakery Shop",
}

export default function AdminAddonItemsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Addon Items</h1>
      <AdminAddonItems />
    </div>
  )
}

