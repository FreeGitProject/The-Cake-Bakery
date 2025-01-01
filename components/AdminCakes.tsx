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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Cake {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string[];
  category: string;
}
interface Category {
  _id: string;
  name: string;
}

export default function AdminCakes() {
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [newCake, setNewCake] = useState<Omit<Cake, "_id">>({
    name: "",
    description: "",
    price: 0,
    image: [],
    category: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCakes();
    fetchCategories();
    handleAddImage();
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
  const fetchCakes = async () => {
    try {
      const response = await fetch("/api/cakes");
      const data = await response.json();
      setCakes(data);
    } catch (error) {
      console.error("Error fetching cakes:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewCake((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) : value,
    }));
  };

  const handleCategoryChange = (value: string) => {
    setNewCake((prev) => ({ ...prev, category: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/cakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCake),
      });
      if (response.ok) {
        fetchCakes();
        setNewCake({
          name: "",
          description: "",
          price: 0,
          image: [],
          category: "",
        });
      }
    } catch (error) {
      console.error("Error adding cake:", error);
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
  const handleImageChange = (index: number, value: string) => {
    setNewCake((prev) => ({
      ...prev,
      image: prev.image.map((img, i) => (i === index ? value : img)),
    }));
  };

  const handleAddImage = () => {
    setNewCake((prev) => ({
      ...prev,
      image: [...(prev.image || []), ""], // Add an empty string for the new input field
    }));
  };

  const handleRemoveImage = (index: number): void => {
    if (newCake.image.length > 1) {
      const updatedImages = [...newCake.image];
      updatedImages.splice(index, 1);
      setNewCake({ ...newCake, image: updatedImages });
    } else {
      alert("At least one image is required.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Cakes</h1>
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <Input
          name="name"
          value={newCake.name}
          onChange={handleInputChange}
          placeholder="Cake Name"
          required
        />
        <Textarea
          name="description"
          value={newCake.description}
          onChange={handleInputChange}
          placeholder="Cake Description"
          required
        />
        <Input
          name="price"
          type="number"
          value={newCake.price}
          onChange={handleInputChange}
          placeholder="Price"
          step="0.01"
          required
        />
        {newCake.image.map((image, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Input
              value={image}
              onChange={(e) => handleImageChange(index, e.target.value)}
              placeholder={`Image URL ${index + 1}`}
              required
            />
            {/* Hide the "Remove" button for the first input field */}
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
          <SelectTrigger className="text-black rounded-md shadow-sm focus:ring-2">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg z-10">
            {categories.map((category) => (
              <SelectItem
                key={category._id}
                value={category.name}
                className="px-4 py-2 hover:bg-blue-100 hover:text-blue-600 cursor-pointer"
              >
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit">Add Cake</Button>
      </form>
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
              <p className="font-bold">${cake.price.toFixed(2)}</p>
              <p className="text-sm text-gray-500">Category: {cake.category}</p>
            </CardContent>
            <CardFooter>
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
