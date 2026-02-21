/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search, Filter, X, ChevronLeft, ChevronRight, Grid3X3, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "./Loader";
import CakeCard from "./CakeCard";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { debounce } from "lodash";
import { useMediaQuery } from "@/hooks/use-media-query";

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
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore] = useState(false);//setLoadingMore
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<string>("popular");
  const [isScrolling, setIsScrolling] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const isMobile = useMediaQuery("(max-width: 640px)");
 // const isTablet = useMediaQuery("(max-width: 1024px)");
  const catalogRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolling(true);
      } else {
        setIsScrolling(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchCategories();
    if (session) {
      fetchWishlist();
    }
  }, [session]);

  useEffect(() => {
    if (!initialLoad) {
      fetchCakes();
    }
  }, [currentPage, debouncedSearchTerm, categoryFilter, typeFilter, priceRange, availableOnly, sortBy]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const settings = await response.json();
        setItemsPerPage(settings.catalogPageSize);
        setInitialLoad(false);
        fetchCakes(settings.catalogPageSize);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      setInitialLoad(false);
      fetchCakes();
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
      const queryParams = new URLSearchParams({
        caketype: caketype,
        page: currentPage.toString(),
        limit: perPage.toString(),
        search: debouncedSearchTerm,
        category: categoryFilter,
        type: typeFilter,
        minPrice: priceRange[0].toString(),
        maxPrice: priceRange[1].toString(),
        available: availableOnly ? "true" : "",
        sortBy: sortBy
      });

      const response = await fetch(`/api/cakes?${queryParams.toString()}`);
      const data: PaginatedResponse = await response.json();

      // Add animation delay for each cake for staggered appearance
      const cakesWithDelay = data.data.map((cake, index) => ({
        ...cake,
        animationDelay: index * 0.1
      })) as unknown as Cake[];

      setCakes(cakesWithDelay);
      setItemsPerPage(data.limit);
      setTotalPages(Math.ceil(data.total / data.limit));
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching cakes:", error);
      setIsLoading(false);
    }
  };

  // const fetchMoreCakes = async () => {
  //   if (currentPage < totalPages) {
  //     try {
  //       setLoadingMore(true);
  //       const nextPage = currentPage + 1;

  //       const queryParams = new URLSearchParams({
  //         caketype: caketype,
  //         page: nextPage.toString(),
  //         limit: itemsPerPage.toString(),
  //         search: debouncedSearchTerm,
  //         category: categoryFilter,
  //         type: typeFilter,
  //         minPrice: priceRange[0].toString(),
  //         maxPrice: priceRange[1].toString(),
  //         available: availableOnly ? "true" : "",
  //         sortBy: sortBy
  //       });

  //       const response = await fetch(`/api/cakes?${queryParams.toString()}`);
  //       const data: PaginatedResponse = await response.json();

  //       // Add animation delay for each new cake
  //       const newCakesWithDelay = data.data.map((cake, index) => ({
  //         ...cake,
  //         animationDelay: index * 0.1
  //       })) as unknown as Cake[];

  //       setCakes(prev => [...prev, ...newCakesWithDelay]);
  //       setCurrentPage(nextPage);
  //       setLoadingMore(false);
  //     } catch (error) {
  //       console.error("Error fetching more cakes:", error);
  //       setLoadingMore(false);
  //     }
  //   }
  // };

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
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your wishlist.",
        variant: "destructive"
      });
      return;
    }

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
            description: `${cake.name} has been added to your wishlist.`,
          });
        }
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to add item to wishlist. Please try again.",
        variant: "destructive"
      });
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
          const cakeName = cakes.find(c => c._id === cakeId)?.name || "Item";
          toast({
            title: "Removed from wishlist",
            description: `${cakeName} has been removed from your wishlist.`,
          });
        }
      } catch (error) {
        console.error("Error removing from wishlist:", error);
        toast({
          title: "Error",
          description: "Failed to remove item from wishlist. Please try again.",
          variant: "destructive"
        });
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

  const handleTypeChange = (value: string) => {
    setTypeFilter(value.toLowerCase() === "all" ? "" : value);
    setCurrentPage(1);
  };

  const handlePriceChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
    setCurrentPage(1);
  };

  const handleAvailableChange = (checked: boolean) => {
    setAvailableOnly(checked);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setCategoryFilter("");
    setTypeFilter("");
    setPriceRange([0, 5000]);
    setAvailableOnly(false);
    setSortBy("popular");
    setCurrentPage(1);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    catalogRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getVisiblePageNumbers = () => {
    const delta = isMobile ? 1 : 2;
    const range = [];
    for (
      let i = Math.max(1, currentPage - delta);
      i <= Math.min(totalPages, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (range[0] > 1) {
      if (range[0] > 2) {
        range.unshift("...");
      }
      range.unshift(1);
    }

    if ((range[range.length - 1] as number) < totalPages) {
      if ((range[range.length - 1] as number) < totalPages - 1) {
        range.push("...");
      }
      range.push(totalPages);
    }


    return range;
  };

  if (isLoading && !loadingMore) {
    return <Loader />;
  }

  return (
    <div className="w-full bg-brand-cream/30 min-h-screen" ref={catalogRef}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="inline-block uppercase tracking-widest text-xs font-semibold text-brand-pink mb-3">
            Our Collection
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-brand-text mb-4">
            {caketype === "cake" ? "Artisanal Cakes" : "Gourmet Pastries"}
          </h1>
          <div className="mx-auto w-24 h-1 rounded-full bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] mb-6" />
          <p className="text-brand-text-secondary max-w-2xl mx-auto text-sm sm:text-base leading-relaxed px-2">
            Explore our exquisite collection of handcrafted {caketype === "cake" ? "cakes" : "pastries"},
            made with premium ingredients and passion for the perfect dessert experience.
          </p>
        </motion.div>

        {/* Filter Bar */}
        <div className="z-10">
          {/* Mobile Search + Filter Toggle */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex items-center gap-3 mb-4 md:hidden"
          >
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder={`Search ${caketype}...`}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full border-2 border-brand-pink/20 focus:border-brand-pink bg-white rounded-xl transition-all duration-300 pl-11 h-12 shadow-soft text-brand-text placeholder:text-brand-text-secondary/50"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-pink/60">
                <Search size={18} />
              </div>
            </div>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`rounded-xl border-2 h-12 w-12 transition-all duration-300 ${
                showFilters
                  ? 'border-brand-pink bg-brand-pink/10 shadow-glow'
                  : 'border-brand-pink/20 bg-white hover:border-brand-pink/40'
              }`}
            >
              <Filter size={18} className={showFilters ? 'text-brand-pink' : 'text-brand-text-secondary'} />
            </Button>
          </motion.div>

          {/* Filter Panel */}
          <AnimatePresence>
            {(showFilters || !isMobile) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-card overflow-hidden border border-brand-pink/10"
              >
                <div className="p-5 md:p-8">
                  {/* Mobile Filter Header */}
                  <div className="flex justify-between items-center mb-5 md:hidden">
                    <h3 className="font-display text-lg font-semibold text-brand-text">Filters</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(false)}
                      className="h-8 w-8 p-0 rounded-xl hover:bg-brand-pink/10 text-brand-text-secondary"
                    >
                      <X size={18} />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Desktop Search */}
                    <div className="md:col-span-4 lg:col-span-3 hidden md:block">
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder={`Search ${caketype}...`}
                          value={searchTerm}
                          onChange={(e) => handleSearch(e.target.value)}
                          className="w-full border-2 border-brand-pink/20 focus:border-brand-pink bg-brand-cream/30 rounded-xl transition-all duration-300 pl-11 h-11 text-brand-text placeholder:text-brand-text-secondary/50"
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-brand-pink/60">
                          <Search size={18} />
                        </div>
                      </div>
                    </div>

                    {/* Category Filter */}
                    <div className="md:col-span-3 lg:col-span-2">
                      <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                        <SelectTrigger className="w-full border-2 border-brand-pink/20 focus:border-brand-pink bg-brand-cream/30 rounded-xl transition-all duration-300 h-11 text-brand-text">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-brand-pink/20 shadow-elevated">
                          <SelectItem value="All">All Categories</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category._id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Type Filter */}
                    <div className="md:col-span-3 lg:col-span-2">
                      <Select value={typeFilter} onValueChange={handleTypeChange}>
                        <SelectTrigger className="w-full border-2 border-brand-pink/20 focus:border-brand-pink bg-brand-cream/30 rounded-xl transition-all duration-300 h-11 text-brand-text">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-brand-pink/20 shadow-elevated">
                          <SelectItem value="All">All Types</SelectItem>
                          <SelectItem value="contains egg">Contains Egg</SelectItem>
                          <SelectItem value="eggless">Eggless</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Availability Toggle */}
                    <div className="md:col-span-2 lg:col-span-3 flex items-center">
                      <div className="flex items-center gap-3 bg-brand-cream/50 rounded-xl px-4 py-2.5">
                        <Switch
                          id="available"
                          checked={availableOnly}
                          onCheckedChange={handleAvailableChange}
                          className="data-[state=checked]:bg-brand-pink"
                        />
                        <Label htmlFor="available" className="text-sm font-medium text-brand-text cursor-pointer">
                          In Stock Only
                        </Label>
                      </div>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="md:col-span-12 lg:col-span-2">
                      <Select value={sortBy} onValueChange={handleSortChange}>
                        <SelectTrigger className="w-full border-2 border-brand-pink/20 focus:border-brand-pink bg-brand-cream/30 rounded-xl transition-all duration-300 h-11 text-brand-text">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-brand-pink/20 shadow-elevated">
                          <SelectItem value="popular">Most Popular</SelectItem>
                          <SelectItem value="price_low">Price: Low to High</SelectItem>
                          <SelectItem value="price_high">Price: High to Low</SelectItem>
                          <SelectItem value="rating">Highest Rated</SelectItem>
                          <SelectItem value="newest">Newest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Price Range Slider */}
                  <div className="mt-6 bg-brand-cream/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-brand-text">Price Range</p>
                      <p className="text-sm font-semibold text-brand-pink">
                        ₹{priceRange[0]} - ₹{priceRange[1]}
                      </p>
                    </div>
                    <Slider
                      defaultValue={[0, 5000]}
                      value={[priceRange[0], priceRange[1]]}
                      max={5000}
                      step={100}
                      onValueChange={handlePriceChange}
                      className="w-full"
                    />
                  </div>

                  {/* Bottom Toolbar: Reset + View Toggles */}
                  <div className="flex justify-between items-center mt-5 pt-5 border-t border-brand-pink/10">
                    <div className="flex items-center gap-2">
                      {(searchTerm || categoryFilter || typeFilter || priceRange[0] > 0 || priceRange[1] < 5000 || availableOnly || sortBy !== "popular") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={resetFilters}
                          className="h-9 text-xs sm:text-sm text-brand-pink hover:text-brand-pink hover:bg-brand-pink/10 rounded-xl font-medium transition-all duration-300"
                        >
                          <X size={14} className="mr-1" />
                          Reset Filters
                        </Button>
                      )}
                    </div>

                    {/* View Mode Toggles (desktop only) */}
                    <div className="hidden md:flex items-center gap-1 bg-brand-cream/50 rounded-xl p-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setViewMode("grid")}
                              className={`h-9 w-9 rounded-xl transition-all duration-300 ${
                                viewMode === "grid"
                                  ? "bg-white text-brand-pink shadow-soft"
                                  : "text-brand-text-secondary hover:text-brand-pink"
                              }`}
                            >
                              <Grid3X3 size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-xl">
                            <p>Grid View</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setViewMode("list")}
                              className={`h-9 w-9 rounded-xl transition-all duration-300 ${
                                viewMode === "list"
                                  ? "bg-white text-brand-pink shadow-soft"
                                  : "text-brand-text-secondary hover:text-brand-pink"
                              }`}
                            >
                              <List size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="rounded-xl">
                            <p>List View</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Area */}
        <AnimatePresence>
          {cakes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl shadow-card flex flex-col items-center justify-center py-16 px-6 mt-10 border border-brand-pink/10"
            >
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-brand-cream flex items-center justify-center">
                  <Search size={32} className="text-brand-pink/60" />
                </div>
                <p className="font-display text-2xl text-brand-text mb-2">Nothing found</p>
                <p className="text-brand-text-secondary mb-6">
                  No {caketype} found matching your criteria.
                </p>
                <Button
                  onClick={resetFilters}
                  className="bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] hover:shadow-glow text-white rounded-xl px-8 h-11 font-medium transition-all duration-300"
                >
                  Clear Filters
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="mt-8">
              {/* Results Summary Bar */}
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-brand-text-secondary font-medium">
                  Showing <span className="text-brand-text">{cakes.length}</span> of{" "}
                  <span className="text-brand-text">{totalPages * itemsPerPage}</span> results
                </p>
                {searchTerm && (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl border-brand-pink/30 bg-brand-pink/5 text-brand-text text-sm"
                  >
                    Search: <span className="font-semibold text-brand-pink">{searchTerm}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 hover:bg-brand-pink/20 rounded-full"
                      onClick={() => setSearchTerm("")}
                    >
                      <X size={12} />
                    </Button>
                  </Badge>
                )}
              </div>

              {/* Cake Grid / List */}
              <div className={`
                ${viewMode === "grid"
                  ? "grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8"
                  : "flex flex-col gap-6"
                }
              `}>
                {cakes.map((cake, index) => (
                  <motion.div
                    key={cake._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{
                      duration: 0.4,
                      delay: loadingMore ? 0.1 * (index % itemsPerPage) : 0.05 * index
                    }}
                  >
                    <CakeCard
                      cake={cake}
                      isWishlisted={wishlist?.some((item) => item.cakeId === cake._id)}
                      onAddToWishlist={handleAddToWishlist}
                      onRemoveFromWishlist={handleRemoveFromWishlist}
                      //viewMode={viewMode}
                    />
                  </motion.div>
                ))}
              </div>

              {/* {currentPage < totalPages && (
                <div className="mt-8 flex justify-center">
                  <Button
                    onClick={fetchMoreCakes}
                    disabled={loadingMore}
                    className="bg-white hover:bg-[#FFF6F6] text-[#FF9494] border-2 border-[#FF9494] min-w-32"
                  >
                    {loadingMore ? (
                      <div className="flex items-center gap-2">
                        <span className="animate-spin h-4 w-4 border-2 border-[#FF9494] border-t-transparent rounded-full"></span>
                        <span>Loading...</span>
                      </div>
                    ) : (
                      "Load More"
                    )}
                  </Button>
                </div>
              )} */}

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-12 sm:mt-16 flex justify-center items-center gap-2"
                >
                  <Button
                    onClick={() => {
                      setCurrentPage(Math.max(1, currentPage - 1));
                      scrollToTop();
                    }}
                    variant="outline"
                    disabled={currentPage === 1}
                    className="border-2 border-brand-pink/20 hover:border-brand-pink hover:text-brand-pink hover:bg-brand-pink/5 rounded-xl transition-all duration-300 h-11 w-11 p-0 sm:h-11 sm:w-auto sm:px-5 disabled:opacity-40"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} className="sm:mr-1" />
                    <span className="hidden sm:inline text-sm font-medium">Prev</span>
                  </Button>

                  {!isMobile && getVisiblePageNumbers().map((page, index) =>
                    typeof page === "number" ? (
                      <Button
                        key={index}
                        onClick={() => {
                          setCurrentPage(page);
                          scrollToTop();
                        }}
                        variant={currentPage === page ? "default" : "outline"}
                        className={`
                          h-11 w-11 p-0 rounded-xl font-medium
                          ${currentPage === page
                            ? "bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] text-white shadow-glow border-0"
                            : "text-brand-text border-2 border-brand-pink/20 hover:border-brand-pink hover:text-brand-pink hover:bg-brand-pink/5"
                          }
                          transition-all duration-300
                        `}
                      >
                        {page}
                      </Button>
                    ) : (
                      <Button
                        key={index}
                        variant="ghost"
                        disabled
                        className="h-11 w-11 p-0 text-brand-text-secondary"
                      >
                        {page}
                      </Button>
                    )
                  )}

                  <Button
                    onClick={() => {
                      setCurrentPage(Math.min(totalPages, currentPage + 1));
                      scrollToTop();
                    }}
                    variant="outline"
                    disabled={currentPage === totalPages}
                    className="border-2 border-brand-pink/20 hover:border-brand-pink hover:text-brand-pink hover:bg-brand-pink/5 rounded-xl transition-all duration-300 h-11 w-11 p-0 sm:h-11 sm:w-auto sm:px-5 disabled:opacity-40"
                    aria-label="Next page"
                  >
                    <span className="hidden sm:inline text-sm font-medium">Next</span>
                    <ChevronRight size={16} className="sm:ml-1" />
                  </Button>
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>

        {/* Scroll to Top FAB */}
        {isScrolling && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={scrollToTop}
              className="h-12 w-12 rounded-full bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] hover:shadow-glow-lg text-white shadow-elevated transition-all duration-300 hover:-translate-y-1"
              aria-label="Scroll to top"
            >
              <ChevronLeft className="rotate-90" size={22} />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
