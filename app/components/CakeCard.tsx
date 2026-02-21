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
  caketype: "cake" | "pastries";
  type: "contains egg" | "eggless";
  prices: Price[];
  image: string[];
  reviews: Reviews[];
  averageRating: number;
  isAvailable: boolean;
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
   // console.log(quantity);
    if (price)
      addToCart({
        id: cake._id,
        name: cake.name,
        caketype: cake.caketype,
        price: price.sellPrice,
        weight: price.weight,
        quantity: quantity,
        image: cake.image[0],
        cakeMessage:""
      });
  };
  const handleBuyNow = (cake: Cake) => {
    const lowestPrice = cake.prices.reduce((min, price) =>
      price.sellPrice < min.sellPrice ? price : min
    );
    addToCart({
      id: cake._id,
      name: cake.name,
      caketype: cake.caketype,
      price: lowestPrice.sellPrice,
      quantity: 1,
      image: cake.image[0],
      weight: lowestPrice.weight,
      cakeMessage:""
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
      className="group relative overflow-hidden rounded-2xl border border-brand-pink/10 bg-white shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative overflow-hidden">
        <div
          className={`aspect-[4/3] w-full overflow-hidden transition-all duration-500 ${
            isHovered ? "scale-105" : "scale-100"
          }`}
        >
          <img
            src={cake.image[0]}
            alt={cake.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Image Overlay on Hover (desktop) */}
        {!isMobile && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
        )}

        {/* Category Badge */}
        <Badge
          variant="secondary"
          className={`absolute top-3 left-3 z-10 rounded-xl border-0 bg-white/90 backdrop-blur-sm shadow-soft px-3 py-1 text-xs font-semibold ${getTypeStyles(cake.type)}`}
        >
          <GrSquare className="mr-1.5" />
          {cake.type.toUpperCase()}
        </Badge>

        {/* Favorite Button */}
        {session && (
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-3 right-3 z-10 h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm shadow-soft transition-all duration-300 hover:scale-110 ${
              isWishlisted
                ? "text-brand-pink hover:text-brand-pink"
                : "text-brand-text-secondary hover:text-brand-pink"
            }`}
            onClick={handleWishlistToggle}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
          </Button>
        )}

        {/* Quick View Button - Conditionally rendered based on isMobile */}
        {!isMobile && (
          <Button
            variant="secondary"
            className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 z-20 rounded-xl bg-white/95 backdrop-blur-sm text-brand-text shadow-elevated hover:bg-white px-5 h-10 text-sm font-medium"
            onClick={() => setShowModal(true)}
          >
            <Eye className="mr-2 h-4 w-4 text-brand-pink" />
            Quick View
          </Button>
        )}

        {/* Price Tag */}
        <div className="absolute bottom-3 right-3 z-10 bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] text-white rounded-xl px-4 py-2 font-bold text-sm shadow-glow transition-all duration-300 hover:scale-105">
          ₹{(getCurrentPrice() * quantity).toFixed(2)}
        </div>
      </div>

      {/* Content Section */}
      <CardHeader className="space-y-2 px-5 pt-5 pb-2">
        <div className="flex justify-between items-start">
          <Link href={`/cakes/${cake._id}`} className="w-full group/link">
            {/* <Button
                  variant="outline"
                  className="w-full border-2 border-[#FF9494] text-[#FF9494] hover:bg-[#FF9494] hover:text-white transition-colors duration-300"
                >
                  View Details
                </Button> */}

            <CardTitle className="font-display text-xl font-bold text-brand-text line-clamp-1 group-hover/link:text-brand-pink transition-colors duration-300">
              {cake.name}
            </CardTitle>
          </Link>
        </div>
        {/* <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">4.5</span>
        </div> */}
        <div className="flex items-center gap-1.5">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= Math.round(cake.averageRating)
                    ? "text-amber-400 fill-amber-400"
                    : "text-gray-200 fill-gray-200"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-brand-text-secondary font-medium">
            {cake.averageRating.toFixed(1)} ({cake.reviews?.length || 0}{" "}
            reviews)
          </span>
        </div>
        <CardDescription className="text-sm text-brand-text-secondary leading-relaxed line-clamp-2">
          {cake.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-5 pt-2 pb-3">
        {/* Weight & Quantity Selectors */}
        <div className="flex gap-2 w-full">
          <Select value={selectedWeight} onValueChange={setSelectedWeight}>
            <SelectTrigger className="w-1/2 border-2 border-brand-pink/15 rounded-xl h-10 text-sm text-brand-text bg-brand-cream/30 focus:border-brand-pink transition-all duration-300">
              <SelectValue placeholder="Weight" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-brand-pink/20 shadow-elevated">
              {cake.prices.map((price) => (
                <SelectItem key={price.weight} value={price.weight.toString()}>
                  {price.weight} {cake.caketype === "cake" ? "Kg" : "pieces"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center border-2 border-brand-pink/15 rounded-xl w-1/2 bg-brand-cream/30 overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleQuantityChange(-1)}
              className="h-10 w-10 rounded-none hover:bg-brand-pink/10 text-brand-text-secondary hover:text-brand-pink transition-all duration-300"
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <span className="flex-1 text-center text-sm font-semibold text-brand-text">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleQuantityChange(1)}
              className="h-10 w-10 rounded-none hover:bg-brand-pink/10 text-brand-text-secondary hover:text-brand-pink transition-all duration-300"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 px-5 pb-5 pt-0">
        {/* Action Buttons */}
        <div className="flex gap-2 w-full">
        {cake.isAvailable ? (
    <>
     <Button
            className="w-full bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] hover:shadow-glow text-white rounded-xl h-11 font-semibold text-sm transition-all duration-300 hover:opacity-90 border-0"
            onClick={() => handleBuyNow(cake)}
          >
            Buy Now
          </Button>
          <Button
            onClick={handleAddToCart}
            className="w-full bg-brand-text hover:bg-brand-text/90 text-white rounded-xl h-11 font-semibold text-sm transition-all duration-300 border-0"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
    </>
  ) : (
    /* "Out of Stock" button */
    <Button
      className="w-full bg-gray-100 text-brand-text-secondary rounded-xl h-11 font-semibold text-sm opacity-60 cursor-not-allowed border-0"
      disabled
    >
      Out of Stock
    </Button>
  )}

        </div>

        {/* Order Timeline */}
        <div className="flex justify-between items-center w-full pt-3 border-t border-brand-pink/10">
          <div className="flex flex-col items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] shadow-glow" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-brand-text-secondary">Order</span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-brand-pink/30 to-brand-pink/30 mx-3" />
          <div className="flex flex-col items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] shadow-glow" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-brand-text-secondary">Bake</span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-brand-pink/30 to-brand-pink/30 mx-3" />
          <div className="flex flex-col items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] shadow-glow" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-brand-text-secondary">Deliver</span>
          </div>
        </div>
      </CardFooter>

      {/* Quick View Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl rounded-2xl border-brand-pink/10 shadow-elevated p-0 overflow-hidden">
          <DialogHeader className="px-8 pt-8 pb-4">
            <DialogTitle className="font-display text-2xl text-brand-text">{cake.name}</DialogTitle>
            <DialogDescription className="text-brand-text-secondary leading-relaxed">{cake.description}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6 px-8 pb-8">
            <div className="rounded-2xl overflow-hidden shadow-card">
              <img
                src={cake.image[0]}
                alt={cake.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <h3 className="font-display text-sm font-semibold text-brand-text uppercase tracking-wider">Details</h3>
                <p className="text-sm text-brand-text-secondary leading-relaxed">
                  Our cakes are baked fresh daily using premium ingredients.
                  Each cake is handcrafted by our expert pastry chefs.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-display text-sm font-semibold text-brand-text uppercase tracking-wider">Type</h3>
                <Badge className="rounded-xl bg-brand-cream text-brand-text border-0 px-3 py-1 text-xs font-medium">
                  {cake.type}
                </Badge>
              </div>

              <div className="space-y-2">
                <h3 className="font-display text-sm font-semibold text-brand-text uppercase tracking-wider">Storage Instructions</h3>
                <p className="text-sm text-brand-text-secondary leading-relaxed">
                  Best served fresh. Can be refrigerated for up to 3 days. Do
                  not freeze.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-brand-cream/50 rounded-xl px-4 py-3">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-brand-text">4.5</span>
                <span className="text-sm text-brand-text-secondary">
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
