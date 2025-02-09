import AdminCoupons from "@/components/Admin/AdminCoupons";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Coupons | Admin Dashboard",
  description: "Manage discount coupons for your Cake-Bakery Shop",
};

export default function AdminCouponsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* <h1 className="text-3xl font-bold mb-6">Manage Coupons</h1> */}
      <AdminCoupons />
    </div>
  )
}
