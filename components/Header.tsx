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
  const { currentLocation, setIsLocationModalOpen } = useLocation();

  const navItems = [
    { name: "Home", path: "/", icon: <Home className="w-4 h-4 mr-2" /> },
    { name: "Cakes", path: "/cakes", icon: <Cake className="w-4 h-4 mr-2" /> },
    { name: "Pastries", path: "/pastries", icon: <Package className="w-4 h-4 mr-2" /> },
  ];

  const { session } = useSessionContext();
  const { cart } = useCart();
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    window.location.reload();
  };

  const LOGO_URL = "https://res.cloudinary.com/dzabikj6s/image/upload/v1735310817/The-cake-shop/Logo_p9gapg.png";

  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.3, when: "afterChildren" }
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: { duration: 0.3, when: "beforeChildren", staggerChildren: 0.05 }
    }
  };

  const menuItemVariants = {
    closed: { y: 20, opacity: 0 },
    open: { y: 0, opacity: 1 }
  };

  const Logo = () => (
    <Link href="/" className="flex items-center gap-3 group">
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] rounded-full opacity-0 group-hover:opacity-40 blur transition-opacity duration-300" />
        <Image
          src={LOGO_URL}
          alt="The Cake Shop Logo"
          width={44}
          height={44}
          className="relative rounded-full transform group-hover:rotate-6 transition-transform duration-300 ring-2 ring-white shadow-soft"
          priority
        />
      </div>
      <span className="font-display text-xl sm:text-2xl font-bold text-brand-text group-hover:text-brand-pink transition-colors duration-300">
        The Cake Shop
      </span>
    </Link>
  );

  const CartButton = () => (
    <Button
      variant="ghost"
      className="relative p-2 rounded-xl hover:bg-brand-cream transition-all duration-300"
      onClick={() => setIsCartOpen(true)}
      aria-label="Open cart"
    >
      <ShoppingCart className="h-5 w-5 text-brand-text group-hover:text-brand-pink transition-colors duration-300" />
      {cartItemCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-glow"
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
        className="relative p-2 rounded-xl hover:bg-brand-cream transition-all duration-300"
        aria-label="Open wishlist"
      >
        <Heart className="h-5 w-5 text-brand-text hover:text-brand-pink transition-colors duration-300" />
      </Button>
    </Link>
  );

  const LocationButton = () => (
    <Button
      variant="ghost"
      className="relative p-2 flex items-center gap-1.5 rounded-xl hover:bg-brand-cream transition-all duration-300"
      onClick={() => setIsLocationModalOpen(true)}
    >
      <MapPin className="h-4 w-4 text-brand-pink" />
      {currentLocation && (
        <span className="text-xs font-medium text-brand-text max-w-[80px] truncate">
          {currentLocation.name}
        </span>
      )}
    </Button>
  );

  return (
    <header className={cn(
      "sticky top-0 z-50 transition-all duration-500",
      scrolled
        ? "bg-white/80 backdrop-blur-xl shadow-soft border-b border-black/[0.04]"
        : "bg-white/95 backdrop-blur-sm"
    )}>
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[72px]">
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="flex items-center gap-1 mr-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className="relative px-4 py-2 text-sm font-medium text-brand-text hover:text-brand-pink rounded-lg hover:bg-brand-cream/60 transition-all duration-300 group"
                >
                  {item.name}
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] rounded-full group-hover:w-5 transition-all duration-300" />
                </Link>
              ))}
            </div>

            <div className="w-px h-6 bg-gray-200 mx-1" />

            <div className="flex items-center gap-1">
              <CartButton />
              {session && <WishlistButton />}
              <LocationButton />

              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="p-0 ml-1 rounded-full hover:ring-2 hover:ring-brand-pink/20 transition-all duration-300"
                    >
                      <Avatar className="h-9 w-9 border-2 border-brand-pink/30 ring-2 ring-white shadow-soft">
                        <AvatarImage src={session.user?.image || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-[#FFF5E4] to-[#FFD1D1] text-brand-pink font-semibold text-sm">
                          {session.user?.name?.[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-elevated border border-gray-100 bg-white/95 backdrop-blur-xl">
                    <div className="px-3 py-2.5 mb-1">
                      <p className="font-semibold text-sm text-brand-text">{session.user?.name}</p>
                      <p className="text-xs text-brand-text-secondary truncate mt-0.5">{session.user?.email}</p>
                    </div>

                    <DropdownMenuSeparator className="bg-gray-100" />

                    {session.user?.role === "admin" && (
                      <DropdownMenuItem className="hover:bg-brand-cream rounded-xl my-0.5 cursor-pointer p-0">
                        <Link href="/admin" className="w-full flex items-center px-3 py-2">
                          <Settings className="w-4 h-4 mr-2.5 text-brand-text-secondary" />
                          <span className="text-sm">Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem className="hover:bg-brand-cream rounded-xl my-0.5 cursor-pointer p-0">
                      <Link href="/profile" className="w-full flex items-center px-3 py-2">
                        <User className="w-4 h-4 mr-2.5 text-brand-text-secondary" />
                        <span className="text-sm">Profile</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="hover:bg-brand-cream rounded-xl my-0.5 cursor-pointer p-0">
                      <Link href="/my-orders" className="w-full flex items-center px-3 py-2">
                        <ShoppingBag className="w-4 h-4 mr-2.5 text-brand-text-secondary" />
                        <span className="text-sm">My Orders</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-gray-100" />

                    <DropdownMenuItem
                      onSelect={handleSignOut}
                      className="hover:bg-red-50 text-red-500 rounded-xl my-0.5 cursor-pointer px-3 py-2"
                    >
                      <LogOut className="w-4 h-4 mr-2.5" />
                      <span className="text-sm">Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2 ml-2">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-brand-text hover:text-brand-pink transition-colors duration-300 px-4 py-2 rounded-lg"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm font-semibold text-white px-5 py-2 rounded-full transition-all duration-300 hover:-translate-y-0.5"
                    style={{
                      background: 'linear-gradient(135deg, #FF9494 0%, #FFB4B4 100%)',
                      boxShadow: '0 4px 15px rgba(255, 148, 148, 0.3)',
                    }}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="lg:hidden flex items-center gap-1">
            <CartButton />
            <LocationButton />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl hover:bg-brand-cream transition-colors duration-300"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isOpen ? "open" : "closed"}
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  {isOpen ? (
                    <X className="w-5 h-5 text-brand-pink" />
                  ) : (
                    <Menu className="w-5 h-5 text-brand-text" />
                  )}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="lg:hidden overflow-hidden border-t border-gray-100"
            >
              <div className="py-4 space-y-1">
                {navItems.map((item) => (
                  <motion.div key={item.name} variants={menuItemVariants}>
                    <Link
                      onClick={() => setIsOpen(false)}
                      href={item.path}
                      className="flex items-center py-3 px-4 text-sm font-medium text-brand-text hover:bg-brand-cream hover:text-brand-pink transition-all duration-300 rounded-xl"
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
                        className="flex items-center py-3 px-4 text-sm font-medium text-brand-text hover:bg-brand-cream hover:text-brand-pink transition-all duration-300 rounded-xl"
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
                          className="flex items-center py-3 px-4 text-sm font-medium text-brand-text hover:bg-brand-cream hover:text-brand-pink transition-all duration-300 rounded-xl"
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
                        className="flex items-center py-3 px-4 text-sm font-medium text-brand-text hover:bg-brand-cream hover:text-brand-pink transition-all duration-300 rounded-xl"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                    </motion.div>

                    <motion.div variants={menuItemVariants}>
                      <Link
                        onClick={() => setIsOpen(false)}
                        href="/my-orders"
                        className="flex items-center py-3 px-4 text-sm font-medium text-brand-text hover:bg-brand-cream hover:text-brand-pink transition-all duration-300 rounded-xl"
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        My Orders
                      </Link>
                    </motion.div>

                    <motion.div variants={menuItemVariants}>
                      <hr className="border-gray-100 my-2" />
                    </motion.div>

                    <motion.div variants={menuItemVariants}>
                      <Button
                        onClick={() => { setIsOpen(false); handleSignOut(); }}
                        variant="ghost"
                        className="w-full text-left flex items-center py-3 px-4 text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-300 rounded-xl"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </motion.div>
                  </>
                ) : (
                  <motion.div variants={menuItemVariants} className="px-4 pt-4 pb-2 space-y-3">
                    <Link
                      onClick={() => setIsOpen(false)}
                      href="/login"
                      className="block w-full py-2.5 text-center text-sm font-medium text-brand-text border border-gray-200 rounded-xl hover:border-brand-pink hover:text-brand-pink transition-all duration-300"
                    >
                      Login
                    </Link>
                    <Link
                      onClick={() => setIsOpen(false)}
                      href="/register"
                      className="block w-full py-2.5 text-center text-sm font-semibold text-white rounded-xl transition-all duration-300"
                      style={{ background: 'linear-gradient(135deg, #FF9494 0%, #FFB4B4 100%)' }}
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
