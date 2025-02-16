import type { Metadata } from "next"
import AdminUserList from "@/components/Admin/AdminUserList"

export const metadata: Metadata = {
  title: "User Management | Admin Dashboard",
  description: "Manage users in your Cake-Bakery Shop",
}

export default function AdminUsersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* <h1 className="text-3xl font-bold mb-6">User Management</h1> */}
      <AdminUserList />
    </div>
  )
}

