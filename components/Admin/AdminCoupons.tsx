"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { CalendarIcon, PercentIcon, DollarSign, Trash2, Tag, ShoppingCart, PlusCircle, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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
  const [isLoading, setIsLoading] = useState(true)
  const [newCoupon, setNewCoupon] = useState<Omit<Coupon, "_id" | "usageCount">>({
    code: "",
    discountType: "percentage",
    discountValue: 0,
    expiryDate: new Date().toISOString().slice(0, 10),
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
      setIsLoading(true)
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
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewCoupon((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
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
          expiryDate: new Date().toISOString().slice(0, 10),
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
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true)
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
    } finally {
      setIsLoading(false)
    }
  }

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date()
  }

  const getProgressValue = (usageCount: number, usageLimit: number | null) => {
    if (!usageLimit) return 0
    return Math.min(Math.round((usageCount / usageLimit) * 100), 100)
  }

  if (session?.user?.role !== "admin") {
    return (
      <Card className="w-full max-w-md mx-auto mt-16">
        <CardHeader>
          <CardTitle className="text-center text-red-600">
            <AlertCircle className="h-12 w-12 mx-auto mb-2" />
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            You do not have permission to view this page. Please contact an administrator if you believe this is an error.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Coupon Management</h1>
      </div>
      
      <Tabs defaultValue="active" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="active">Active Coupons</TabsTrigger>
            <TabsTrigger value="expired">Expired Coupons</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Create New Coupon</CardTitle>
              <CardDescription>
                Create a new coupon code that customers can use at checkout
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="code">Coupon Code</Label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="code"
                        name="code" 
                        value={newCoupon.code} 
                        onChange={handleInputChange} 
                        placeholder="e.g. SUMMER2023" 
                        className="pl-10"
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="discountType">Discount Type</Label>
                    <Select
                      value={newCoupon.discountType}
                      onValueChange={(value: "percentage" | "fixed") => 
                        setNewCoupon((prev) => ({ ...prev, discountType: value }))
                      }
                    >
                      <SelectTrigger id="discountType">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="discountValue">Discount Value</Label>
                    <div className="relative">
                      {newCoupon.discountType === "percentage" ? (
                        <PercentIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      ) : (
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      )}
                      <Input
                        id="discountValue"
                        name="discountValue"
                        type="number"
                        value={newCoupon.discountValue}
                        onChange={handleInputChange}
                        placeholder={newCoupon.discountType === "percentage" ? "e.g. 15" : "e.g. 10"}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="expiryDate"
                        name="expiryDate"
                        type="date"
                        value={newCoupon.expiryDate}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="usageLimit">Usage Limit</Label>
                    <div className="relative">
                      <Input
                        id="usageLimit"
                        name="usageLimit"
                        type="number"
                        value={newCoupon.usageLimit || ""}
                        onChange={handleInputChange}
                        placeholder="Leave empty for unlimited"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Leave empty for unlimited usage
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="minOrderAmount">Minimum Order Amount</Label>
                    <div className="relative">
                      <ShoppingCart className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="minOrderAmount"
                        name="minOrderAmount"
                        type="number"
                        value={newCoupon.minOrderAmount}
                        onChange={handleInputChange}
                        placeholder="e.g. 50"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" onClick={handleSubmit} disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? "Creating..." : "Create Coupon"}
                <PlusCircle className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="active">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading coupons...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons
                .filter(coupon => !isExpired(coupon.expiryDate))
                .map((coupon) => (
                  <Card key={coupon._id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl font-mono">{coupon.code}</CardTitle>
                          <CardDescription>
                            Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge 
                          variant={coupon.discountType === "percentage" ? "default" : "outline"}
                          className={coupon.discountType === "percentage" ? "bg-green-600" : ""}
                        >
                          {coupon.discountType === "percentage" 
                            ? `${coupon.discountValue}% OFF` 
                            : `$${coupon.discountValue} OFF`}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Usage</span>
                            <span>
                              {coupon.usageCount} / {coupon.usageLimit || "∞"}
                            </span>
                          </div>
                          {coupon.usageLimit && (
                            <Progress value={getProgressValue(coupon.usageCount, coupon.usageLimit)} />
                          )}
                        </div>
                        <p className="text-sm">
                          <span className="text-muted-foreground">Min order:</span> ${coupon.minOrderAmount}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="w-full">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the coupon <strong>{coupon.code}</strong>? 
                              This action cannot be undone and may affect customers who have this code.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(coupon._id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardFooter>
                  </Card>
                ))}
                
                {coupons.filter(coupon => !isExpired(coupon.expiryDate)).length === 0 && (
                  <Card className="col-span-full">
                    <CardHeader>
                      <CardTitle className="text-center text-muted-foreground">No Active Coupons</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-center text-muted-foreground">
                        There are no active coupons at the moment. Create a new coupon to get started.
                      </p>
                    </CardContent>
                    <CardFooter className="justify-center">
                      <Button variant="outline" onClick={() => document.querySelector('[data-value="create"]')?.click()}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create New Coupon
                      </Button>
                    </CardFooter>
                  </Card>
                )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="expired">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading coupons...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons
                .filter(coupon => isExpired(coupon.expiryDate))
                .map((coupon) => (
                  <Card key={coupon._id} className="overflow-hidden opacity-70">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl font-mono">{coupon.code}</CardTitle>
                          <CardDescription>
                            Expired: {new Date(coupon.expiryDate).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="text-muted-foreground">
                          EXPIRED
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm">
                            <span className="text-muted-foreground">Discount:</span>{" "}
                            {coupon.discountType === "percentage" 
                              ? `${coupon.discountValue}%` 
                              : `$${coupon.discountValue}`}
                          </p>
                          <p className="text-sm">
                            <span className="text-muted-foreground">Used:</span>{" "}
                            {coupon.usageCount} times
                          </p>
                          <p className="text-sm">
                            <span className="text-muted-foreground">Min order:</span> ${coupon.minOrderAmount}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full text-muted-foreground">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Expired Coupon</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the expired coupon <strong>{coupon.code}</strong>? 
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(coupon._id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardFooter>
                  </Card>
                ))}
                
                {coupons.filter(coupon => isExpired(coupon.expiryDate)).length === 0 && (
                  <Card className="col-span-full">
                    <CardHeader>
                      <CardTitle className="text-center text-muted-foreground">No Expired Coupons</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-center text-muted-foreground">
                        There are no expired coupons at this time.
                      </p>
                    </CardContent>
                  </Card>
                )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}