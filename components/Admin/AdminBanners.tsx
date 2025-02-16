"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PromoBanner {
  _id: string
  message: string
  link: string
  linkText: string
  backgroundColor: string
  textColor: string
}

export default function AdminBanners() {
  const [banners, setBanners] = useState<PromoBanner[]>([])
  const [newBanner, setNewBanner] = useState<Omit<PromoBanner, "_id">>({
    message: "",
    link: "",
    linkText: "",
    backgroundColor: "#FF9494",
    textColor: "#FFFFFF",
  })
  const { data: session } = useSession()
  const { toast } = useToast()

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchBanners()
    }
  }, [session])

  const fetchBanners = async () => {
    try {
      const response = await fetch("/api/admin/banners")
      if (response.ok) {
        const data = await response.json()
        setBanners(data)
      } else {
        throw new Error("Failed to fetch banners")
      }
    } catch (error) {
      console.error("Error fetching banners:", error)
      toast({
        title: "Error",
        description: "Failed to fetch banners. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewBanner((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBanner),
      })
      if (response.ok) {
        toast({
          title: "Success",
          description: "Promo banner created successfully.",
        })
        fetchBanners()
        setNewBanner({
          message: "",
          link: "",
          linkText: "",
          backgroundColor: "#FF9494",
          textColor: "#FFFFFF",
        })
      } else {
        throw new Error("Failed to create banner")
      }
    } catch (error) {
      console.error("Error creating banner:", error)
      toast({
        title: "Error",
        description: "Failed to create banner. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/banners/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        toast({
          title: "Success",
          description: "Banner deleted successfully.",
        })
        fetchBanners()
      } else {
        throw new Error("Failed to delete banner")
      }
    } catch (error) {
      console.error("Error deleting banner:", error)
      toast({
        title: "Error",
        description: "Failed to delete banner. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (session?.user?.role !== "admin") {
    return <p>You do not have permission to view this page.</p>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Promo Banner</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="message"
              value={newBanner.message}
              onChange={handleInputChange}
              placeholder="Banner message"
              required
            />
            <Input name="link" value={newBanner.link} onChange={handleInputChange} placeholder="Link URL" required />
            <Input
              name="linkText"
              value={newBanner.linkText}
              onChange={handleInputChange}
              placeholder="Link text"
              required
            />
            <div className="flex space-x-4">
              <div className="flex-1">
                <label htmlFor="backgroundColor" className="block text-sm font-medium text-gray-700 mb-1">
                  Background Color
                </label>
                <Input
                  id="backgroundColor"
                  name="backgroundColor"
                  type="color"
                  value={newBanner.backgroundColor}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex-1">
                <label htmlFor="textColor" className="block text-sm font-medium text-gray-700 mb-1">
                  Text Color
                </label>
                <Input
                  id="textColor"
                  name="textColor"
                  type="color"
                  value={newBanner.textColor}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <Button type="submit">Create Banner</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Promo Banners</CardTitle>
        </CardHeader>
        <CardContent>
          {banners.length === 0 ? (
            <p>No active banners</p>
          ) : (
            <ul className="space-y-4">
              {banners.map((banner) => (
                <li key={banner._id} className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                  <div>
                    <p className="font-medium">{banner.message}</p>
                    <p className="text-sm text-gray-600">
                      Link: {banner.link} ({banner.linkText})
                    </p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(banner._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

