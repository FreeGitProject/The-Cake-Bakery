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

interface Category {
  _id: string;
  name: string;
}

export default function CreateCake() {
  const [newCake, setNewCake] = useState({
    name: "",
    description: "",
    price: 0,
    image: [""],
    category: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
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
      [name]: name === "price" ? parseFloat(value) : value,
    }));
  };

  const handleCategoryChange = (value: string) => {
    setNewCake((prev) => ({ ...prev, category: value }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/cakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCake),
      });
      if (response.ok) {
        router.push("/admin/cakes");
      }
    } catch (error) {
      console.error("Error adding cake:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Add New Cake</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
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
        <Button type="submit">Add Cake</Button>
      </form>
    </div>
  );
}
