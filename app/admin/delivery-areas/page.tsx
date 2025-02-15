import AdminDeliveryAreas from '@/components/AdminDeliveryAreas'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manage Delivery Areas | Admin Dashboard',
  description: 'Manage delivery areas for The Cake Shop',
}

export default function AdminDeliveryAreasPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* <h1 className="text-3xl font-bold mb-6">Manage Delivery Areas</h1> */}
      <AdminDeliveryAreas />
    </div>
  )
}

