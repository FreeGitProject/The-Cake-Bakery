import type { Metadata } from "next"
import AdminCompanyInfo from "@/components/Admin/AdminCompanyInfo"

export const metadata: Metadata = {
  title: "Manage Company Information | Admin Dashboard",
  description: "Manage company information for your Cake-Bakery Shop",
}

export default function AdminCompanyInfoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Company Information</h1>
      <AdminCompanyInfo />
    </div>
  )
}

