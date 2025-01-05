"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

interface Category {
  _id: string;
  name: string;
}

interface Cake {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string[];
  category: string;
}

export default function EditCake({ id }: { id: string }) {
  const [cake, setCake] = useState<Omit<Cake, "_id"> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();
  const cakeId = id;

  useEffect(() => {
    if (cakeId) {
      fetchCakeDetails(cakeId);
      fetchCategories();
    }
  }, [cakeId]);

  const fetchCakeDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/cakes/${id}`);
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
    if (cake) {
      const { name, value } = e.target;
      setCake((prev) => {
        if (!prev) return prev; // Return early if `prev` is null
        return {
          ...prev,
          [name]: name === "price" ? parseFloat(value) : value,
        };
      });
    }
  };
  
  const handleCategoryChange = (value: string) => {
    if (cake) {
      setCake((prev) => {
        if (!prev) return prev; // Return early if `prev` is null
        return {
          ...prev,
          category: value,
        };
      });
    }
  };
  

  const handleImageChange = (index: number, value: string) => {
    if (cake) {
      setCake((prev) => {
        if (!prev) return prev; // Return early if `prev` is null
        return {
          ...prev,
          image: prev.image.map((img, i) => (i === index ? value : img)),
        };
      });
    }
  };
  

  const handleAddImage = () => {
    if (cake) {
      setCake((prev) => {
        if (!prev) return prev; // Return early if `prev` is null
        return {
          ...prev,
          image: [...prev.image, ""],
        };
      });
    }
  };
  

  const handleRemoveImage = (index: number) => {
    if (cake) {
      const updatedImages = [...cake.image];
      updatedImages.splice(index, 1);
      setCake({ ...cake, image: updatedImages });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cake && cakeId) {
      try {
        const response = await fetch(`/api/cakes/${cakeId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cake),
        });
        if (response.ok) {
          router.push("/admin/cakes");
        }
      } catch (error) {
        console.error("Error updating cake:", error);
      }
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
        <Input
          name="price"
          type="number"
          value={cake.price}
          onChange={handleInputChange}
          placeholder="Price"
          step="0.01"
          required
        />
        {cake.image.map((image, index) => (
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
