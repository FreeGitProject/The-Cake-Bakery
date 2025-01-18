"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  _id: string;
  name: string;
}

interface Price {
  weight: number;
  costPrice: number;
  sellPrice: number;
}

interface Cake {
  name: string;
  description: string;
  type: string; // egg or eggless
  prices: Price[];
  image: string[];
  category: string;
}

export default function EditCake({ id }: { id: string }) {
  const { toast } = useToast()
  const [cake, setCake] = useState<Cake | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetchCakeDetails(id);
      fetchCategories();
    }
  }, [id]);

  const fetchCakeDetails = async (cakeId: string) => {
    try {
      const response = await fetch(`/api/cakes/${cakeId}`);
      const data = await response.json();
      setCake(data);
    } catch (error) {
      console.error("Error fetching cake details:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!cake) return;
    const { name, value } = e.target;
    setCake((prev) => ({
      ...prev!,
      [name]: value,
    }));
  };

  const handlePriceChange = (
    index: number,
    field: keyof Price,
    value: string
  ) => {
    if (!cake) return;
    setCake((prev) => ({
      ...prev!,
      prices: prev!.prices.map((price, i) =>
        i === index ? { ...price, [field]: parseFloat(value) } : price
      ),
    }));
  };

  const handleAddPrice = () => {
    if (!cake) return;
    setCake((prev) => ({
      ...prev!,
      prices: [...prev!.prices, { weight: 0, costPrice: 0, sellPrice: 0 }],
    }));
  };

  const handleRemovePrice = (index: number) => {
    if (!cake) return;
    setCake((prev) => ({
      ...prev!,
      prices: prev!.prices.filter((_, i) => i !== index),
    }));
  };

  const handleImageChange = (index: number, value: string) => {
    if (!cake) return;
    setCake((prev) => ({
      ...prev!,
      image: prev!.image.map((img, i) => (i === index ? value : img)),
    }));
  };

  const handleAddImage = () => {
    if (!cake) return;
    setCake((prev) => ({
      ...prev!,
      image: [...prev!.image, ""],
    }));
  };

  const handleRemoveImage = (index: number) => {
    if (!cake) return;
    setCake((prev) => ({
      ...prev!,
      image: prev!.image.filter((_, i) => i !== index),
    }));
  };

  const handleCategoryChange = (value: string) => {
    if (!cake) return;
    setCake((prev) => ({
      ...prev!,
      category: value,
    }));
  };

  const handleTypeChange = (value: string) => {
    if (!cake) return;
    setCake((prev) => ({
      ...prev!,
      type: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cake) return;
    try {
      const response = await fetch(`/api/cakes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cake),
      });
      if (response.ok) {
        toast({
          variant:"default",
          description: "Updated successfully."
          
        })
        router.push("/admin/cakes");
      }
    } catch (error) {
      console.error("Error updating cake:", error);
    }
  };

  if (!cake) return <p>Loading cake details...</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Cake</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="name"
          value={cake.name}
          onChange={handleInputChange}
          placeholder="Cake Name"
          required
        />
        <Textarea
          name="description"
          value={cake.description}
          onChange={handleInputChange}
          placeholder="Cake Description"
          required
        />
        <Select onValueChange={handleTypeChange} value={cake.type}>
          <SelectTrigger>
            <SelectValue placeholder="Select Type" />
          </SelectTrigger>
          <SelectContent>
          <SelectItem value="contains egg">Contains Egg</SelectItem>
          <SelectItem value="eggless">Eggless</SelectItem>
          </SelectContent>
        </Select>
        {cake.prices.map((price, index) => (
          <div key={index} className="flex space-x-2 items-center">
            <Input
              type="number"
              value={price.weight}
              onChange={(e) => handlePriceChange(index, "weight", e.target.value)}
              placeholder="Weight (Kg)"
              required
            />
            <Input
              type="number"
              value={price.costPrice}
              onChange={(e) =>
                handlePriceChange(index, "costPrice", e.target.value)
              }
              placeholder="Cost Price"
              required
            />
            <Input
              type="number"
              value={price.sellPrice}
              onChange={(e) =>
                handlePriceChange(index, "sellPrice", e.target.value)
              }
              placeholder="Sell Price"
              required
            />
            <Button
              variant="destructive"
              type="button"
              onClick={() => handleRemovePrice(index)}
            >
              Remove
            </Button>
          </div>
        ))}
        <Button type="button" onClick={handleAddPrice}>
          Add Price
        </Button>
        {cake.image.map((img, index) => (
          <div key={index} className="flex space-x-2 items-center">
            <Input
              value={img}
              onChange={(e) => handleImageChange(index, e.target.value)}
              placeholder={`Image URL ${index + 1}`}
              required
            />
            <Button
              variant="destructive"
              type="button"
              onClick={() => handleRemoveImage(index)}
            >
              Remove
            </Button>
          </div>
        ))}
        <Button type="button" onClick={handleAddImage}>
          Add Image
        </Button>
        <Select onValueChange={handleCategoryChange} value={cake.category}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category._id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit">Update Cake</Button>
      </form>
    </div>
  );
}
