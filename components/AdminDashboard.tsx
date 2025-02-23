'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const sections = [
  { name: 'Home', path: '/admin/home' },
  { name: 'News', path: '/admin/news' },
  { name: 'About', path: '/admin/about' },
  { name: 'Favorites', path: '/admin/favorites' },
  { name: "Cakes", path: "/admin/cakes" },
  { name: "Categories", path: "/admin/categories" },
  { name: 'Orders', path: '/admin/orders' },
  { name: 'Footer', path: '/admin/footer' },
  { name: 'Delivery areas', path: '/admin/delivery-areas' },
  { name: 'Settings', path: '/admin/settings' },
  { name: "Users", path: "/admin/users" },
  { name: "Coupons", path: "/admin/coupons" },
  { name: "Bulk Upload", path: "/admin/bulk-upload" },
  { name: "Import Logs", path: "/admin/import-logs" },
  { name: "Banners", path: "/admin/banners" },
  { name: "Addon Items", path: "/admin/addon-items" },
]

export default function AdminDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Card key={section.name}>
            <CardHeader>
              <CardTitle>{section.name}</CardTitle>
              <CardDescription>Manage {section.name} section</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={section.path}>
                <Button>Edit {section.name}</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

