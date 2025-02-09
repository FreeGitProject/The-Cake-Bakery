import { Metadata } from 'next'
import MyOrders from '../components/MyOrders'

export const metadata: Metadata = {
  title: 'My Orders | Cake-Bakery Shop',
  description: 'View your order history from Cake-Bakery Shop',
}

export default function MyOrdersPage() {
  return (
    <div className="container mx-auto px-4 py-2">
      {/* <h1 className="text-3xl font-bold mb-6">My Orders</h1> */}
      <MyOrders />
    </div>
  )
}

