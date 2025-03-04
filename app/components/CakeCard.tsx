"use client";
import React, { useState, useTransition, useEffect } from "react";
import { 
  Heart, Star, Eye, Minus, Plus, ShoppingCart, 
  Gift, Truck, AlertCircle 
} from "lucide-react";
//import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
//import Link from "next/link";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  Drawer, 
  DrawerClose, 
  DrawerContent, 
  DrawerDescription, 
  DrawerFooter, 
  DrawerHeader, 
  DrawerTitle, 
  //DrawerTrigger 
} from "@/components/ui/drawer";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Assuming you're using Sonner for toasts

// Existing interfaces from previous implementation
interface Price {
  weight: number;
  sellPrice: number;
}

interface Reviews {
  userId: string;
  rating: number;
}

interface Cake {
  _id: string;
  name: string;
  description: string;
  caketype: "cake" | "pastries";
  type: "contains egg" | "eggless";
  prices: Price[];
  image: string[];
  reviews: Reviews[];
  averageRating: number;
  isAvailable: boolean;
}

interface PremiumCakeCardProps {
  cake: Cake;
  isWishlisted: boolean;
  onAddToWishlist: (cakeId: string) => void;
  onRemoveFromWishlist: (cakeId: string) => void;
}

export default function PremiumCakeCard({
  cake,
  isWishlisted,
  onAddToWishlist,
  onRemoveFromWishlist,
}: PremiumCakeCardProps) {
  // State Management
  const [isHovered, setIsHovered] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState(
    cake.prices[0].weight.toString()
  );
  const [cakeMessage, setCakeMessage] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Hooks and Context
  const { addToCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();

  // Responsive Design Effect
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  // Price Calculation
  const getCurrentPrice = () => {
    const price = cake.prices.find(
      (p) => p.weight.toString() === selectedWeight
    );
    return price ? price.sellPrice : 0;
  };

  // Cart and Purchase Handlers
  const handleAddToCart = () => {
    startTransition(() => {
      const price = cake.prices.find(
        (p) => p.weight.toString() === selectedWeight
      );
      if (price) {
        addToCart({
          id: cake._id,
          name: cake.name,
          caketype: cake.caketype,
          price: price.sellPrice,
          weight: price.weight,
          quantity: quantity,
          image: cake.image[0],
          cakeMessage: cakeMessage
        });
        toast.success("Added to Cart", {
          description: `${cake.name} has been added to your cart.`
        });
      }
    });
  };

  const handleBuyNow = () => {
    const lowestPrice = cake.prices.reduce((min, price) =>
      price.sellPrice < min.sellPrice ? price : min
    );
    
    startTransition(() => {
      addToCart({
        id: cake._id,
        name: cake.name,
        caketype: cake.caketype,
        price: lowestPrice.sellPrice,
        quantity: 1,
        image: cake.image[0],
        weight: lowestPrice.weight,
        cakeMessage: cakeMessage
      });
      router.push("/checkout");
    });
  };

  // Quantity Management
  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  // Render Components
  const renderPremiumBadges = () => (
    <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="secondary" className="bg-emerald-500 text-white">
              <Gift className="mr-1 h-4 w-4" /> Customizable
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            Add a personal touch to your cake
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="secondary" className="bg-purple-500 text-white">
              <Truck className="mr-1 h-4 w-4" /> Premium Delivery
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            Guaranteed fresh delivery within 2 hours
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );

  const renderCustomizationModal = () => (
    <Drawer open={showCustomization} onOpenChange={setShowCustomization}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Customize Your {cake.name}</DrawerTitle>
          <DrawerDescription>
            Add a special message or select custom options
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="grid w-full max-w-sm mx-auto gap-4 p-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="cakeMessage">Cake Message</Label>
            <Input 
              id="cakeMessage"
              placeholder="Write a message for the cake"
              value={cakeMessage}
              onChange={(e) => setCakeMessage(e.target.value)}
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">
              {cakeMessage.length}/50 characters
            </p>
          </div>
        </div>
        
        <DrawerFooter>
          <Button onClick={() => setShowCustomization(false)}>
            Apply Customization
          </Button>
          <DrawerClose>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );

  const renderQuickView = () => (
    <Dialog open={showQuickView} onOpenChange={setShowQuickView}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{cake.name}</DialogTitle>
          <DialogDescription>{cake.description}</DialogDescription>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative aspect-square">
            <Image 
              src={cake.image[0]} 
              alt={cake.name} 
              fill 
              className="object-cover rounded-lg" 
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(cake.averageRating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="text-sm text-muted-foreground">
                {cake.averageRating} ({cake.reviews?.length || 0} reviews)
              </span>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold">Cake Details</h3>
              <p className="text-sm text-muted-foreground">{cake.description}</p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold">Type</h3>
              <Badge variant="outline">
                {cake.type.toUpperCase()}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Select 
                value={selectedWeight} 
                onValueChange={setSelectedWeight}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Weight" />
                </SelectTrigger>
                <SelectContent>
                  {cake.prices.map((price) => (
                    <SelectItem 
                      key={price.weight} 
                      value={price.weight.toString()}
                    >
                      {price.weight} {cake.caketype === "cake" ? "Kg" : "Pieces"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleQuantityChange(-1)}
                  className="h-8 w-8"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-2">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleQuantityChange(1)}
                  className="h-8 w-8"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={handleAddToCart} 
                className="w-full"
              >
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
              </Button>
              <Button 
                variant="secondary" 
                onClick={handleBuyNow} 
                className="w-full"
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <Card 
      className={`
        relative overflow-hidden transition-all duration-500 
        ${isMobile 
          ? 'w-full' 
          : 'hover:scale-105 hover:shadow-2xl'
        }
      `}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
    >
      {renderPremiumBadges()}
      
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <h2 className={`
            font-bold tracking-tight 
            ${isMobile ? 'text-2xl' : 'text-3xl'}
          `}>
            {cake.name}
          </h2>
          
          {session && (
            <Button
              variant="ghost"
              size="icon"
              className={`
                transition-colors duration-300 
                ${isWishlisted 
                  ? "text-red-500 hover:text-red-600" 
                  : "text-gray-400 hover:text-red-500"
                }
              `}
              onClick={() => 
                isWishlisted 
                  ? onRemoveFromWishlist(cake._id) 
                  : onAddToWishlist(cake._id)
              }
            >
              <Heart 
                className={`
                  ${isMobile ? 'h-5 w-5' : 'h-6 w-6'} 
                  ${isWishlisted ? "fill-current" : ""}
                `} 
              />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <div className="relative">
          <Image
            src={cake.image[0]}
            alt={cake.name}
            width={500}
            height={500}
            className={`
              w-full object-cover rounded-lg 
              ${isMobile ? 'h-64' : 'h-80'}
              ${isHovered && !isMobile ? 'scale-105' : ''}
            `}
          />
          
          <div className="absolute bottom-4 right-4 bg-primary/80 text-white rounded-full px-4 py-2 font-bold">
            ₹{(getCurrentPrice() * quantity).toFixed(2)}
          </div>
        </div>
        
        <div className={`
          mt-4 grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-2 gap-2'}
        `}>
          <Button 
            variant="outline" 
            size={isMobile ? "default" : "sm"}
            onClick={() => setShowCustomization(true)}
            className="w-full"
          >
            {/* <Customize className="mr-2 h-4 w-4" /> Customize */}
          </Button>
          <Button 
            variant="outline" 
            size={isMobile ? "default" : "sm"}
            onClick={() => setShowQuickView(true)}
            className="w-full"
          >
            <Eye className="mr-2 h-4 w-4" /> Quick View
          </Button>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
  <div className="w-full space-y-2">
    <div className={`
      flex ${isMobile ? 'flex-col space-y-2' : 'space-x-2'}
    `}>
      <Select 
        value={selectedWeight} 
        onValueChange={setSelectedWeight}
      >
        <SelectTrigger className={`
          ${isMobile ? 'w-full' : 'flex-1'}
        `}>
          <SelectValue placeholder="Select Weight" />
        </SelectTrigger>
        <SelectContent>
          {cake.prices.map((price) => (
            <SelectItem 
              key={price.weight} 
              value={price.weight.toString()}
            >
              {price.weight} {cake.caketype === "cake" ? "Kg" : "Pieces"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className={`
        flex items-center border rounded-md 
        ${isMobile ? 'w-full justify-between' : 'flex-1'}
      `}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleQuantityChange(-1)}
          className="h-8 w-8"
          disabled={quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="px-2 text-sm">{quantity}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleQuantityChange(1)}
          className="h-8 w-8"
          disabled={quantity >= 10}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>

    {cake.isAvailable ? (
      <div className={`
        grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-2 gap-2'}
      `}>
        <Button 
          onClick={handleBuyNow}
          className="w-full"
          disabled={isPending}
        >
          {isPending ? (
            <AlertCircle className="mr-2 h-4 w-4 animate-pulse" />
          ) : (
            <ShoppingCart className="mr-2 h-4 w-4" />
          )}
          Buy Now
        </Button>
        <Button 
          variant="secondary"
          onClick={handleAddToCart}
          className="w-full"
          disabled={isPending}
        >
          {isPending ? (
            <AlertCircle className="mr-2 h-4 w-4 animate-pulse" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Add to Cart
        </Button>
      </div>
    ) : (
      <Button 
        variant="destructive" 
        className="w-full cursor-not-allowed opacity-50"
        disabled
      >
        Out of Stock
      </Button>
    )}

    {/* Order Timeline */}
    <div className="flex justify-between w-full text-xs text-muted-foreground mt-2">
      <div className="flex flex-col items-center">
        <div className="w-2 h-2 rounded-full bg-primary mb-1" />
        <span>Order</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="w-2 h-2 rounded-full bg-primary mb-1" />
        <span>Bake</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="w-2 h-2 rounded-full bg-primary mb-1" />
        <span>Deliver</span>
      </div>
    </div>
  </div>

  {/* Render Customization and Quick View Modals */}
  {renderCustomizationModal()}
  {renderQuickView()}
</CardFooter>
</Card>
)
}