"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { debounce } from "lodash";
import { 
  Search, X, Filter, ChevronDown, ChevronRight, Loader2, Cake 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import CakeCard from "@/app/components/CakeCard";

export default function CakeSearch({ caketype = "all", onResultsLoaded }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [sortBy, setSortBy] = useState("relevance");
  const [isLoading, setIsLoading] = useState(false);
  const [cakes, setCakes] = useState([]);
  const [totalCakes, setTotalCakes] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [filterCount, setFilterCount] = useState(0);
  
  const perPage = 12;
  
  // Categories - these could be fetched from an API in a real app
  const categories = [
    "All",
    "Birthday",
    "Wedding",
    "Anniversary",
    "Custom",
    "Chocolate",
    "Fruit",
    "Vegan",
  ];

  // Initialize from URL params if they exist
  useEffect(() => {
    const query = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const page = parseInt(searchParams.get("page") || "1");
    
    setSearchTerm(query);
    setCategoryFilter(category);
    setCurrentPage(page);
    
    // Count active filters
    let count = 0;
    if (query) count++;
    if (category) count++;
    if (priceRange[0] > 0 || priceRange[1] < 100) count++;
    if (sortBy !== "relevance") count++;
    setFilterCount(count);
    
    // Initial load
    fetchCakes(query, category, page);
  }, [searchParams]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((term) => {
      handleSearch(term);
    }, 500),
    [categoryFilter, currentPage]
  );

  // Update search term and trigger debounced search
  const updateSearchTerm = (term) => {
    setSearchTerm(term);
    
    if (term.length >= 2) {
      debouncedSearch(term);
      fetchSuggestions(term);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Fetch search suggestions
  const fetchSuggestions = async (term) => {
    try {
      // In a real app, you would fetch from an API endpoint
      // This is a simplified example
      const suggestionsData = [
        `${term} cake`,
        `${term} birthday cake`,
        `${term} wedding cake`,
        `Custom ${term} design`,
      ].filter(s => s.toLowerCase() !== term.toLowerCase());
      
      setSuggestions(suggestionsData);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    }
  };

  // Handle search submission
  const handleSearch = (term = searchTerm) => {
    setCurrentPage(1);
    updateUrlParams(term, categoryFilter, 1);
    fetchCakes(term, categoryFilter, 1);
    setShowSuggestions(false);
  };

  // Handle category filter change
  const handleCategoryChange = (category) => {
    const newCategory = category === "All" ? "" : category;
    setCategoryFilter(newCategory);
    setCurrentPage(1);
    updateUrlParams(searchTerm, newCategory, 1);
    fetchCakes(searchTerm, newCategory, 1);
  };

  // Handle price range change
  const handlePriceChange = (values) => {
    setPriceRange(values);
  };

  // Apply price filter
  const applyPriceFilter = () => {
    setCurrentPage(1);
    updateUrlParams(searchTerm, categoryFilter, 1);
    fetchCakes(searchTerm, categoryFilter, 1, priceRange);
  };

  // Handle sort change
  const handleSortChange = (value) => {
    setSortBy(value);
    fetchCakes(searchTerm, categoryFilter, currentPage, priceRange, value);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    updateUrlParams(searchTerm, categoryFilter, newPage);
    fetchCakes(searchTerm, categoryFilter, newPage, priceRange, sortBy);
    
    // Scroll to top smoothly
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Update URL parameters
  const updateUrlParams = (search, category, page) => {
    const params = new URLSearchParams();
    
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (page > 1) params.set("page", page.toString());
    
    // Replace current URL with new params
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.push(newUrl, { scroll: false });
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setPriceRange([0, 100]);
    setSortBy("relevance");
    setCurrentPage(1);
    updateUrlParams("", "", 1);
    fetchCakes("", "", 1, [0, 100], "relevance");
  };

  // Fetch cakes from API
  const fetchCakes = async (search, category, page, price = priceRange, sort = sortBy) => {
    setIsLoading(true);
    try {
      // Build query parameters
      const queryParams = new URLSearchParams({
        caketype: caketype,
        page: page.toString(),
        limit: perPage.toString(),
        search: search,
        category: category,
        minPrice: price[0].toString(),
        maxPrice: price[1].toString(),
        sortBy: sort,
      });

      // Fetch data from API
      const response = await fetch(`/api/cakes?${queryParams.toString()}`);
      const data = await response.json();

      if (data.success) {
        setCakes(data);
        setTotalCakes(data.total);
        if (onResultsLoaded) {
          onResultsLoaded(data.cakes, data.total);
        }
      } else {
        console.error("API error:", data.message);
      }
    } catch (error) {
      console.error("Error fetching cakes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalCakes / perPage);

  // Generate pagination items
  const getPaginationItems = () => {
    const items = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      // Always show first page
      items.push(1);
      
      // Calculate start and end of pages to show
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if at the beginning
      if (currentPage <= 2) {
        end = Math.min(4, totalPages - 1);
      }
      
      // Adjust if at the end
      if (currentPage >= totalPages - 2) {
        start = Math.max(totalPages - 3, 2);
      }
      
      // Add ellipsis if needed before middle pages
      if (start > 2) {
        items.push("...");
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        items.push(i);
      }
      
      // Add ellipsis if needed after middle pages
      if (end < totalPages - 1) {
        items.push("...");
      }
      
      // Always show last page
      items.push(totalPages);
    }
    
    return items;
  };

  return (
    <div className="w-full mx-auto max-w-6xl px-4">
      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="flex items-center justify-between">
          <div className="relative flex-1">
            <div className="relative flex items-center w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => updateSearchTerm(e.target.value)}
                placeholder="Search for cakes..."
                className="w-full p-3 pl-10 pr-10 rounded-lg border border-[#FFD6EC] focus:outline-none focus:ring-2 focus:ring-[#FF9494] bg-white"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
              
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    handleSearch("");
                  }}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-[#FFE5F1] rounded-lg shadow-lg overflow-hidden">
                <ul className="py-1">
                  {suggestions.map((suggestion, index) => (
                    <li 
                      key={index}
                      onClick={() => {
                        setSearchTerm(suggestion);
                        handleSearch(suggestion);
                      }}
                      className="px-4 py-2 hover:bg-[#FFF5E4] cursor-pointer flex items-center"
                    >
                      <Search className="h-4 w-4 mr-2 text-gray-400" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Filter Options for Desktop */}
          <div className="hidden md:flex items-center ml-4 space-x-2">
            {/* Category Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="border-[#FFD6EC] hover:border-[#FF9494] hover:bg-[#FFF5E4] text-[#4A4A4A]"
                >
                  Category
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuSeparator />
                {categories.map((category) => (
                  <DropdownMenuItem 
                    key={category}
                    className={`cursor-pointer ${categoryFilter === (category === 'All' ? '' : category) ? 'bg-[#FFF5E4] text-[#FF9494] font-medium' : ''}`}
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="border-[#FFD6EC] hover:border-[#FF9494] hover:bg-[#FFF5E4] text-[#4A4A4A]"
                >
                  Sort
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className={`cursor-pointer ${sortBy === "relevance" ? 'bg-[#FFF5E4] text-[#FF9494] font-medium' : ''}`}
                  onClick={() => handleSortChange("relevance")}
                >
                  Relevance
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={`cursor-pointer ${sortBy === "price_asc" ? 'bg-[#FFF5E4] text-[#FF9494] font-medium' : ''}`}
                  onClick={() => handleSortChange("price_asc")}
                >
                  Price: Low to High
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={`cursor-pointer ${sortBy === "price_desc" ? 'bg-[#FFF5E4] text-[#FF9494] font-medium' : ''}`}
                  onClick={() => handleSortChange("price_desc")}
                >
                  Price: High to Low
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={`cursor-pointer ${sortBy === "newest" ? 'bg-[#FFF5E4] text-[#FF9494] font-medium' : ''}`}
                  onClick={() => handleSortChange("newest")}
                >
                  Newest First
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={`cursor-pointer ${sortBy === "rating" ? 'bg-[#FFF5E4] text-[#FF9494] font-medium' : ''}`}
                  onClick={() => handleSortChange("rating")}
                >
                  Highest Rated
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Price Range Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="border-[#FFD6EC] hover:border-[#FF9494] hover:bg-[#FFF5E4] text-[#4A4A4A]"
                >
                  Price
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 p-4">
                <div className="space-y-4">
                  <div className="text-sm font-medium">Price Range</div>
                  <div className="flex justify-between">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                  <Slider
                    value={priceRange}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={handlePriceChange}
                    className="w-full"
                  />
                  <div className="flex justify-end">
                    <Button 
                      onClick={applyPriceFilter}
                      className="bg-[#FF9494] hover:bg-[#FFB4B4] text-white"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Reset Filters */}
            {filterCount > 0 && (
              <Button 
                variant="ghost" 
                onClick={resetFilters}
                className="text-[#FF5757] hover:bg-[#FFF5E4]"
              >
                Reset ({filterCount})
              </Button>
            )}
          </div>

          {/* Mobile Filters Drawer */}
          <div className="md:hidden ml-2">
            <Drawer>
              <DrawerTrigger asChild>
                <Button 
                  variant="outline" 
                  className="border-[#FFD6EC] hover:border-[#FF9494] relative"
                >
                  <Filter className="h-5 w-5" />
                  {filterCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#FF9494] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {filterCount}
                    </span>
                  )}
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle className="text-center">Filter & Sort</DrawerTitle>
                </DrawerHeader>
                <div className="p-4 space-y-6">
                  {/* Categories */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Categories</h4>
                    <RadioGroup 
                      value={categoryFilter === "" ? "All" : categoryFilter}
                      onValueChange={handleCategoryChange}
                      className="flex flex-wrap gap-2"
                    >
                      {categories.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <RadioGroupItem 
                            value={category} 
                            id={`category-${category}`} 
                            className="text-[#FF9494]"
                          />
                          <label htmlFor={`category-${category}`} className="text-sm cursor-pointer">
                            {category}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Sort By */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Sort By</h4>
                    <RadioGroup 
                      value={sortBy}
                      onValueChange={handleSortChange}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="relevance" id="sort-relevance" className="text-[#FF9494]" />
                        <label htmlFor="sort-relevance" className="text-sm cursor-pointer">
                          Relevance
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="price_asc" id="sort-price-asc" className="text-[#FF9494]" />
                        <label htmlFor="sort-price-asc" className="text-sm cursor-pointer">
                          Price: Low to High
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="price_desc" id="sort-price-desc" className="text-[#FF9494]" />
                        <label htmlFor="sort-price-desc" className="text-sm cursor-pointer">
                          Price: High to Low
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="newest" id="sort-newest" className="text-[#FF9494]" />
                        <label htmlFor="sort-newest" className="text-sm cursor-pointer">
                          Newest First
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="rating" id="sort-rating" className="text-[#FF9494]" />
                        <label htmlFor="sort-rating" className="text-sm cursor-pointer">
                          Highest Rated
                        </label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Price Range</h4>
                    <div className="flex justify-between">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                    <Slider
                      value={priceRange}
                      min={0}
                      max={100}
                      step={5}
                      onValueChange={handlePriceChange}
                      className="w-full"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between pt-4 border-t border-[#FFE5F1]">
                    {filterCount > 0 && (
                      <Button 
                        variant="outline" 
                        onClick={resetFilters}
                        className="text-[#FF5757] border-[#FFD6EC]"
                      >
                        Reset All
                      </Button>
                    )}
                    <DrawerClose asChild>
                      <Button 
                        onClick={applyPriceFilter}
                        className="bg-[#FF9494] hover:bg-[#FFB4B4] text-white ml-auto"
                      >
                        Apply Filters
                      </Button>
                    </DrawerClose>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {filterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {searchTerm && (
            <div className="inline-flex items-center bg-[#FFF5E4] text-[#4A4A4A] text-sm rounded-full px-3 py-1">
              Search: {searchTerm}
              <button 
                onClick={() => {
                  setSearchTerm("");
                  handleSearch("");
                }}
                className="ml-2 text-[#FF9494]"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {categoryFilter && (
            <div className="inline-flex items-center bg-[#FFF5E4] text-[#4A4A4A] text-sm rounded-full px-3 py-1">
              Category: {categoryFilter}
              <button 
                onClick={() => handleCategoryChange("All")}
                className="ml-2 text-[#FF9494]"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {(priceRange[0] > 0 || priceRange[1] < 100) && (
            <div className="inline-flex items-center bg-[#FFF5E4] text-[#4A4A4A] text-sm rounded-full px-3 py-1">
              Price: ${priceRange[0]} - ${priceRange[1]}
              <button 
                onClick={() => {
                  setPriceRange([0, 100]);
                  applyPriceFilter();
                }}
                className="ml-2 text-[#FF9494]"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {sortBy !== "relevance" && (
            <div className="inline-flex items-center bg-[#FFF5E4] text-[#4A4A4A] text-sm rounded-full px-3 py-1">
              Sort: {sortBy.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
              <button 
                onClick={() => handleSortChange("relevance")}
                className="ml-2 text-[#FF9494]"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-[#FF9494] animate-spin" />
          <span className="ml-2 text-[#4A4A4A]">Loading cakes...</span>
        </div>
      )}

      {/* No Results */}
      {!isLoading && cakes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Cake className="h-16 w-16 text-[#FFD6EC] mb-4" />
          <h3 className="text-xl font-medium text-[#4A4A4A] mb-2">No cakes found</h3>
          <p className="text-gray-500 max-w-md">
            We couldn&apos;t find any cakes matching your search criteria. Try adjusting your filters or search term.
          </p>
          <Button 
            onClick={resetFilters}
            className="mt-4 bg-[#FF9494] hover:bg-[#FFB4B4] text-white"
          >
            Reset Filters
          </Button>
        </div>
      )}

      {/* Results Summary */}
      {!isLoading && cakes.length > 0 && (
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium">{((currentPage - 1) * perPage) + 1}</span> - 
            <span className="font-medium">{Math.min(currentPage * perPage, totalCakes)}</span> of 
            <span className="font-medium"> {totalCakes}</span> cakes
          </p>
        </div>
      )}

      {/* Cakes Grid - This would be handled by your main component */}
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

      {/* Pagination (if needed) */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="border-[#FFD6EC] hover:border-[#FF9494] hover:bg-[#FFF5E4]"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
            </Button>
            
            {getPaginationItems().map((item, index) => (
              item === "..." ? (
                <span key={`ellipsis-${index}`} className="px-2">...</span>
              ) : (
                <Button
                  key={item}
                  variant={currentPage === item ? "default" : "outline"}
                  className={
                    currentPage === item
                      ? "bg-[#FF9494] hover:bg-[#FFB4B4] text-white"
                      : "border-[#FFD6EC] hover:border-[#FF9494] hover:bg-[#FFF5E4]"
                  }
                  onClick={() => handlePageChange(item)}
                >
                  {item}
                </Button>
              )
            ))}
            
            <Button
              variant="outline"
              className="border-[#FFD6EC] hover:border-[#FF9494] hover:bg-[#FFF5E4]"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      )}
    </div>
  );
}