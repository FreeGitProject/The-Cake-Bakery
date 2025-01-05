"use client";

import { useState, useEffect, useRef } from "react";
import ImageMagnifier from "@/components/common/ImageMagnifier";
import { Button } from "@/components/ui/button";
import { GrSquare } from "react-icons/gr";
import Loader from "./Loader";
import { FaPlayCircle } from "react-icons/fa";
import Image from "next/image";

interface Cake {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string[];
  category: string;
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
      <div className="flex flex-wrap justify-between">
        {/* First Column: Scrollable Image List */}
        <div className="w-[10%] relative">
          <div 
            ref={thumbnailsContainerRef}
            className="h-[500px] overflow-y-auto scrollbar-hide flex flex-col items-center gap-2"
            style={{
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
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
                    select === index ? "border-2 border-primary" : "border border-qgray-border"
                  } w-[100px] h-[100px] min-h-[100px] p-[5px] cursor-pointer transition-all duration-200 hover:border-primary`}
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
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white opacity-75 text-3xl"
                      aria-label="Play Video"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Second Column: Fixed Main Image */}
        <div className="w-[35%] sticky top-0">
          <div className="w-full h-[500px] border border-qgray-border relative bg-white">
            {cake.image[select].includes("youtube.com") ||
            cake.image[select].includes("youtu.be") ? (
              convertToEmbedUrl(cake.image[select]) ? (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={convertToEmbedUrl(cake.image[select])!}
                  title={cake.name}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <p className="text-red-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  Video cannot be played. Invalid or restricted URL.
                </p>
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center">
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

        {/* Third Column: Description */}
        <div className="w-[55%]">
          <div className="p-6">
            <h1 className="text-4xl font-bold mb-2">{cake.name}</h1>
            <div className="flex items-center text-green-600 mb-4">
              <GrSquare className="mr-1" />
              <span className="text-sm font-medium">EGGLESS</span>
            </div>
            <p className="text-gray-700 mb-4">{cake.description}</p>
            <p className="text-3xl font-bold text-primary mb-4">
              ₹ {cake.price}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Category: <span className="font-semibold">{cake.category}</span>
            </p>
            <Button className="w-full mt-4">Add to Cart</Button>
          </div>
        </div>
      </div>
    </div>
  );
}