"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface Coupon {
  _id: string
  code: string
  discountType: "percentage" | "fixed"
  discountValue: number
  expiryDate: string
  usageLimit: number | null
  usageCount: number
  minOrderAmount: number
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [newCoupon, setNewCoupon] = useState<Omit<Coupon, "_id" | "usageCount">>({
    code: "",
    discountType: "percentage",
    discountValue: 0,
    expiryDate: "",
    usageLimit: null,
    minOrderAmount: 0,
  })
  const { data: session } = useSession()
  const { toast } = useToast()

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchCoupons()
    }
  }, [session])

  const fetchCoupons = async () => {
    try {
      const response = await fetch("/api/admin/coupons")
      if (response.ok) {
        const data = await response.json()
        setCoupons(data)
      } else {
        throw new Error("Failed to fetch coupons")
      }
    } catch (error) {
      console.error("Error fetching coupons:", error)
      toast({
        title: "Error",
        description: "Failed to fetch coupons. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewCoupon((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCoupon),
      })
      if (response.ok) {
        toast({
          title: "Success",
          description: "Coupon created successfully.",
        })
        fetchCoupons()
        setNewCoupon({
          code: "",
          discountType: "percentage",
          discountValue: 0,
          expiryDate: "",
          usageLimit: null,
          minOrderAmount: 0,
        })
      } else {
        throw new Error("Failed to create coupon")
      }
    } catch (error) {
      console.error("Error creating coupon:", error)
      toast({
        title: "Error",
        description: "Failed to create coupon. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        toast({
          title: "Success",
          description: "Coupon deleted successfully.",
        })
        fetchCoupons()
      } else {
        throw new Error("Failed to delete coupon")
      }
    } catch (error) {
      console.error("Error deleting coupon:", error)
      toast({
        title: "Error",
        description: "Failed to delete coupon. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (session?.user?.role !== "admin") {
    return <p>You do not have permission to view this page.</p>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Manage Coupons</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="code" value={newCoupon.code} onChange={handleInputChange} placeholder="Coupon Code" required />
        <Select
          value={newCoupon.discountType}
          onValueChange={(value: "percentage" | "fixed") => setNewCoupon((prev) => ({ ...prev, discountType: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Discount Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">Percentage</SelectItem>
            <SelectItem value="fixed">Fixed Amount</SelectItem>
          </SelectContent>
        </Select>
        <Input
          name="discountValue"
          type="number"
          value={newCoupon.discountValue}
          onChange={handleInputChange}
          placeholder="Discount Value"
          required
        />
        <Input
          name="expiryDate"
          type="date"
          value={newCoupon.expiryDate}
          onChange={handleInputChange}
          placeholder="Expiry Date"
          required
        />
        <Input
          name="usageLimit"
          type="number"
          value={newCoupon.usageLimit || ""}
          onChange={handleInputChange}
          placeholder="Usage Limit (optional)"
        />
        <Input
          name="minOrderAmount"
          type="number"
          value={newCoupon.minOrderAmount}
          onChange={handleInputChange}
          placeholder="Minimum Order Amount"
          required
        />
        <Button type="submit">Create Coupon</Button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <Card key={coupon._id}>
            <CardHeader>
              <CardTitle>{coupon.code}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Type: {coupon.discountType}</p>
              <p>
                Value: {coupon.discountValue}
                {coupon.discountType === "percentage" ? "%" : "₹"}
              </p>
              <p>Expiry: {new Date(coupon.expiryDate).toLocaleDateString()}</p>
              <p>
                Usage: {coupon.usageCount} / {coupon.usageLimit || "Unlimited"}
              </p>
              <p>Min Order: ${coupon.minOrderAmount}</p>
              <Button variant="destructive" onClick={() => handleDelete(coupon._id)}>
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

