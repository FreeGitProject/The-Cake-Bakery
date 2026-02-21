import { Metadata } from 'next'
import MyOrders from '../components/MyOrders'

export const metadata: Metadata = {
  title: 'My Orders | Cake-Bakery Shop',
  description: 'View your order history from Cake-Bakery Shop',
}

export default function MyOrdersPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <MyOrders />
    </div>
  )
}
