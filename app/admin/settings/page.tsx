import { Metadata } from 'next'
import AdminSettings from '../../components/admin/AdminSettings'

export const metadata: Metadata = {
  title: 'Admin Settings | The Cake Shop',
  description: 'Configure admin settings for the The Cake Shop',
}

export default function AdminSettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Settings</h1>
      <AdminSettings />
    </div>
  )
}

