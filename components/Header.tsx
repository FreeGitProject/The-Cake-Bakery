"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useSessionContext } from "@/context/SessionContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { ShoppingCart, User, Heart, MapPin, LogOut, Home, Cake, Package, Menu, X, Settings, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import CartOffCanvas from "../app/components/CartOffCanvas";
import { useLocation } from "@/context/LocationContext";
import LocationModal from "./LocationModal";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { currentLocation, setIsLocationModalOpen } = useLocation();
  
  const navItems = [
    { name: "Home", path: "/", icon: <Home className="w-4 h-4 mr-2" /> },
    { name: "Cakes", path: "/cakes", icon: <Cake className="w-4 h-4 mr-2" /> },
    { name: "Pastries", path: "/pastries", icon: <Package className="w-4 h-4 mr-2" /> },
  ];
  
  const { session } = useSessionContext();
  const router = useRouter();
  const { cart } = useCart();
  
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const LOGO_URL = "https://res.cloudinary.com/dzabikj6s/image/upload/v1735310817/The-cake-shop/Logo_p9gapg.png";

  // Animations
  const mobileMenuVariants = {
    closed: { 
      opacity: 0,
      height: 0,
      transition: { 
        duration: 0.3,
        when: "afterChildren" 
      }
    },
    open: { 
      opacity: 1,
      height: "auto",
      transition: { 
        duration: 0.3,
        when: "beforeChildren", 
        staggerChildren: 0.05 
      }
    }
  };

  const menuItemVariants = {
    closed: { y: 20, opacity: 0 },
    open: { y: 0, opacity: 1 }
  };

  // Subcomponents
  const Logo = () => (
    <Link href="/" className="flex items-center group">
      <div className="relative">
        <Image
          src={LOGO_URL}
          alt="The Cake Shop Logo"
          width={50}
          height={50}
          className="rounded-full transform group-hover:rotate-12 transition-transform duration-300"
          priority
        />
      </div>
      <span className="ml-3 font-serif text-xl sm:text-2xl md:text-3xl font-bold text-[#4A4A4A] group-hover:text-[#FF9494] transition-colors duration-300">
        The Cake Shop
      </span>
    </Link>
  );

  const CartButton = () => (
    <Button
      variant="ghost"
      className="relative p-2 hover:bg-[#FFF5E4] transition-colors duration-300"
      onClick={() => setIsCartOpen(true)}
      aria-label="Open cart"
    >
      <ShoppingCart className="h-6 w-6 text-[#4A4A4A] hover:text-[#FF9494] transition-colors duration-300" />
      {cartItemCount > 0 && (
        <motion.span 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 bg-[#FF9494] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
        >
          {cartItemCount}
        </motion.span>
      )}
    </Button>
  );

  const WishlistButton = () => (
    <Link href="/wishlist">
      <Button
        variant="ghost"
        className="relative p-2 hover:bg-[#FFF5E4] transition-colors duration-300"
        aria-label="Open wishlist"
      >
        <Heart className="h-6 w-6 text-[#4A4A4A] hover:text-[#FF9494] transition-colors duration-300" />
      </Button>
    </Link>
  );

  const LocationButton = () => (
    <Button 
      variant="ghost" 
      className="relative p-2 flex items-center hover:bg-[#FFF5E4] transition-colors duration-300" 
      onClick={() => setIsLocationModalOpen(true)}
    >
      <MapPin className="h-5 w-5 text-[#4A4A4A] hover:text-[#FF9494] transition-colors duration-300" />
      {currentLocation && (
        <span className="ml-2 text-sm font-medium max-w-[100px] truncate">
          {currentLocation.name}
        </span>
      )}
    </Button>
  );

  const SearchBar = () => (
    <AnimatePresence>
      {searchOpen && (
        <motion.div 
          className="absolute top-full left-0 w-full bg-white shadow-md p-4 z-50"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="relative mx-auto max-w-md">
            <input
              type="text"
              placeholder="Search for cakes, pastries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-full border border-[#FFD6EC] focus:outline-none focus:ring-2 focus:ring-[#FF9494] pl-10"
            />
            <button 
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              onClick={() => setSearchOpen(false)}
            >
              <X className="h-5 w-5 text-[#4A4A4A]" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <header className={cn(
      "sticky top-0 z-50 transition-all duration-300 backdrop-blur-sm",
      scrolled ? "bg-white/90 shadow-md" : "bg-white"
    )}>
      <nav className="container mx-auto px-4 sm:px-6 py-3">
        {/* Main Navigation Bar */}
        <div className="flex items-center justify-between relative">
          {/* Logo and Brand Name */}
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Navigation Links */}
            <div className="flex space-x-6 mr-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className="text-[#4A4A4A] hover:text-[#FF9494] transition duration-300 relative group py-2"
                >
                  {item.name}
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#FF9494] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                </Link>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                className="relative p-2 hover:bg-[#FFF5E4] transition-colors duration-300"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#4A4A4A] hover:text-[#FF9494] transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Button>
              <CartButton />
              {session && <WishlistButton />}
              <LocationButton />

              {/* User Menu */}
              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="p-0 hover:bg-[#FFF5E4] transition-colors duration-300 ml-1"
                    >
                      <Avatar className="h-8 w-8 border-2 border-[#FF9494] ring-2 ring-white">
                        <AvatarImage src={session.user?.image || ""} />
                        <AvatarFallback className="bg-[#FFF5E4] text-[#FF9494] font-medium">
                          {session.user?.name?.[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-1 rounded-xl shadow-lg border border-[#FFD6EC] bg-white">
                    <div className="px-4 py-2 border-b border-[#FFE5F1]">
                      <p className="font-medium text-[#4A4A4A]">{session.user?.name}</p>
                      <p className="text-sm text-gray-500 truncate">{session.user?.email}</p>
                    </div>

                    {session.user?.role === "admin" && (
                      <DropdownMenuItem className="hover:bg-[#FFF5E4] rounded-lg my-1 cursor-pointer">
                        <Link href="/admin" className="w-full flex items-center">
                          <Settings className="w-4 h-4 mr-2" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuItem className="hover:bg-[#FFF5E4] rounded-lg my-1 cursor-pointer">
                      <Link href="/profile" className="w-full flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem className="hover:bg-[#FFF5E4] rounded-lg my-1 cursor-pointer">
                      <Link href="/my-orders" className="w-full flex items-center">
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="bg-[#FFE5F1]" />
                    
                    <DropdownMenuItem
                      onSelect={handleSignOut}
                      className="hover:bg-[#FFF5E4] text-[#FF5757] rounded-lg my-1 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-[#4A4A4A] hover:text-[#FF9494] transition duration-300 px-3 py-2"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm font-medium bg-[#FF9494] text-white hover:bg-[#FFB4B4] transition duration-300 px-4 py-2 rounded-full"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Header Options */}
          <div className="lg:hidden flex items-center space-x-3">
            <Button
              variant="ghost"
              className="relative p-2 hover:bg-[#FFF5E4] transition-colors duration-300"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#4A4A4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Button>
            <CartButton />
            <LocationButton />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md hover:bg-[#FFF5E4] transition-colors duration-300"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isOpen ? "open" : "closed"}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1 }
                  }}
                  transition={{ duration: 0.2 }}
                  className="w-6 h-6 relative"
                >
                  {isOpen ? (
                    <X className="w-6 h-6 text-[#FF9494]" />
                  ) : (
                    <Menu className="w-6 h-6 text-[#4A4A4A]" />
                  )}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <SearchBar />

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="lg:hidden overflow-hidden"
            >
              <div className="py-4 space-y-0">
                {navItems.map((item) => (
                  <motion.div key={item.name} variants={menuItemVariants}>
                    <Link
                      onClick={() => setIsOpen(false)}
                      href={item.path}
                      className="flex items-center py-3 px-4 text-[#4A4A4A] hover:bg-[#FFF5E4] hover:text-[#FF9494] transition duration-300 rounded-md"
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
                
                {session ? (
                  <>
                    <motion.div variants={menuItemVariants}>
                      <Link
                        onClick={() => setIsOpen(false)}
                        href="/wishlist"
                        className="flex items-center py-3 px-4 text-[#4A4A4A] hover:bg-[#FFF5E4] hover:text-[#FF9494] transition duration-300 rounded-md"
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Wishlist
                      </Link>
                    </motion.div>
                    
                    {session.user?.role === "admin" && (
                      <motion.div variants={menuItemVariants}>
                        <Link
                          onClick={() => setIsOpen(false)}
                          href="/admin"
                          className="flex items-center py-3 px-4 text-[#4A4A4A] hover:bg-[#FFF5E4] hover:text-[#FF9494] transition duration-300 rounded-md"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Admin Dashboard
                        </Link>
                      </motion.div>
                    )}
                    
                    <motion.div variants={menuItemVariants}>
                      <Link
                        onClick={() => setIsOpen(false)}
                        href="/profile"
                        className="flex items-center py-3 px-4 text-[#4A4A4A] hover:bg-[#FFF5E4] hover:text-[#FF9494] transition duration-300 rounded-md"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                    </motion.div>
                    
                    <motion.div variants={menuItemVariants}>
                      <Link
                        onClick={() => setIsOpen(false)}
                        href="/my-orders"
                        className="flex items-center py-3 px-4 text-[#4A4A4A] hover:bg-[#FFF5E4] hover:text-[#FF9494] transition duration-300 rounded-md"
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        My Orders
                      </Link>
                    </motion.div>
                    
                    <motion.div variants={menuItemVariants}>
                      <hr className="border-[#FFE5F1] my-2" />
                    </motion.div>
                    
                    <motion.div variants={menuItemVariants}>
                      <Button
                        onClick={() => {
                          setIsOpen(false);
                          handleSignOut();
                        }}
                        variant="ghost"
                        className="w-full text-left flex items-center py-3 px-4 text-[#FF5757] hover:bg-[#FFF5E4] transition duration-300 rounded-md"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </motion.div>
                  </>
                ) : (
                  <motion.div variants={menuItemVariants} className="p-4 space-y-3">
                    <Link
                      onClick={() => setIsOpen(false)}
                      href="/login"
                      className="block w-full py-2.5 text-center text-[#4A4A4A] border border-[#FFD6EC] rounded-md hover:text-[#FF9494] hover:border-[#FF9494] transition duration-300"
                    >
                      Login
                    </Link>
                    <Link
                      onClick={() => setIsOpen(false)}
                      href="/register"
                      className="block w-full py-2.5 text-center bg-[#FF9494] text-white rounded-md hover:bg-[#FFB4B4] transition duration-300"
                    >
                      Sign Up
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      <CartOffCanvas isOpen={isCartOpen} setIsOpen={setIsCartOpen} />
      <LocationModal />
    </header>
  );
}