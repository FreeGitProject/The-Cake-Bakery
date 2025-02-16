import type { Metadata } from "next"
import AdminBanners from "@/components/Admin/AdminBanners"

export const metadata: Metadata = {
  title: "Manage Promo Banners | Admin Dashboard",
  description: "Create and manage promotional banners for your Cake-Bakery Shop",
}

export default function AdminBannersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Promo Banners</h1>
      <AdminBanners />
    </div>
  )
}

