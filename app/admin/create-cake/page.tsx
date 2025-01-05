import CreateCake from '@/app/components/admin/CreateCake'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Cakes | Admin Dashboard',
  description: 'Create the cakes in your The Cake Shop',
}

export default function AdminCreateCakePage() {
  return <CreateCake />
}

