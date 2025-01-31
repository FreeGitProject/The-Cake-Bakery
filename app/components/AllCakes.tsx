"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Loader from "./Loader";
import CakeCard from "./CakeCard";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";


interface Price {
  weight: number; // Weight in grams or kilograms
  costPrice: number; // Cost price
  sellPrice: number; // Selling price
}
interface Reviews {
  userId: string;
  rating: number;
}
interface Cake {
  _id: string;
  name: string;
  description: string;
  type: "contains egg" | "eggless";
  prices: Price[];
  image: string[];
  category: string;
  reviews:Reviews[];
  averageRating: number;
}

interface Category {
  _id: string;
  name: string;
}
interface WishlistItem {
  _id: string;
  cakeId: string;
}
export default function AllCakes() {
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [filteredCakes, setFilteredCakes] = useState<Cake[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cakesPerPage, setCakesPerPage] = useState(8);
  const { data: session } = useSession();
  const { toast } = useToast();
  useEffect(() => {
    fetchCakes();
    fetchCategories();
    if (session) {
      fetchWishlist()
    }
  }, [session]);

  useEffect(() => {
    filterCakes();
  }, [cakes, searchTerm, categoryFilter]);
  useEffect(() => {
    const fetchSettings = async () => {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const settings = await response.json();
        setCakesPerPage(settings.catalogPageSize);
      }
    };
    fetchSettings();
  }, []);
  const fetchWishlist = async () => {
    try {
      const [wishlistResponse] = await Promise.all([
     //   fetch("/api/cakes"),
       // fetch("/api/categories"),
        fetch("/api/wishlist"),
      ]);

    //  const cakesData = await cakesResponse.json();
     // const categoriesData = await categoriesResponse.json();
      const wishlistData = await wishlistResponse.json();

    //  setCakes(cakesData);
     // setCategories(categoriesData);
      setWishlist(wishlistData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const fetchCakes = async () => {
    try {
      const response = await fetch("/api/cakes");
      const data = await response.json();
      setCakes(data);
      if (data && data.length > 0) setLoading(false);
    } catch (error) {
      console.error("Error fetching cakes:", error);
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

  const filterCakes = () => {
    let filtered = cakes;
    if (searchTerm) {
      filtered = filtered.filter(
        (cake) =>
          cake.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cake.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (categoryFilter) {
      if (categoryFilter.toLowerCase() === "all") setCategoryFilter("");
      filtered = filtered.filter(
        (cake) => cake.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }
    setFilteredCakes(filtered);
    setCurrentPage(1);
  };

  const handleAddToWishlist = async (cakeId: string) => {
   // console.log(cakeId,"ca")
    try {
      const cake = cakes.find((c) => c._id === cakeId)
    //  console.log(cake)
      if (cake)
      {
        const response =await fetch("/api/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cakeId: cake._id,
            name: cake.name,
            image: cake.image[0],
            price: cake.prices[0].sellPrice,
            weight:cake.prices[0].weight,
          }),
        })
        const wishlistItems = await response.json()
       // console.log(response,wishlistItems)
       if (response.ok) {
        setWishlist([...wishlist,wishlistItems]);
        toast({
          title: "Added to wishlist",
          description: "The item has been added to your wishlist.",
        });
      }else {
          console.error("Failed to add to wishlist");
        }
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
    }
  };

  const handleRemoveFromWishlist = async (cakeId: string) => {
    //console.log(cakeId,"ca remove ")
    const wishlistId = wishlist.find((item) => item.cakeId === cakeId)?._id;
    //console.log(wishlistId)
    try {
      const response = await fetch(`/api/wishlist/${wishlistId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setWishlist(wishlist.filter((item) => item._id !== wishlistId));
        toast({
          title: "Removed from wishlist",
          description: "The item has been removed from your wishlist.",
        });
      }else {
        console.error("Failed to remove from wishlist");
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };
  const indexOfLastCake = currentPage * cakesPerPage;
  const indexOfFirstCake = indexOfLastCake - cakesPerPage;
  const currentCakes = filteredCakes.slice(indexOfFirstCake, indexOfLastCake);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="text-center mb-12">
        <motion.h2
                initial={{ opacity: 0, y: -50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.6 }}
              >
        <h1 className="text-4xl font-bold text-[#4A4A4A] mb-4">
          Discover Our Cakes
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore our delicious collection of handcrafted cakes, made with love
          and the finest ingredients.
        </p>
        </motion.h2>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search for your favorite cake..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border-2 border-gray-200 focus:border-[#FF9494] transition-colors duration-300"
            />
          </div>
          <div className="md:w-1/3">
            <Select onValueChange={(value) => setCategoryFilter(value)}>
              <SelectTrigger className="w-full border-2 border-gray-200 focus:border-[#FF9494] transition-colors duration-300">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Cakes Grid */}
     
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {currentCakes.map((cake, index) => (
           <motion.h2
           initial={{ opacity: 0, y: -50 }}
           whileInView={{ opacity: 1, y: 0 }}
           transition={{ duration: 1.6 }}
         >
           <CakeCard
           key={cake._id}
           cake={cake}
           isWishlisted={wishlist?.some((item) => item.cakeId === cake._id)}
           onAddToWishlist={handleAddToWishlist}
           onRemoveFromWishlist={handleRemoveFromWishlist}
         />
          </motion.h2>
       ))}
      </div>

      {/* Pagination */}
      <div className="mt-12 flex justify-center gap-2">
        {Array.from(
          { length: Math.ceil(filteredCakes.length / cakesPerPage) },
          (_, i) => (
            <Button
              key={i}
              onClick={() => paginate(i + 1)}
              variant={currentPage === i + 1 ? "default" : "outline"}
              className={`
              w-10 h-10 p-0 
              ${
                currentPage === i + 1
                  ? "bg-[#FF9494] hover:bg-[#FFB4B4]"
                  : "text-[#4A4A4A] hover:text-[#FF9494] border-2"
              }
              transition-colors duration-300
            `}
            >
              {i + 1}
            </Button>
          )
        )}
      </div>
    </div>
  );
}
