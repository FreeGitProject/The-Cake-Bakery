import { Metadata } from 'next'
import AdminPolicies from '../../../components/AdminPolicies'

export const metadata: Metadata = {
  title: 'Manage Policies | Admin Dashboard',
  description: 'Manage policies for The Cake Shop website',
}

export default function AdminPoliciesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Policies</h1>
      <AdminPolicies />
    </div>
  )
}

