"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface AddonItem {
  _id: string
  name: string
  category: string
  price: number
  description?: string
  image?: string
}

export default function AdminAddonItems() {
  const [addonItems, setAddonItems] = useState<AddonItem[]>([])
  const [newItem, setNewItem] = useState<Omit<AddonItem, "_id">>({
    name: "",
    category: "",
    price: 0,
    description: "",
    image: "",
  })
  const { data: session } = useSession()
  const { toast } = useToast()

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchAddonItems()
    }
  }, [session])

  const fetchAddonItems = async () => {
    try {
      const response = await fetch("/api/addon-items")
      if (response.ok) {
        const data = await response.json()
        setAddonItems(data.addonItems)
      } else {
        throw new Error("Failed to fetch addon items")
      }
    } catch (error) {
      console.error("Error fetching addon items:", error)
      toast({
        title: "Error",
        description: "Failed to fetch addon items. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewItem((prev) => ({ ...prev, [name]: name === "price" ? Number.parseFloat(value) : value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/addon-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      })
      if (response.ok) {
        toast({
          title: "Success",
          description: "Addon item created successfully.",
        })
        fetchAddonItems()
        setNewItem({
          name: "",
          category: "",
          price: 0,
          description: "",
          image: "",
        })
      } else {
        throw new Error("Failed to create addon item")
      }
    } catch (error) {
      console.error("Error creating addon item:", error)
      toast({
        title: "Error",
        description: "Failed to create addon item. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/addon-items/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        toast({
          title: "Success",
          description: "Addon item deleted successfully.",
        })
        fetchAddonItems()
      } else {
        throw new Error("Failed to delete addon item")
      }
    } catch (error) {
      console.error("Error deleting addon item:", error)
      toast({
        title: "Error",
        description: "Failed to delete addon item. Please try again.",
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
          <CardTitle>Add New Addon Item</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="name"
              value={newItem.name}
              onChange={handleInputChange}
              placeholder="Addon Item Name"
              required
            />
            <Select
              value={newItem.category}
              onValueChange={(value) => setNewItem((prev) => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Popular">Popular</SelectItem>
                <SelectItem value="Cake Toppers">Cake Toppers</SelectItem>
                <SelectItem value="Candles">Candles</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Input
              name="price"
              type="number"
              step="0.01"
              value={newItem.price}
              onChange={handleInputChange}
              placeholder="Price"
              required
            />
            <Input
              name="description"
              value={newItem.description}
              onChange={handleInputChange}
              placeholder="Description (optional)"
            />
            <Input name="image" value={newItem.image} onChange={handleInputChange} placeholder="Image URL (optional)" />
            <Button type="submit">Add Addon Item</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Addon Items</CardTitle>
        </CardHeader>
        <CardContent>
          {addonItems.length === 0 ? (
            <p>No addon items found.</p>
          ) : (
            <ul className="space-y-4">
              {addonItems.map((item) => (
                <li key={item._id} className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-600">Category: {item.category}</p>
                    <p className="text-sm text-gray-600">Price: ₹{item.price.toFixed(2)}</p>
                  </div>
                  <Button variant="destructive" onClick={() => handleDelete(item._id)}>
                    Delete
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

