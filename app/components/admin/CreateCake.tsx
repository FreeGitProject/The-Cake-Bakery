"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";


interface Category {
  _id: string;
  name: string;
}

export default function CreateCake() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [newCake, setNewCake] = useState({
    name: "",
    description: "",
    caketype:"cake",//caketype means cake or pastries
    type: "eggless",
    prices: [{ weight: 0, costPrice: 0, sellPrice: 0 }],
    image: [""],
    category: "",
    isAvailable: true
  });
  const [categories, setCategories] = useState<Category[]>([]);
 // const [favorites, setFavorites] = useState(true)
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, []);

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
    const { name, value } = e.target;
    setNewCake((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTypeChange = (value: string) => {
    setNewCake((prev) => ({ ...prev, type: value }));
  };
  const handleCakeTypeChange = (value: string) => {
    setNewCake((prev) => ({ ...prev, caketype: value }));
  };

  const handlePriceChange = (
    index: number,
    field: "weight" | "costPrice" | "sellPrice",
    value: number
  ) => {
    setNewCake((prev) => ({
      ...prev,
      prices: prev.prices.map((price, i) =>
        i === index ? { ...price, [field]: value } : price
      ),
    }));
  };

  const handleAddPrice = () => {
    setNewCake((prev) => ({
      ...prev,
      prices: [...prev.prices, { weight: 0, costPrice: 0, sellPrice: 0 }],
    }));
  };

  const handleRemovePrice = (index: number) => {
    setNewCake((prev) => ({
      ...prev,
      prices: prev.prices.filter((_, i) => i !== index),
    }));
  };

  const handleImageChange = (index: number, value: string) => {
    setNewCake((prev) => ({
      ...prev,
      image: prev.image.map((img, i) => (i === index ? value : img)),
    }));
  };

  const handleAddImage = () => {
    setNewCake((prev) => ({
      ...prev,
      image: [...(prev.image || []), ""],
    }));
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...newCake.image];
    updatedImages.splice(index, 1);
    setNewCake({ ...newCake, image: updatedImages });
  };

  const handleCategoryChange = (value: string) => {
    setNewCake((prev) => ({ ...prev, category: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true)
    try {
      const response = await fetch("/api/cakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCake),
      });
      if (response.ok) {
        toast({
          variant:"default",
          description: "Created successfully."
          
        })
        router.push("/admin/cakes");
      }
    } catch (error) {
      console.error("Error adding cake:", error);
    }finally {
      setIsLoading(false)
    }
  };
  const handleSwitchChange = (checked: boolean) => {
    setNewCake((prevFavorite) => ({ ...prevFavorite, isAvailable: checked }))
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Add New Cake</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="name"
          value={newCake.name}
          onChange={handleInputChange}
          placeholder="Name"
          required
        />
        <Textarea
          name="description"
          value={newCake.description}
          onChange={handleInputChange}
          placeholder="Description"
          required
        />
            <Select onValueChange={handleCakeTypeChange} value={newCake.caketype}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cake">Cake</SelectItem>
            <SelectItem value="pastries">Pastry</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={handleTypeChange} value={newCake.type}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Contains Egg">Contains Egg</SelectItem>
            <SelectItem value="eggless">Eggless</SelectItem>
          </SelectContent>
        </Select>
        <div>
          <h3 className="font-bold">Prices</h3>
          {newCake.prices.map((price, index) => (
            <div key={index} className="flex space-x-2 items-center">
              <Input
                type="number"
                value={price.weight}
                onChange={(e) =>
                  handlePriceChange(index, "weight", parseFloat(e.target.value))
                }
                placeholder="Weight (e.Kg., 500)"
                required
              />
              <Input
                type="number"
                value={price.costPrice}
                onChange={(e) =>
                  handlePriceChange(index, "costPrice", parseFloat(e.target.value))
                }
                placeholder="Cost Price"
                required
              />
              <Input
                type="number"
                value={price.sellPrice}
                onChange={(e) =>
                  handlePriceChange(index, "sellPrice", parseFloat(e.target.value))
                }
                placeholder="Sell Price"
                required
              />
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleRemovePrice(index)}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button type="button" onClick={handleAddPrice}>
            Add Price
          </Button>
        </div>
        {newCake.image.map((image, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Input
              value={image}
              onChange={(e) => handleImageChange(index, e.target.value)}
              placeholder={`Image URL ${index + 1}`}
              required
            />
            {index > 0 && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleRemoveImage(index)}
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button type="button" onClick={handleAddImage}>
          Add Image
        </Button>
        <Select onValueChange={handleCategoryChange} value={newCake.category}>
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
        <div className="flex items-center space-x-2">
          <Switch
            id="isAvailable"
            checked={newCake.isAvailable}
            onCheckedChange={handleSwitchChange}
          />
          <Label htmlFor="isAvailable">Available</Label>
        </div>
        <Button type="submit" disabled={isLoading}>
        {isLoading ? "Adding..." : "Add Cake"}
      </Button>
      </form>
    </div>
  );
}
