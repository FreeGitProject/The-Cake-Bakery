"use client";

import { useState, useEffect, useRef } from "react";
import ImageMagnifier from "@/components/common/ImageMagnifier";
import { GrSquare } from "react-icons/gr";
import Loader from "./Loader";
import { FaPlayCircle } from "react-icons/fa";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart } from "lucide-react";
//import { ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle } from "lucide-react";
import ReviewsAndRatings from "./ReviewsAndRatings";
import RecentlyViewed from "./RecentlyViewed";
import { toast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
//import { useRouter } from "next/navigation";
import AddonItemsModal from "@/components/AddonItemsModal"

interface Price {
  weight: number;
  costPrice: number;
  sellPrice: number;
}

interface Cake {
  _id: string;
  name: string;
  description: string;
  type: string; // "egg" or "eggless"
  //caketype: "cake" | "pastries";
  caketype: string; // "egg" or "eggless"
  prices: Price[]; // Array of prices for different weights
  image: string[];
  category: string;
  isAvailable: boolean;
}
interface DeliveryStatus {
  deliverable: boolean;
  message: string;
}
interface WishlistItem {
  _id: string;
  cakeId: string;
  name: string;
  image: string;
  price: number;
  weight: number;
}
const convertToEmbedUrl = (videoUrl: string): string | null => {
  try {
    if (!videoUrl || typeof videoUrl !== "string") return null;

    videoUrl = videoUrl.trim();

    if (videoUrl.toLowerCase().includes("http")) {
      const videoIdMatch = videoUrl.match(
        /(?:\?v=|&v=|\/v\/|\/embed\/|youtu\.be\/|\/shorts\/|\/)([a-zA-Z0-9_-]{11})/
      );

      if (videoIdMatch && videoIdMatch[1]) {
        const videoId = videoIdMatch[1];

        if (
          videoUrl.toLowerCase().includes("youtube") ||
          videoUrl.toLowerCase().includes("youtu.be")
        ) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }

      if (videoUrl.toLowerCase().includes("vimeo")) {
        const vimeoIdMatch = videoUrl.match(/(?:vimeo\.com\/)([0-9]+)/);
        if (vimeoIdMatch && vimeoIdMatch[1]) {
          const vimeoId = vimeoIdMatch[1];
          return `https://player.vimeo.com/video/${vimeoId}`;
        }
      }
    } else {
      const alphaRegex = /[a-zA-Z]/;
      if (alphaRegex.test(videoUrl)) {
        return `https://www.youtube.com/embed/${videoUrl}`;
      } else {
        return `https://player.vimeo.com/video/${videoUrl}`;
      }
    }

    return null;
  } catch (error) {
    console.error("Error processing video URL:", error);
    return null;
  }
};

const getThumbnailUrl = (url: string): string | null => {
  if (!url || typeof url !== "string") return null;

  const isYouTubeVideo =
    url.includes("youtube.com") || url.includes("youtu.be");

  if (isYouTubeVideo) {
    const videoIdMatch = url.match(
      /(?:\?v=|&v=|\/v\/|\/embed\/|youtu\.be\/|\/shorts\/|\/)([a-zA-Z0-9_-]{11})/
    );

    if (videoIdMatch && videoIdMatch[1]) {
      const videoId = videoIdMatch[1];
      return `https://img.youtube.com/vi/${videoId}/0.jpg`;
    }
  }

  return url;
};

export default function CakeDetails({ id }: { id: string }) {
  const [cake, setCake] = useState<Cake | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [select, setSelect] = useState<number>(0);
  const thumbnailsContainerRef = useRef<HTMLDivElement>(null);
  const [selectedWeight, setSelectedWeight] = useState<Price | null>(null);
  const { addToCart } = useCart();
  const { data: session } = useSession();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false)

  //const router = useRouter();
  // console.log(id,"id")
  const fetchCake = async () => {
    try {
      const response = await fetch(`/api/cakes/${id}`);
      const data = await response.json();
      // console.log(data,"DetailPage");
      setCake(data);
      setSelectedWeight(data.prices[0]);
    } catch (error) {
      console.error("Error fetching cake details:", error);
    } finally {
      setLoading(false);
    }
  };
  const checkWishlistStatus = async () => {
    try {
      const response = await fetch("/api/wishlist");
      const wishlistItems = await response.json();
      setIsInWishlist(
        wishlistItems.some((item: WishlistItem) => item.cakeId === id)
      );
    } catch (error) {
      console.error("Error checking wishlist status:", error);
    }
  };
  const handleWishlistToggle = async () => {
    if (!session) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to add items to your wishlist.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isInWishlist) {
        // Find the wishlist item ID
        const response = await fetch("/api/wishlist");
        const wishlistItems = await response.json();
        const wishlistItem = wishlistItems.find(
          (item: WishlistItem) => item.cakeId === id
        );

        if (wishlistItem) {
          await fetch(`/api/wishlist/${wishlistItem._id}`, {
            method: "DELETE",
          });
        }
      } else {
        await fetch("/api/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cakeId: id,
            name: cake?.name,
            image: cake?.image[0],
            price: selectedWeight?.sellPrice,
            weight: selectedWeight?.weight,
          }),
        });
      }
      setIsInWishlist(!isInWishlist);
      toast({
        title: isInWishlist ? "Removed from wishlist" : "Added to wishlist",
        description: isInWishlist
          ? "The item has been removed from your wishlist."
          : "The item has been added to your wishlist.",
      });
    } catch (error) {
      console.error("Error toggling wishlist item:", error);
      toast({
        title: "Error",
        description:
          "There was an error updating your wishlist. Please try again.",
        variant: "destructive",
      });
    }
  };
  useEffect(() => {
    fetchCake();
    if (session) {
      checkWishlistStatus();
    }
  }, [session]);


  if (loading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!cake) {
    return (
      <div className="text-center py-20">
        <p className="text-brand-text-secondary font-display text-lg">Cake details not found.</p>
      </div>
    );
  }

  const Thumbnails = () => (
    <div className="flex lg:flex-col flex-row overflow-x-auto lg:overflow-y-auto lg:h-[450px] gap-3 lg:w-24 w-full">
      <div
        ref={thumbnailsContainerRef}
        className="h-[100px] sm:h-[110px] lg:h-[450px] overflow-x-auto lg:overflow-y-auto scrollbar-hide flex flex-row lg:flex-col items-center gap-3"
        style={{
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        {cake.image?.map((i, index) => {
          const thumbnailUrl = getThumbnailUrl(i);
          const isYouTubeVideo =
            i.includes("youtube.com") || i.includes("youtu.be");
          return (
            <div
              key={index}
              className={`relative flex-shrink-0 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer
                ${
                  select === index
                    ? "ring-2 ring-brand-pink shadow-glow scale-105"
                    : "ring-1 ring-gray-200 hover:ring-brand-pink-light hover:shadow-soft"
                } w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] p-[3px] bg-white`}
              onClick={() => setSelect(index)}
            >
              <Image
                src={thumbnailUrl || "/default-image.jpg"}
                alt={`Cake ${index}`}
                width={100}
                height={100}
                className="w-full h-full object-cover rounded-lg"
              />
              {isYouTubeVideo && (
                <FaPlayCircle
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white opacity-80 text-2xl sm:text-3xl drop-shadow-lg"
                  aria-label="Play Video"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const MainImage = () => (
    <div className="relative flex-1 overflow-hidden rounded-2xl shadow-card bg-white">
      <div className="bg-white rounded-2xl overflow-hidden">
        {cake?.image[select]?.includes("youtube.com") ||
        cake?.image[select]?.includes("youtu.be") ? (
          convertToEmbedUrl(cake?.image[select]) ? (
            <iframe
              className="w-full h-[250px] sm:h-[350px] lg:h-[500px] rounded-2xl"
              src={convertToEmbedUrl(cake?.image[select])!}
              title={cake?.name}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <p className="text-red-500 text-center mt-4 py-12 font-medium">
              Video cannot be played. Invalid or restricted URL.
            </p>
          )
        ) : (
          <ImageMagnifier
            src={cake.image[select]}
            width={500}
            height={500}
            magnifierHeight={150}
            magnifierWidth={150}
            zoomLevel={2}
            alt={cake.name}
            className="w-full h-full object-contain"
          />
        )}
      </div>
      {/* not use for now because of this we can not use magnifier and  video paly  */}
      {/* <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 hover:opacity-100 transition-opacity">
        <button
          onClick={() => setSelect(prev => Math.max(0, prev - 1))}
          className="p-2 rounded-full bg-white/80 shadow-lg hover:bg-white"
          disabled={select === 0}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => setSelect(prev => Math.min(cake.image.length - 1, prev + 1))}
          className="p-2 rounded-full bg-white/80 shadow-lg hover:bg-white"
          disabled={select === cake.image.length - 1}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div> */}
    </div>
  );

  const ProductInfo = () => {
    const [pincode, setPincode] = useState("");
    const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus | null>(
      null
    );
    const [cakeMessage, setCakeMessage] = useState("")
    const handleAddToCart = (cake: Cake) => {
      if (!selectedWeight) return;

      addToCart({
        id: cake._id,
        name: cake.name,
        caketype: cake.caketype,
        price: selectedWeight.sellPrice,
        weight: selectedWeight.weight,
        quantity: 1,
        image: cake.image[0],
        cakeMessage,
      });
      setIsAddonModalOpen(true)
    };
    const handleBuyNow= (cake: Cake) => {
      //console.log(cake)
      if (cake && selectedWeight) {
        addToCart({
          id: cake._id,
          name: cake.name,
          caketype: cake.caketype,
          price: selectedWeight.sellPrice,
          quantity: 1,
          image: cake.image[0],
          weight: selectedWeight.weight,
          cakeMessage,
        });
        setIsAddonModalOpen(true)
        //router.push("/checkout");
      }
    };
    const checkDeliveryAvailability = async () => {
      try {
        const response = await fetch("/api/check-delivery", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ location: pincode }),
        });
        const data = await response.json();
        setDeliveryStatus(data);
      } catch (error) {
        console.error("Error checking delivery availability:", error);
        setDeliveryStatus({
          deliverable: false,
          message: "Error checking delivery availability. Please try again.",
        });
      }
    };
    if (!selectedWeight) return null;

    return (
      <div className="flex flex-col gap-5 lg:w-[360px] p-6 lg:p-0">
        {/* Header: Name + Wishlist */}
        <div>
          <div className="flex justify-between items-start gap-3">
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-brand-text leading-tight">
              {cake.name}
            </h1>
            {session && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleWishlistToggle}
                className={`flex-shrink-0 rounded-full h-10 w-10 transition-all duration-300 hover:bg-brand-pink-lighter/40 ${
                  isInWishlist ? "text-brand-pink" : "text-brand-text-secondary"
                }`}
              >
                <Heart
                  className={`h-5 w-5 transition-all duration-300 ${
                    isInWishlist ? "fill-brand-pink" : ""
                  }`}
                />
              </Button>
            )}
          </div>

          {/* Type badge */}
          <div className="flex items-center gap-2 mt-3">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase
                ${
                  cake.type.toLowerCase() === "eggless"
                    ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                    : "bg-amber-50 text-amber-800 ring-1 ring-amber-200"
                }`}
            >
              <GrSquare className="text-[10px]" />
              {cake.type.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Category */}
        <p className="text-sm text-brand-text-secondary">
          Category: <span className="font-medium text-brand-text">{cake.category}</span>
        </p>

        {/* Description */}
        <p className="text-brand-text-secondary leading-relaxed text-[15px]">
          {cake.description}
        </p>

        {/* Price Display */}
        <div className="bg-brand-cream/60 rounded-2xl p-4 space-y-1">
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-4xl font-bold text-brand-pink font-display">
              &#8377;{selectedWeight.sellPrice}
            </span>

            {selectedWeight.costPrice != null &&
              selectedWeight.costPrice > 0 && (
                <>
                  <span className="text-lg text-brand-text-secondary line-through">
                    &#8377;{selectedWeight.costPrice}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                    {Math.round(
                      (1 -
                        selectedWeight.sellPrice / selectedWeight.costPrice) *
                        100
                    )}
                    % OFF
                  </span>
                </>
              )}
          </div>
          <p className="text-xs text-brand-text-secondary">Inclusive of all taxes</p>
        </div>

        {/* Weight Selector */}
        <div className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-brand-text">Select Weight</h2>
          <div className="flex flex-wrap gap-2">
            {cake.prices.map((price) => (
              <button
                key={price.weight}
                onClick={() => setSelectedWeight(price)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300
                ${
                  selectedWeight.weight === price.weight
                    ? "bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] text-white shadow-glow ring-2 ring-brand-pink/30"
                    : "bg-white text-brand-text ring-1 ring-gray-200 hover:ring-brand-pink-light hover:bg-brand-cream/40"
                }`}
              >
                {price.weight} {cake.caketype === "cake" ? "Kg" : "pieces"}
              </button>
            ))}
          </div>
        </div>

        {/* Cake Message */}
        {cake.caketype !== 'pastries' && (
          <div className="space-y-2">
            <Label htmlFor="cakeMessage" className="text-sm font-medium text-brand-text">
              Cake Message
            </Label>
            <Input
              id="cakeMessage"
              placeholder="Enter a message for your cake (optional)"
              value={cakeMessage}
              onChange={(e) => setCakeMessage(e.target.value)}
              className="rounded-xl border-gray-200 focus-visible:ring-brand-pink/50 focus-visible:border-brand-pink transition-all duration-300 bg-white placeholder:text-gray-400"
            />
          </div>
        )}

        {/* Delivery Check */}
        <div className="bg-white rounded-2xl p-4 ring-1 ring-gray-100 shadow-soft space-y-3">
          <h2 className="font-display text-lg font-semibold text-brand-text">
            Check Delivery Availability
          </h2>
          <div className="flex items-end gap-3">
            <div className="flex-grow space-y-1.5">
              <Label htmlFor="pincode" className="text-sm text-brand-text-secondary">
                Enter Pincode
              </Label>
              <Input
                id="pincode"
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Enter your pincode"
                className="rounded-xl border-gray-200 focus-visible:ring-brand-pink/50 focus-visible:border-brand-pink transition-all duration-300 placeholder:text-gray-400"
              />
            </div>
            <Button
              onClick={checkDeliveryAvailability}
              className="rounded-xl bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] text-white font-semibold hover:shadow-glow hover:translate-y-[-1px] transition-all duration-300 border-0 h-9 px-5"
            >
              Check
            </Button>
          </div>
          {deliveryStatus && (
            <Alert
              className={`mt-2 rounded-xl border-0 ${
                deliveryStatus.deliverable
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
              variant={deliveryStatus.deliverable ? "default" : "destructive"}
            >
              {deliveryStatus.deliverable ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <AlertTitle className="font-semibold">
                {deliveryStatus.deliverable
                  ? "Delivery Available"
                  : "Delivery Unavailable"}
              </AlertTitle>
              <AlertDescription className="text-sm opacity-90">
                {deliveryStatus.message}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-1">
          {cake.isAvailable ? (
            <>
              {/* "Buy Now" button */}
              <Button
                className={`flex-1 h-12 rounded-xl bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] text-white font-semibold text-[15px] shadow-glow hover:shadow-glow-lg hover:translate-y-[-2px] active:translate-y-0 transition-all duration-300 border-0 ${
                  !selectedWeight ? "opacity-60 cursor-not-allowed" : ""
                }`}
                onClick={() => handleBuyNow(cake)}
                disabled={!selectedWeight}
              >
                Buy Now
              </Button>

              {/* "Add to Cart" button */}
              <Button
                onClick={() => handleAddToCart(cake)}
                className="flex-1 h-12 rounded-xl bg-white text-brand-pink font-semibold text-[15px] ring-2 ring-brand-pink hover:bg-brand-cream/50 hover:translate-y-[-2px] active:translate-y-0 transition-all duration-300 shadow-soft hover:shadow-card border-0"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </>
          ) : (
            /* "Out of Stock" button */
            <Button
              className="w-full h-12 rounded-xl bg-gray-100 text-gray-400 font-semibold text-[15px] cursor-not-allowed border-0 shadow-none"
              disabled
            >
              Out of Stock
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 animate-fade-in">
      <div className="flex lg:flex-row flex-col gap-6 lg:gap-10">
        <Thumbnails />
        <MainImage />
        <ProductInfo />
      </div>
      <div className="mt-16">
        <ReviewsAndRatings cakeId={id} />
      </div>
      <RecentlyViewed currentCakeId={id} />
      <AddonItemsModal isOpen={isAddonModalOpen} onClose={() => setIsAddonModalOpen(false) }  mode="buy"/>
    </div>
  );
}
