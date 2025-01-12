/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface Cake {
  _id: string;
  name: string;
  description: string;
  type: string; // egg or eggless
  prices: {
    weight: number;
    costPrice: number;
    sellPrice: number;
  }[];
  image: string[];
  category: string;
}

export default function AdminCakes() {
  const [cakes, setCakes] = useState<Cake[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchCakes();
  }, []);

  const fetchCakes = async () => {
    try {
      const response = await fetch("/api/cakes");
      const data = await response.json();
      setCakes(data);
    } catch (error) {
      console.error("Error fetching cakes:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/cakes/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchCakes();
      }
    } catch (error) {
      console.error("Error deleting cake:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Cakes</h1>
      <Button onClick={() => router.push("/admin/create-cake")} className="mb-6">
        Add New Cake
      </Button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cakes.map((cake) => (
          <Card key={cake._id}>
            <CardHeader>
              <CardTitle>{cake.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={cake.image[0]}
                alt={cake.name}
                className="w-full h-48 object-cover mb-4"
              />
              <p className="text-sm text-gray-600 mb-2">
                {cake.description.substring(0, 100)}...
              </p>
              <p className="font-bold">
                Type: <span className="capitalize">{cake.type}</span>
              </p>
              <p className="font-bold">Prices:</p>
              <ul className="text-sm text-gray-600">
                {cake.prices.map((price, index) => (
                  <li key={index}>
                    {price.weight}Kg - Cost: ₹{price.costPrice.toFixed(2)}, Sell: ₹
                    {price.sellPrice.toFixed(2)}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-gray-500 mt-2">
                Category: {cake.category}
              </p>
            </CardContent>
            <CardFooter className="space-x-2">
              <Button onClick={() => router.push(`/admin/edit-cake/${cake._id}`)}>
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(cake._id)}
              >
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
