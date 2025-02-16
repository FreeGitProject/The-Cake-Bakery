"use client";

import { useState, useEffect,useCallback } from "react";
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
import { debounce } from "lodash"
interface Price {
  weight: number;
  costPrice: number;
  sellPrice: number;
}

interface Reviews {
  userId: string;
  rating: number;
}

interface Cake {
  _id: string;
  name: string;
  description: string;
  caketype: "cake" | "pastries";
  type: "contains egg" | "eggless";
  prices: Price[];
  image: string[];
  category: string;
  reviews: Reviews[];
  averageRating: number;
  isAvailable: boolean;
}

interface Category {
  _id: string;
  name: string;
}

interface WishlistItem {
  _id: string;
  cakeId: string;
}

interface CakeTypeProps {
  caketype: "cake" | "pastries";
}

interface PaginatedResponse {
  data: Cake[];
  total: number;
  page: number;
  limit: number;
}

export default function AllCakes({ caketype }: CakeTypeProps) {
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const { data: session } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
    fetchCakes();
    fetchCategories();
    if (session) {
      fetchWishlist();
    }
  }, [session, currentPage, debouncedSearchTerm, categoryFilter]);
  
  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const settings = await response.json();
        setItemsPerPage(settings.catalogPageSize);
        fetchCakes(settings.catalogPageSize);
      }
     
    
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };


  const debouncedSearch = useCallback(
    debounce((term) => setDebouncedSearchTerm(term), 500),
    []
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);


  const fetchCakes = async (perPage = itemsPerPage) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/cakes?caketype=${caketype}&page=${currentPage}&limit=${perPage}&search=${searchTerm}&category=${categoryFilter}`
      );
      const data: PaginatedResponse = await response.json();
      
      setCakes(data.data);
      setItemsPerPage(data.limit);
      setTotalPages(Math.ceil(data.total / data.limit));
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching cakes:", error);
      setIsLoading(false);
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

  const fetchWishlist = async () => {
    try {
      const response = await fetch("/api/wishlist");
      const wishlistData = await response.json();
      setWishlist(wishlistData);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  const handleAddToWishlist = async (cakeId: string) => {
    try {
      const cake = cakes.find((c) => c._id === cakeId);
      if (cake) {
        const response = await fetch("/api/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cakeId: cake._id,
            name: cake.name,
            image: cake.image[0],
            price: cake.prices[0].sellPrice,
            weight: cake.prices[0].weight,
          }),
        });
        
        if (response.ok) {
          const wishlistItem = await response.json();
          setWishlist([...wishlist, wishlistItem]);
          toast({
            title: "Added to wishlist",
            description: "The item has been added to your wishlist.",
          });
        }
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
    }
  };

  const handleRemoveFromWishlist = async (cakeId: string) => {
    const wishlistId = wishlist.find((item) => item.cakeId === cakeId)?._id;
    if (wishlistId) {
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
        }
      } catch (error) {
        console.error("Error removing from wishlist:", error);
      }
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };


  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value.toLowerCase() === "all" ? "" : value);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
        <Loader />
    );
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#4A4A4A] mb-4">
          Discover Our {caketype === "cake" ? "Cakes" : "Pastries"}
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore our delicious collection of handcrafted {caketype === "cake" ? "cakes" : "pastries"}, 
          made with love and the finest ingredients.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder={`Search for your favorite ${caketype}...`}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full border-2 border-gray-200 focus:border-[#FF9494] transition-colors duration-300"
            />
          </div>
          <div className="md:w-1/3">
            <Select onValueChange={handleCategoryChange}>
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

      {cakes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No {caketype} found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {cakes.map((cake) => (
            <CakeCard
              key={cake._id}
              cake={cake}
              isWishlisted={wishlist?.some((item) => item.cakeId === cake._id)}
              onAddToWishlist={handleAddToWishlist}
              onRemoveFromWishlist={handleRemoveFromWishlist}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center gap-2">
          <Button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            variant="outline"
            disabled={currentPage === 1}
            className="border-2 hover:text-[#FF9494] transition-colors duration-300"
          >
            Previous
          </Button>
          
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              variant={currentPage === i + 1 ? "default" : "outline"}
              className={`
                w-10 h-10 p-0 
                ${currentPage === i + 1
                  ? "bg-[#FF9494] hover:bg-[#FFB4B4]"
                  : "text-[#4A4A4A] hover:text-[#FF9494] border-2"
                }
                transition-colors duration-300
              `}
            >
              {i + 1}
            </Button>
          ))}
          
          <Button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            variant="outline"
            disabled={currentPage === totalPages}
            className="border-2 hover:text-[#FF9494] transition-colors duration-300"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}