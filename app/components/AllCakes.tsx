"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import Image from "next/image";
import { GrSquare } from "react-icons/gr";
import Loader from "./Loader";
import { useCart } from '@/context/CartContext'
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


export default function AllCakes() {
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [filteredCakes, setFilteredCakes] = useState<Cake[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true);
  const cakesPerPage = 9;
  const { addToCart } = useCart()
  useEffect(() => {
    fetchCakes();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterCakes();
   
  }, [cakes, searchTerm, categoryFilter]);

  const fetchCakes = async () => {
    try {
      const response = await fetch("/api/cakes");
      const data = await response.json();
      setCakes(data);
      if(data && data.length>0)
      setLoading(false);
    } catch (error) {
      console.error("Error fetching cakes:", error);
      //setLoading(false);
    }
  };
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }
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
      if(categoryFilter.toLowerCase()=="all")
      setCategoryFilter("")
      filtered = filtered.filter((cake) => cake.category.toLowerCase() === categoryFilter.toLowerCase());
    }
    setFilteredCakes(filtered);
    setCurrentPage(1);
  };

  const indexOfLastCake = currentPage * cakesPerPage;
  const indexOfFirstCake = indexOfLastCake - cakesPerPage;
  const currentCakes = filteredCakes.slice(indexOfFirstCake, indexOfLastCake);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  if (loading) {
    return <div><Loader/></div>
  }
  const handleAddToCart = (cake: Cake) => {
    addToCart({
      id: cake._id,
      name: cake.name,
      price: cake.price,
      quantity: 1,
    })
  }
  return (
    <div className="container mx-auto px-4 py-8">
    {/* Header Section */}
    <div className="text-center mb-12">
      <h1 className="text-4xl font-bold text-[#4A4A4A] mb-4">Discover Our Cakes</h1>
      <p className="text-gray-600 max-w-2xl mx-auto">
        Explore our delicious collection of handcrafted cakes, made with love and the finest ingredients
      </p>
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {currentCakes.map((cake) => (
        <Card key={cake._id} className="group hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="relative pb-0">
            <div className="relative h-64 w-full mb-4 overflow-hidden rounded-t-lg">
              <Image
                src={cake.image[0]}
                alt={cake.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            {/* Eggless Badge */}
            <div className="absolute top-4 right-4 bg-green-100 text-green-600 px-3 py-1 rounded-full flex items-center gap-1">
              <GrSquare className="w-3 h-3" />
              <span className="text-xs font-medium">EGGLESS</span>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <CardTitle className="text-xl font-bold text-[#4A4A4A] mb-2">
              {cake.name}
            </CardTitle>
            <p className="text-gray-600 mb-4 line-clamp-2">
              {cake.description}
            </p>
            <p className="text-2xl font-bold text-[#FF9494]">
              ₹{cake.price.toFixed(2)}
            </p>
          </CardContent>
          <CardFooter className="p-6 pt-0 flex gap-4">
            <Link href={`/cakes/${cake._id}`} className="flex-1">
              <Button 
                variant="outline" 
                className="w-full border-2 border-[#FF9494] text-[#FF9494] hover:bg-[#FF9494] hover:text-white transition-colors duration-300"
              >
                View Details
              </Button>
            </Link>
            <Button 
              className="flex-1 bg-[#FF9494] hover:bg-[#FFB4B4] transition-colors duration-300"
              onClick={() => handleAddToCart(cake)}
            >
              Add to Cart
            </Button>
          </CardFooter>
        </Card>
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
              ${currentPage === i + 1 
                ? 'bg-[#FF9494] hover:bg-[#FFB4B4]' 
                : 'text-[#4A4A4A] hover:text-[#FF9494] border-2'
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
