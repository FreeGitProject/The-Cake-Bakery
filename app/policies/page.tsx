import { Metadata } from 'next'
import PoliciesComponent from '../components/PoliciesComponent'

export const metadata: Metadata = {
  title: 'Policies | The Cake Shop',
  description: 'Our policies including privacy, terms, cancellation, refund, shipping, and delivery information.',
}

export default function PoliciesPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-brand-text mb-8">Our Policies</h1>
        <PoliciesComponent />
      </div>
    </div>
  )
}
