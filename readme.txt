
"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  ShoppingCart, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Info, 
  Star 
} from "lucide-react";

// Import necessary components and hooks
import { Button } from "@/components/ui/button";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { toast } from "@/hooks/use-toast";

// Types (you can move these to a separate type file)
interface Price {
  weight: number;
  costPrice: number;
  sellPrice: number;
}

interface Cake {
  _id: string;
  name: string;
  description: string;
  type: string;
  caketype: string;
  prices: Price[];
  image: string[];
  category: string;
  isAvailable: boolean;
  ingredients?: string[];
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
  };
}

export default function PremiumCakeDetails({ id }: { id: string }) {
  // State Management
  const [cake, setCake] = useState<Cake | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedWeight, setSelectedWeight] = useState<Price | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [customization, setCustomization] = useState({
    message: "",
    candles: false,
    specialDecoration: false
  });

  // Hooks
  const { addToCart } = useCart();
  const { data: session } = useSession();

  // Fetch Cake Details
  const fetchCakeDetails = async () => {
    try {
      const response = await fetch(`/api/cakes/${id}`);
      const data = await response.json();
      setCake(data);
      setSelectedWeight(data.prices[0]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch cake details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCakeDetails();
  }, [id]);

  // Handlers
  const handleAddToCart = () => {
    if (!cake || !selectedWeight) return;

    addToCart({
      id: cake._id,
      name: cake.name,
      price: selectedWeight.sellPrice,
      weight: selectedWeight.weight,
      customization,
      image: cake.image[0]
    });

    toast({
      title: "Added to Cart",
      description: `${cake.name} has been added to your cart`
    });
  };

  // Render Loading State
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 1, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        >
          <Image 
            src="/cake-loader.gif" 
            alt="Loading" 
            width={100} 
            height={100} 
          />
        </motion.div>
      </div>
    );
  }

  // Render Not Found
  if (!cake) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-bold text-gray-600">
          Cake Not Found
        </h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
      {/* Image Gallery Section */}
      <div className="space-y-4">
        <motion.div 
          className="relative overflow-hidden rounded-xl"
          layoutId="cake-image"
        >
          <Image 
            src={cake.image[selectedImage]} 
            alt={cake.name}
            width={600}
            height={600}
            className="w-full h-[500px] object-cover"
            onClick={() => setImageModalOpen(true)}
          />
          
          {/* Image Navigation */}
          <div className="absolute inset-0 flex items-center justify-between px-4">
            <Button 
              variant="ghost" 
              size="icon"
              disabled={selectedImage === 0}
              onClick={() => setSelectedImage(prev => Math.max(0, prev - 1))}
            >
              <ChevronLeft />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              disabled={selectedImage === cake.image.length - 1}
              onClick={() => setSelectedImage(prev => 
                Math.min(cake.image.length - 1, prev + 1)
              )}
            >
              <ChevronRight />
            </Button>
          </div>
        </motion.div>

        {/* Thumbnail Gallery */}
        <div className="flex space-x-2 justify-center">
          {cake.image.map((img, index) => (
            <motion.div 
              key={index}
              className={`w-16 h-16 cursor-pointer rounded-md overflow-hidden 
                ${selectedImage === index ? 'border-2 border-primary' : ''}`}
              onClick={() => setSelectedImage(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image 
                src={img} 
                alt={`Thumbnail ${index + 1}`}
                width={100}
                height={100}
                className="w-full h-full object-cover"
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Product Details Section */}
      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-4">{cake.name}</h1>
          
          <div className="flex items-center space-x-4 mb-4">
            <Badge variant={cake.isAvailable ? "default" : "destructive"}>
              {cake.isAvailable ? "In Stock" : "Out of Stock"}
            </Badge>
            <div className="flex items-center text-yellow-500">
              <Star className="mr-1" />
              <span>4.5</span>
              <span className="text-gray-500 ml-2">(125 Reviews)</span>
            </div>
          </div>

          {/* Price Section */}
          <div className="flex items-baseline space-x-4 mb-6">
            <span className="text-3xl font-bold text-primary">
              ₹{selectedWeight?.sellPrice}
            </span>
            {selectedWeight?.costPrice && (
              <>
                <span className="line-through text-gray-500">
                  ₹{selectedWeight.costPrice}
                </span>
                <span className="text-green-600">
                  {Math.round(
                    (1 - (selectedWeight.sellPrice / selectedWeight.costPrice)) * 100
                  )}% OFF
                </span>
              </>
            )}
          </div>

          {/* Weight Selection */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Select Weight</h3>
            <div className="flex space-x-2">
              {cake.prices.map((price) => (
                <Button
                  key={price.weight}
                  variant={selectedWeight?.weight === price.weight ? "default" : "outline"}
                  onClick={() => setSelectedWeight(price)}
                >
                  {price.weight} {cake.caketype === "cake" ? "Kg" : "Pieces"}
                </Button>
              ))}
            </div>
          </div>

          {/* Customization Options */}
          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={customization.candles}
                  onChange={(e) => setCustomization(prev => ({
                    ...prev, 
                    candles: e.target.checked
                  }))}
                />
                <span>Add Candles</span>
              </label>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={customization.specialDecoration}
                  onChange={(e) => setCustomization(prev => ({
                    ...prev, 
                    specialDecoration: e.target.checked
                  }))}
                />
                <span>Special Decoration</span>
              </label>
            </div>
            <div>
              <label className="block mb-2">Cake Message</label>
              <input 
                type="text" 
                placeholder="Enter message (optional)"
                value={customization.message}
                onChange={(e) => setCustomization(prev => ({
                  ...prev, 
                  message: e.target.value
                }))}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 mt-6">
            <Button 
              className="flex-1" 
              size="lg"
              onClick={handleAddToCart}
              disabled={!cake.isAvailable}
            >
              <ShoppingCart className="mr-2" /> Add to Cart
            </Button>
            <Button 
              variant="secondary" 
              className="flex-1" 
              size="lg"
            >
              Buy Now
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Image Modal */}
      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{cake.name}</DialogTitle>
          </DialogHeader>
          <Image 
            src={cake.image[selectedImage]} 
            alt={cake.name}
            width={1200}
            height={1200}
            className="w-full max-h-[80vh] object-contain"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}