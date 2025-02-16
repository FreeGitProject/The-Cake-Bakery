import type { Metadata } from "next"
import AdminBulkUpload from "@/components/AdminBulkUpload"

export const metadata: Metadata = {
  title: "Bulk Upload Cakes | Admin Dashboard",
  description: "Upload multiple cakes using an Excel file",
}

export default function AdminBulkUploadPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Bulk Upload Cakes</h1>
      <AdminBulkUpload />
    </div>
  )
}

