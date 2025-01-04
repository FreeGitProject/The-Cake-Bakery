import { Metadata } from 'next'
import AdminOrders from '@/components/AdminOrders'

export const metadata: Metadata = {
  title: 'Manage Orders | Admin Dashboard',
  description: 'Manage customer orders in your Cake-Bakery Shop',
}

export default function AdminOrdersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Orders</h1>
      <AdminOrders />
    </div>
  )
}

