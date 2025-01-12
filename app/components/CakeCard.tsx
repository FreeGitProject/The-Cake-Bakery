"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { GrSquare } from "react-icons/gr";
import { useCart } from "@/context/CartContext";

interface Price {
  weight: number;
  sellPrice: number;
}

interface Cake {
  _id: string;
  name: string;
  description: string;
  type: "contains egg" | "eggless";
  prices: Price[];
  image: string[];
}

interface CakeCardProps {
  cake: Cake;
}

export default function CakeCard({ cake }: CakeCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (price: Price) => {
    addToCart({
      id: cake._id,
      name: cake.name,
      price: price.sellPrice,
      weight: price.weight,
      quantity: 1,
      image: cake.image[0],
    });
  };

  return (
    <Card className="group hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="relative pb-0">
        <div className="relative h-64 w-full mb-4 overflow-hidden rounded-t-lg">
          <Image
            src={cake.image[0]}
            alt={cake.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        {cake.type === "eggless" && (
          <div className="absolute top-4 right-4 bg-green-100 text-green-600 px-3 py-1 rounded-full flex items-center gap-1">
            <GrSquare className="w-3 h-3" />
            <span className="text-xs font-medium">EGGLESS</span>
          </div>
        )}
        {cake.type === "contains egg" && (
          <div className="absolute top-4 right-4 bg-red-100 text-[#944a28] px-3 py-1 rounded-full flex items-center gap-1">
            <GrSquare className="w-3 h-3" />
            <span className="text-xs font-medium">CONTAINS EGG</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-6">
        <CardTitle className="text-xl font-bold text-[#4A4A4A] mb-2">
          {cake.name}
        </CardTitle>
        <p className="text-gray-600 mb-4 line-clamp-2">{cake.description}</p>
        <div className="mt-4">
          {cake.prices.map((price, index) => (
            <div key={index} className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">
                {price.weight}Kg - ₹{price.sellPrice.toFixed(2)}
              </span>
              <Button
                className="text-sm bg-[#FF9494] hover:bg-[#FFB4B4] transition-colors duration-300"
                onClick={() => handleAddToCart(price)}
              >
                Add to Cart
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Link href={`/cakes/${cake._id}`} className="w-full">
          <Button
            variant="outline"
            className="w-full border-2 border-[#FF9494] text-[#FF9494] hover:bg-[#FF9494] hover:text-white transition-colors duration-300"
          >
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
