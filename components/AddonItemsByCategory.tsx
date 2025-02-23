import { useState, useEffect } from "react"
import Image from "next/image"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/context/CartContext"
import { useToast } from "@/hooks/use-toast"
import { Plus, Star, Gift } from "lucide-react"

interface AddonItem {
  _id: string
  name: string
  category: string
  price: number
  description?: string
  image?: string
  popular?: boolean
}

export default function CheckoutWithAddons() {
  const [addonItems, setAddonItems] = useState<AddonItem[]>([])
  const [activeCategory, setActiveCategory] = useState<string>("")
  const { addToCart } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    fetchAddonItems()
  }, [])

  const fetchAddonItems = async () => {
    try {
      const response = await fetch("/api/addon-items")
      if (response.ok) {
        const data = await response.json()
        setAddonItems(data.addonItems)
        // Set first category as active by default
        if (data.addonItems.length > 0) {
          setActiveCategory(data.addonItems[0].category)
        }
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

  const handleAddAddon = (item: AddonItem) => {
    debugger;
    addToCart({
      id: item._id,
      caketype:"addon",
      name: item.name,
      price: item.price,
      weight:0,
      quantity: 1,
      image: item.image || "/placeholder.svg",
      cakeMessage:"",
    })
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your order.`,
    })
  }

  const groupedAddons = addonItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, AddonItem[]>
  )

  const categories = Object.keys(groupedAddons)

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-purple-600" />
          <CardTitle>Enhance Your Order</CardTitle>
        </div>
        <CardDescription>Add these delicious items to make your order extra special</CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        <Tabs
          defaultValue={activeCategory}
          value={activeCategory}
          onValueChange={setActiveCategory}
          className="w-full"
        >
          <TabsList className="w-full justify-start mb-6 overflow-x-auto">
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="min-w-fit data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category} className="mt-0">
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {groupedAddons[category].map((item) => (
                    <CarouselItem 
                      key={item._id} 
                      className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                    >
                      <div className="group relative bg-white rounded-lg overflow-hidden border hover:border-purple-200 transition-all duration-300">
                        <div className="aspect-[4/3] relative">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {item.popular && (
                            <Badge className="absolute top-2 right-2 bg-yellow-500">
                              <Star className="w-3 h-3 mr-1" /> Popular
                            </Badge>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-800">
                              {item.name}
                            </h3>
                            <span className="font-bold text-purple-600">
                              ₹{item.price.toFixed(2)}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          <Button
                            type="button"
                            onClick={() => handleAddAddon(item)}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add to Order
                          </Button>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex -left-4" />
                <CarouselNext className="hidden md:flex -right-4" />
              </Carousel>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}