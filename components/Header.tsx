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
import { 
  ShoppingCart, 
  User, 
  Heart, 
  LogOut, 
  Settings, 
  Package, 
  ChevronDown,
  //Bell,
  Search
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import CartOffCanvas from "../app/components/CartOffCanvas";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { session } = useSessionContext();
  const router = useRouter();
  const { cart } = useCart();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Cakes", path: "/cakes", submenu: [
      { name: "Birthday Cakes", path: "/cakes/birthday" },
      { name: "Wedding Cakes", path: "/cakes/wedding" },
      { name: "Custom Cakes", path: "/cakes/custom" },
    ]},
    { name: "Pastries", path: "/pastries", submenu: [
      { name: "Cookies", path: "/pastries/cookies" },
      { name: "Cupcakes", path: "/pastries/cupcakes" },
      { name: "Chocolates", path: "/pastries/chocolates" },
    ]},
    { name: "About", path: "/about" },
  ];

  const LOGO_URL =
    "https://res.cloudinary.com/dzabikj6s/image/upload/v1735310817/The-cake-shop/Logo_p9gapg.png";

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  // Subcomponents for better organization
  const Logo = () => (
    <Link href="/" className="flex items-center group">
      <div className="relative overflow-hidden rounded-full">
        <motion.div
          whileHover={{ rotate: 15 }}
          transition={{ duration: 0.3 }}
        >
          <Image
            src={LOGO_URL}
            alt="The Cake Shop Logo"
            width={50}
            height={50}
            className="rounded-full"
            priority
          />
        </motion.div>
      </div>
      <motion.span 
        className="ml-3 sm:text-3xl text-base font-bold text-[#4A4A4A]"
        whileHover={{ color: "#FF9494" }}
        transition={{ duration: 0.3 }}
      >
        The Cake Shop
      </motion.span>
    </Link>
  );

  const CartButton = () => (
    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
      <Button
        variant="ghost"
        className="relative p-2 hover:bg-[#FFF5E4] transition-colors duration-300"
        onClick={() => setIsCartOpen(true)}
        aria-label="Open cart"
      >
        <ShoppingCart className="h-6 w-6 text-[#4A4A4A] hover:text-[#FF9494] transition-colors duration-300" />
        {cart.length > 0 && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-[#FF9494] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
          >
            {cart.reduce((total, item) => total + item.quantity, 0)}
          </motion.span>
        )}
      </Button>
    </motion.div>
  );

  const WishlistButton = () => (
    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
      <Link href="/wishlist">
        <Button
          variant="ghost"
          className="relative p-2 hover:bg-[#FFF5E4] transition-colors duration-300"
          aria-label="Open wishlist"
        >
          <Heart className="h-6 w-6 text-[#4A4A4A] hover:text-[#FF9494] transition-colors duration-300" />
        </Button>
      </Link>
    </motion.div>
  );
  
  const SearchButton = () => (
    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
      <Button
        variant="ghost"
        className="relative p-2 hover:bg-[#FFF5E4] transition-colors duration-300"
        onClick={() => setIsSearchOpen(!isSearchOpen)}
        aria-label="Search products"
      >
        <Search className="h-6 w-6 text-[#4A4A4A] hover:text-[#FF9494] transition-colors duration-300" />
      </Button>
    </motion.div>
  );

  const SearchBar = () => (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-full left-0 right-0 bg-white shadow-lg p-4 z-50"
        >
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search for cakes, pastries..."
              className="w-full px-4 py-2 rounded-full border-2 border-[#FFD1D1] focus:outline-none focus:border-[#FF9494] pr-10"
            />
            <button className="absolute right-3 top-2 text-[#FF9494]">
              <Search className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const DesktopNavItem = ({ item }) => {
    const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
    
    return (
      <div
        className="relative"
        onMouseEnter={() => setIsSubmenuOpen(true)}
        onMouseLeave={() => setIsSubmenuOpen(false)}
      >
        <Link
          href={item.path}
          className="flex items-center text-[#4A4A4A] hover:text-[#FF9494] transition duration-300 relative group px-3 py-2"
        >
          {item.name}
          {item.submenu && (
            <ChevronDown className="ml-1 h-4 w-4" />
          )}
          <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#FF9494] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
        </Link>
        
        {item.submenu && isSubmenuOpen && (
          <div className="absolute top-full left-0 w-48 bg-white shadow-lg rounded-md overflow-hidden z-50 py-2">
            {item.submenu.map((subItem) => (
              <Link
                key={subItem.name}
                href={subItem.path}
                className="block px-4 py-2 text-[#4A4A4A] hover:bg-[#FFF5E4] hover:text-[#FF9494] transition duration-300"
              >
                {subItem.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrollPosition > 50 
            ? "bg-white/95 backdrop-blur-sm shadow-md py-2" 
            : "bg-white shadow-md py-3"
        }`}
      >
        <nav className="container mx-auto px-6">
          {/* Main Navigation Bar */}
          <div className="flex items-center justify-between">
            {/* Logo and Brand Name */}
            <Logo />

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              {/* Navigation Links */}
              <div className="flex">
                {navItems.map((item) => (
                  <DesktopNavItem key={item.name} item={item} />
                ))}
              </div>
              
              <div className="flex items-center pl-4 space-x-1 border-l border-gray-200">
                <SearchButton />
                <CartButton />
                {session && <WishlistButton />}
                
                {/* User Menu */}
                {session ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="p-1 hover:bg-[#FFF5E4] transition-colors duration-300 ml-1"
                      >
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8 border-2 border-[#FF9494]">
                            <AvatarImage src={session.user?.image || ""} />
                            <AvatarFallback className="bg-[#FFF5E4] text-[#FF9494]">
                              {session.user?.name?.[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="hidden xl:block text-sm font-medium text-[#4A4A4A]">
                            {session.user?.name?.split(' ')[0]}
                          </span>
                          <ChevronDown className="h-4 w-4 text-[#4A4A4A]" />
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2">
                      <div className="flex flex-col space-y-1 p-2 mb-2 border-b border-gray-100">
                        <p className="text-sm font-medium">{session.user?.name}</p>
                        <p className="text-xs text-gray-500">{session.user?.email}</p>
                      </div>
                      
                      {session.user?.role === "admin" && (
                        <DropdownMenuItem className="hover:bg-[#FFF5E4] rounded-md">
                          <Settings className="mr-2 h-4 w-4" />
                          <Link href="/admin" className="w-full">
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuItem className="hover:bg-[#FFF5E4] rounded-md">
                        <User className="mr-2 h-4 w-4" />
                        <Link href="/profile" className="w-full">
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem className="hover:bg-[#FFF5E4] rounded-md">
                        <Package className="mr-2 h-4 w-4" />
                        <Link href="/my-orders" className="w-full">
                          My Orders
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem className="hover:bg-[#FFF5E4] rounded-md">
                        <Heart className="mr-2 h-4 w-4" />
                        <Link href="/wishlist" className="w-full">
                          Wishlist
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem
                        onSelect={handleSignOut}
                        className="hover:bg-[#FFF5E4] text-[#FF5A5A] rounded-md mt-2"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center space-x-2">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        href="/login"
                        className="px-4 py-2 text-[#4A4A4A] hover:text-[#FF9494] transition duration-300"
                      >
                        Login
                      </Link>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        href="/register"
                        className="px-4 py-2 bg-[#FF9494] text-white rounded-md hover:bg-[#FFB4B4] transition duration-300"
                      >
                        Register
                      </Link>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Actions */}
            <div className="lg:hidden flex items-center space-x-3">
              <SearchButton />
              <CartButton />
              {session && <WishlistButton />}
              
              {/* Mobile Menu Button - Hamburger */}
              <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-md hover:bg-[#FFF5E4] transition-colors duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-6 h-6 relative transform transition-all duration-300">
                  <span
                    className={`absolute h-0.5 w-full bg-[#FF9494] transform transition-all duration-300 ${
                      isOpen ? "rotate-45 translate-y-2.5" : ""
                    }`}
                  />
                  <span
                    className={`absolute h-0.5 w-full bg-[#FF9494] transform transition-all duration-300 translate-y-2 ${
                      isOpen ? "opacity-0" : ""
                    }`}
                  />
                  <span
                    className={`absolute h-0.5 w-full bg-[#FF9494] transform transition-all duration-300 translate-y-4 ${
                      isOpen ? "-rotate-45 -translate-y-2.5" : ""
                    }`}
                  />
                </div>
              </motion.button>
            </div>
          </div>

          {/* Search Bar */}
          <SearchBar />

          {/* Mobile Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden overflow-hidden"
              >
                <div className="py-4 space-y-1 mt-2 border-t border-gray-100">
                  {navItems.map((item) => (
                    <div key={item.name} className="rounded-md overflow-hidden">
                      <Link
                        onClick={() => setIsOpen(false)}
                        href={item.path}
                        className="flex justify-between items-center py-2 px-4 text-[#4A4A4A] hover:bg-[#FFF5E4] hover:text-[#FF9494] transition duration-300"
                      >
                        <span>{item.name}</span>
                        {item.submenu && <ChevronDown className="h-4 w-4" />}
                      </Link>
                      
                      {item.submenu && (
                        <div className="pl-6 bg-gray-50">
                          {item.submenu.map((subItem) => (
                            <Link
                              key={subItem.name}
                              onClick={() => setIsOpen(false)}
                              href={subItem.path}
                              className="block py-2 px-4 text-[#4A4A4A] hover:bg-[#FFF5E4] hover:text-[#FF9494] transition duration-300 text-sm"
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {session ? (
                    <>
                      <div className="px-4 py-3 border-t border-b border-gray-100 flex items-center space-x-3">
                        <Avatar className="h-10 w-10 border-2 border-[#FF9494]">
                          <AvatarImage src={session.user?.image || ""} />
                          <AvatarFallback className="bg-[#FFF5E4] text-[#FF9494]">
                            {session.user?.name?.[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-[#4A4A4A]">{session.user?.name}</p>
                          <p className="text-xs text-gray-500">{session.user?.email}</p>
                        </div>
                      </div>
                      
                      {session.user?.role === "admin" && (
                        <Link
                          onClick={() => setIsOpen(false)}
                          href="/admin"
                          className="flex items-center py-2 px-4 text-[#4A4A4A] hover:bg-[#FFF5E4] hover:text-[#FF9494] transition duration-300"
                        >
                          <Settings className="h-4 w-4 mr-3" />
                          Admin Dashboard
                        </Link>
                      )}
                      
                      <Link
                        onClick={() => setIsOpen(false)}
                        href="/profile"
                        className="flex items-center py-2 px-4 text-[#4A4A4A] hover:bg-[#FFF5E4] hover:text-[#FF9494] transition duration-300"
                      >
                        <User className="h-4 w-4 mr-3" />
                        Profile
                      </Link>
                      
                      <Link
                        onClick={() => setIsOpen(false)}
                        href="/my-orders"
                        className="flex items-center py-2 px-4 text-[#4A4A4A] hover:bg-[#FFF5E4] hover:text-[#FF9494] transition duration-300"
                      >
                        <Package className="h-4 w-4 mr-3" />
                        My Orders
                      </Link>
                      
                      <Link
                        onClick={() => setIsOpen(false)}
                        href="/wishlist"
                        className="flex items-center py-2 px-4 text-[#4A4A4A] hover:bg-[#FFF5E4] hover:text-[#FF9494] transition duration-300"
                      >
                        <Heart className="h-4 w-4 mr-3" />
                        Wishlist
                      </Link>
                      
                      <Button
                        onClick={() => {
                          setIsOpen(false);
                          handleSignOut();
                        }}
                        variant="ghost"
                        className="w-full text-left px-4 py-2 mt-4 hover:bg-[#FFF5E4] text-[#FF5A5A] flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col space-y-2 p-4">
                      <Link
                        onClick={() => setIsOpen(false)}
                        href="/login"
                        className="py-2 text-center text-[#4A4A4A] hover:text-[#FF9494] border border-[#FF9494] rounded-md transition duration-300"
                      >
                        Login
                      </Link>
                      <Link
                        onClick={() => setIsOpen(false)}
                        href="/register"
                        className="py-2 text-center bg-[#FF9494] text-white rounded-md hover:bg-[#FFB4B4] transition duration-300"
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </header>
      <CartOffCanvas isOpen={isCartOpen} setIsOpen={setIsCartOpen} />
    </>
  );
}