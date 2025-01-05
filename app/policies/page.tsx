import { Metadata } from 'next'
import PoliciesComponent from '../components/PoliciesComponent'

export const metadata: Metadata = {
  title: 'Policies | The Cake Shop',
  description: 'Our policies including privacy, terms, cancellation, refund, shipping, and delivery information.',
}

export default function PoliciesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Our Policies</h1>
      <PoliciesComponent />
    </div>
  )
}

