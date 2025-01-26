/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState } from "react";
import { Heart, Star, Eye, Minus, Plus, ShoppingCart } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCart } from "@/context/CartContext";
import { GrSquare } from "react-icons/gr";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
//import { toast } from "@/hooks/use-toast";

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
  type: "contains egg" | "eggless";
  prices: Price[];
  image: string[];
  reviews: Reviews[];
  averageRating: number;
}

interface CakeCardProps {
  cake: Cake;
  isWishlisted: boolean;
  onAddToWishlist: (cakeId: string) => void;
  onRemoveFromWishlist: (cakeId: string) => void;
}

export default function CakeCard({
  cake,
  isWishlisted,
  onAddToWishlist,
  onRemoveFromWishlist,
}: CakeCardProps) {
  const handleWishlistToggle = () => {
    if (isWishlisted) {
      onRemoveFromWishlist(cake._id);
      // toast({
      //   title: "Removed from wishlist",
      //   description: "The item has been removed from your wishlist.",
      // });
    } else {
      onAddToWishlist(cake._id);
      // toast({
      //   title: "Added to wishlist",
      //   description: "The item has been added to your wishlist.",
      // });
    }
  };
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  // const [isLiked, setIsLiked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState(
    cake.prices[0].weight.toString()
  );
  const { data: session } = useSession();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  // Add useEffect to check screen size
  React.useEffect(() => {
    const checkMobileView = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind's md breakpoint is 768px
    };

    // Check initial screen size
    checkMobileView();

    // Add event listener for window resize
    window.addEventListener('resize', checkMobileView);

    // Cleanup event listener
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  const handleAddToCart = () => {
    const price = cake.prices.find(
      (p) => p.weight.toString() === selectedWeight
    );
    console.log(quantity);
    if (price)
      addToCart({
        id: cake._id,
        name: cake.name,
        price: price.sellPrice,
        weight: price.weight,
        quantity: quantity,
        image: cake.image[0],
      });
  };
  const handleBuyNow = (cake: Cake) => {
    const lowestPrice = cake.prices.reduce((min, price) =>
      price.sellPrice < min.sellPrice ? price : min
    );
    addToCart({
      id: cake._id,
      name: cake.name,
      price: lowestPrice.sellPrice,
      quantity: 1,
      image: cake.image[0],
      weight: lowestPrice.weight,
    });
    router.push("/checkout");
  };
  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };
  const getCurrentPrice = () => {
    const price = cake.prices.find(
      (p) => p.weight.toString() === selectedWeight
    );
    return price ? price.sellPrice : 0;
  };
  const getTypeStyles = (type: string): string | null => {
    if (type.toLowerCase() === "eggless") {
      return " text-green-800";
    }
    return "text-[#944a28]";
  };

  return (
    <Card
      className="transition-all duration-300 hover:shadow-xl relative overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Category Badge */}
      <Badge
        variant="secondary"
        className={`absolute top-3 left-3 z-10 ${getTypeStyles(cake.type)}`}
      >
        <GrSquare className="mr-1 " />
        {cake.type.toUpperCase()}
      </Badge>

     {/* Quick View Button - Conditionally rendered based on isMobile */}
      {!isMobile && (
        <Button
          variant="secondary"
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
          onClick={() => setShowModal(true)}
        >
          <Eye className="mr-2 h-4 w-4" />
          Quick View
        </Button>
      )}

      {/* Favorite Button */}
      {session && (
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-3 right-3 z-10 transition-all duration-300 ${
            isWishlisted
              ? "text-red-500 hover:text-red-600"
              : "text-gray-400 hover:text-red-500"
          }`}
          onClick={handleWishlistToggle}
        >
          <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
        </Button>
      )}

      <CardHeader className="space-y-1 pt-12">
        <div className="flex justify-between items-start">
          <Link href={`/cakes/${cake._id}`} className="w-full">
            {/* <Button
                  variant="outline"
                  className="w-full border-2 border-[#FF9494] text-[#FF9494] hover:bg-[#FF9494] hover:text-white transition-colors duration-300"
                >
                  View Details
                </Button> */}

            <CardTitle className="text-2xl font-bold from-primary to-primary-foreground bg-clip-text  line-clamp-1">
              {cake.name}
            </CardTitle>
          </Link>
        </div>
        {/* <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">4.5</span>
        </div> */}
        <div className="flex items-center space-x-1">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(cake.averageRating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600">
            {cake.averageRating.toFixed(1)} ({cake.reviews?.length || 0}{" "}
            reviews)
          </span>
        </div>
        <CardDescription className="text-sm text-muted-foreground line-clamp-2">
          {cake.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="relative pt-4">
        <div
          className={`h-48 w-full rounded-lg overflow-hidden transform transition-all duration-300 ${
            isHovered ? "scale-105 lg:blur-sm md:blur-sm" : "scale-100"
          }`}
        >
          <img
            src={cake.image[0]}
            alt={cake.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="absolute bottom-4 right-4 bg-primary text-primary-foreground rounded-full px-4 py-2 font-bold shadow-lg transform transition-all duration-300 hover:scale-105">
          ₹{(getCurrentPrice() * quantity).toFixed(2)}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-3">
        <div className="flex gap-2 w-full">
          <Select value={selectedWeight} onValueChange={setSelectedWeight}>
            <SelectTrigger className="w-1/2">
              <SelectValue placeholder="Weight" />
            </SelectTrigger>
            <SelectContent>
              {cake.prices.map((price) => (
                <SelectItem key={price.weight} value={price.weight.toString()}>
                  {price.weight}Kg
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center border rounded-md w-1/2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleQuantityChange(-1)}
              className="h-8 w-8"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="flex-1 text-center">{quantity}</span>
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

        <div className="flex gap-2 w-full">
          <Button
            className="w-full from-primary to-primary-foreground hover:opacity-90 transition-all duration-300"
            onClick={() => handleBuyNow(cake)}
          >
            Buy Now
          </Button>
          <Button
            onClick={handleAddToCart}
            className="w-full from-primary to-primary-foreground hover:opacity-90 transition-all duration-300"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </div>
        {/* Order Timeline */}
        <div className="flex justify-between w-full text-xs text-muted-foreground">
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
      </CardFooter>

      {/* Quick View Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{cake.name}</DialogTitle>
            <DialogDescription>{cake.description}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg overflow-hidden">
              <img
                src={cake.image[0]}
                alt={cake.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Details</h3>
                <p className="text-sm text-muted-foreground">
                  Our cakes are baked fresh daily using premium ingredients.
                  Each cake is handcrafted by our expert pastry chefs.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Type</h3>
                <p className="text-sm text-muted-foreground">{cake.type}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Storage Instructions</h3>
                <p className="text-sm text-muted-foreground">
                  Best served fresh. Can be refrigerated for up to 3 days. Do
                  not freeze.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">4.5</span>
                <span className="text-sm text-muted-foreground">
                  (128 reviews)
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
