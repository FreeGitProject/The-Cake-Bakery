import EditCake from '@/app/components/admin/EditCake'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Edit Cakes | Admin Dashboard',
  description: 'Edit the cakes in your The Cake Shop',
}

export default function AdminEditCakePage({ params }: { params: { id: string } }) {
  return <EditCake id={params.id}/>
}

