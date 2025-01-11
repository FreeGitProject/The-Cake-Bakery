"use client";

import { useState, useEffect, useRef } from "react";
import ImageMagnifier from "@/components/common/ImageMagnifier";
import { Button } from "@/components/ui/button";
import { GrSquare } from "react-icons/gr";
import Loader from "./Loader";
import { FaPlayCircle } from "react-icons/fa"; // Example video icon from React Icons
import Image from "next/image";
import { useCart } from "@/context/CartContext";

interface Price {
  weight: number; // Weight in grams or kilograms
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

// Helper function to convert YouTube URL to embed format
const convertToEmbedUrl = (videoUrl: string): string | null => {
  try {
    if (!videoUrl || typeof videoUrl !== "string") return null;

    // Trim whitespace from the URL
    videoUrl = videoUrl.trim();

    // Check if the URL starts with "http"
    if (videoUrl.toLowerCase().includes("http")) {
      // Extract video ID for different patterns (YouTube and Vimeo)
      const videoIdMatch = videoUrl.match(
        /(?:\?v=|&v=|\/v\/|\/embed\/|youtu\.be\/|\/shorts\/|\/)([a-zA-Z0-9_-]{11})/
      );

      if (videoIdMatch && videoIdMatch[1]) {
        const videoId = videoIdMatch[1];

        // Handle YouTube cases
        if (
          videoUrl.toLowerCase().includes("youtube") ||
          videoUrl.toLowerCase().includes("youtu.be")
        ) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }

      // Handle Vimeo cases
      if (videoUrl.toLowerCase().includes("vimeo")) {
        const vimeoIdMatch = videoUrl.match(/(?:vimeo\.com\/)([0-9]+)/);
        if (vimeoIdMatch && vimeoIdMatch[1]) {
          const vimeoId = vimeoIdMatch[1];
          return `https://player.vimeo.com/video/${vimeoId}`;
        }
      }
    } else {
      // Assume input is a direct video ID or some invalid format
      const alphaRegex = /[a-zA-Z]/;
      if (alphaRegex.test(videoUrl)) {
        return `https://www.youtube.com/embed/${videoUrl}`;
      } else {
        return `https://player.vimeo.com/video/${videoUrl}`;
      }
    }

    return null; // Fallback for unrecognized URLs
  } catch (error) {
    console.error("Error processing video URL:", error);
    return null; // Return null in case of an error
  }
};
const getThumbnailUrl = (url: string): string | null => {
  if (!url || typeof url !== "string") return null;

  // Check if it's a YouTube video URL
  const isYouTubeVideo =
    url.includes("youtube.com") || url.includes("youtu.be");

  if (isYouTubeVideo) {
    // Extract video ID for different YouTube URL patterns
    const videoIdMatch = url.match(
      /(?:\?v=|&v=|\/v\/|\/embed\/|youtu\.be\/|\/shorts\/|\/)([a-zA-Z0-9_-]{11})/
    );

    if (videoIdMatch && videoIdMatch[1]) {
      const videoId = videoIdMatch[1];
      // Return the YouTube video thumbnail URL
      return `https://img.youtube.com/vi/${videoId}/0.jpg`;
    }
  }

  // If it's not a video, assume it's an image URL
  return url;
};

export default function CakeDetails({ id }: { id: string }) {
  const [cake, setCake] = useState<Cake | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [select, setSelect] = useState<number>(0);
  const [selectedWeightIndex, setSelectedWeightIndex] = useState<number>(0);
  const thumbnailsContainerRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchCake = async () => {
      try {
        const response = await fetch(`/api/cakes/${id}`);
        const data = await response.json();
        setCake(data);
      } catch (error) {
        console.error("Error fetching cake details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCake();
  }, [id]);

  const handleAddToCart = (cake: Cake) => {
    const selectedPrice = cake.prices[selectedWeightIndex];
    addToCart({
      id: id,
      name: cake.name,
      price: selectedPrice.sellPrice,
      weight: selectedPrice.weight,
      quantity: 1,
      image: cake.image[0],
    });
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* First Column: Scrollable Thumbnail List */}
        <div className="w-full lg:w-[10%] relative">
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
                  } w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] p-[5px] cursor-pointer transition-all duration-200 hover:border-primary`}
                  onClick={() => setSelect(index)}
                >
                  <Image
                    src={thumbnailUrl || "/default-image.jpg"}
                    alt={`Cake ${index}`}
                    width={100}
                    height={100}
                    className="w-full h-full object-cover"
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

        {/* Second Column: Main Image or Video */}
        <div className="w-full lg:w-[40%] p-1">
          <div className="relative bg-white">
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
              <div className="w-full h-[200px] sm:h-[300px] lg:h-[500px] flex items-center justify-center">
                <ImageMagnifier
                  src={cake.image[select]}
                  width={500}
                  height={500}
                  magnifierHeight={150}
                  magnifierWidth={150}
                  zoomLevel={2}
                  alt={cake.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
          </div>
        </div>

        {/* Third Column: Description Section */}
        <div className="w-full lg:w-[50%]">
          <div className="p-2">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{cake.name}</h1>
            <div className="flex items-center text-green-600 mb-4">
              <GrSquare className="mr-1" />
              <span className="text-sm font-medium">
                {cake.type.toUpperCase()}
              </span>
            </div>
            <p className="text-sm sm:text-base text-gray-700 mb-4">
              {cake.description}
            </p>
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-600">
                Select Weight:
              </label>
              <select
                className="w-full mt-1 p-2 border rounded-lg"
                value={selectedWeightIndex}
                onChange={(e) => setSelectedWeightIndex(Number(e.target.value))}
              >
                {cake.prices.map((price, index) => (
                  <option key={index} value={index}>
                    {price.weight}Kg - ₹{price.sellPrice}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={() => handleAddToCart(cake)}
              className="w-full mt-4 py-3 sm:py-4 text-sm sm:text-base"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
