"use client";

import { useState, useEffect, useRef } from "react";
import ImageMagnifier from "@/components/common/ImageMagnifier";
import { GrSquare } from "react-icons/gr";
import Loader from "./Loader";
import { FaPlayCircle } from "react-icons/fa";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
//import { ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle } from "lucide-react";

interface Price {
  weight: number;
  costPrice: number;
  sellPrice: number;
}

interface Cake {
  id: string;
  name: string;
  description: string;
  type: string; // "egg" or "eggless"
  prices: Price[]; // Array of prices for different weights
  image: string[];
  category: string;
}
interface DeliveryStatus {
  deliverable: boolean;
  message: string;
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
  const [pincode, setPincode] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus | null>(
    null
  );
  
  useEffect(() => {
    const fetchCake = async () => {
      try {
        const response = await fetch(`/api/cakes/${id}`);
        const data = await response.json();
        setCake(data);
        setSelectedWeight(data.prices[0]);
      } catch (error) {
        console.error("Error fetching cake details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCake();
  }, [id]);


  const handleAddToCart = (cake: Cake) => {
    if (!selectedWeight) return;

    addToCart({
      id: id,
      name: cake.name,
      price: selectedWeight.sellPrice,
      weight: selectedWeight.weight,
      quantity: 1,
      image: cake.image[0],
    });
  };
  const getTypeStyles = (type: string): string | null => {
    if (type.toLowerCase() === "eggless") {
      return " text-green-800";
    }
    return "text-[#944a28]";
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

  if (loading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!cake) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600">Cake details not found.</p>
      </div>
    );
  }

  const Thumbnails = () => (
    <div className="flex lg:flex-col flex-row overflow-x-auto lg:overflow-y-auto lg:h-[400px] gap-2  lg:w-24 w-full">
      <div
        ref={thumbnailsContainerRef}
        className="h-[150px] sm:h-[150px] lg:h-[500px] overflow-x-auto lg:overflow-y-auto scrollbar-hide flex flex-row lg:flex-col items-center gap-2"
        style={{
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        {cake.image.map((i, index) => {
          const thumbnailUrl = getThumbnailUrl(i);
          const isYouTubeVideo =
            i.includes("youtube.com") || i.includes("youtu.be");
          return (
            <div
              key={index}
              className={`relative ${
                select === index
                  ? "border-2 border-primary"
                  : "border border-qgray-border"
              } w-[80px] h-[80px] sm:w-[90px] sm:h-[100px] p-[5px] cursor-pointer transition-all duration-200 hover:border-primary`}
              onClick={() => setSelect(index)}
            >
              <Image
                src={thumbnailUrl || "/default-image.jpg"}
                alt={`Cake ${index}`}
                width={100}
                height={100}
                className="w-full h-full object-contain"
              />
              {isYouTubeVideo && (
                <FaPlayCircle
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white opacity-75 text-2xl sm:text-3xl"
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
    <div className="relative flex-1 overflow-hidden">
      <div className="bg-white">
        {cake.image[select].includes("youtube.com") ||
        cake.image[select].includes("youtu.be") ? (
          convertToEmbedUrl(cake.image[select]) ? (
            <iframe
              className="w-full h-[200px] sm:h-[300px] lg:h-[500px]"
              src={convertToEmbedUrl(cake.image[select])!}
              title={cake.name}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <p className="text-red-500 text-center mt-4">
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
    if (!selectedWeight) return null;

    return (
      <div className="flex flex-col gap-4 p-4 lg:w-80">
        <div>
          <h1 className="text-2xl font-bold">{cake.name}</h1>
          <div className={`flex items-center mb-4 ${getTypeStyles(cake.type)}`}>
            <GrSquare className="mr-1 " />
            {/* <span className="text-sm font-medium">
                {cake.type.toUpperCase()}
              </span> */}
            <span className={`text-sm font-medium`}>
              {cake.type.toUpperCase()}
            </span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-2">
          Category: {cake.category}
        </p>
        <p className="text-gray-600">{cake.description}</p>

        <div className="space-y-4">
          <h2 className="font-semibold">Select Weight</h2>
          <div className="flex gap-2">
            {cake.prices.map((price) => (
              <button
                key={price.weight}
                onClick={() => setSelectedWeight(price)}
                className={`px-4 py-2 rounded-full border-2 transition-all duration-200
                ${
                  selectedWeight.weight === price.weight
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-200"
                }`}
              >
                {price.weight}Kg
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">
              ₹{selectedWeight.sellPrice}
            </span>

            {selectedWeight.costPrice != null &&
              selectedWeight.costPrice > 0 && (
                <>
                  <span className="text-lg text-gray-500 line-through">
                    ₹{selectedWeight.costPrice}
                  </span>
                  <span className="text-green-600 text-sm">
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
        </div>
        {/* Delivery Location Check */}
        <div className="mt-2">
          <h2 className="text-xl font-semibold mb-4">
            Check Delivery Availability
          </h2>
          <div className="flex items-end gap-4">
            <div className="flex-grow">
              <Label htmlFor="pincode">Enter Pincode</Label>
              <Input
                id="pincode"
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Enter your pincode"
              />
            </div>
            <Button onClick={checkDeliveryAvailability}>Check</Button>
          </div>
          {deliveryStatus && (
            <Alert
              className="mt-4"
              variant={deliveryStatus.deliverable ? "default" : "destructive"}
            >
              {deliveryStatus.deliverable ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {deliveryStatus.deliverable
                  ? "Delivery Available"
                  : "Delivery Unavailable"}
              </AlertTitle>
              <AlertDescription>{deliveryStatus.message}</AlertDescription>
            </Alert>
          )}
        </div>

        <Button
          onClick={() => handleAddToCart(cake)}
          className="w-full  from-primary to-primary-foreground hover:opacity-90 transition-all duration-300"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex lg:flex-row flex-col gap-4">
        <Thumbnails />
        <MainImage />
        <ProductInfo />
      </div>
    </div>
  );
}
