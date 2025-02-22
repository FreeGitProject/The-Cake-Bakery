"use client";

import { useState } from "react";
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
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { ShoppingCart, User, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import CartOffCanvas from "../app/components/CartOffCanvas";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navItems = [
    { name: "Home", path: "/" },
    // { name: 'Favorites', path: '/favorites' },
    { name: "Cakes", path: "/cakes" },
    { name: "Pastries", path: "/pastries" },
  ];
  const { session } = useSessionContext();
  //console.log("header session", session?.user);
  const router = useRouter();
  const { cart } = useCart();
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    // setTimeout(() => {
    //   window.location.reload();
    //   //  router.push("/login");
    // }, 100);
    router.push("/login");
  };

  const LOGO_URL =
    "https://res.cloudinary.com/dzabikj6s/image/upload/v1735310817/The-cake-shop/Logo_p9gapg.png";

  // Subcomponents for better organization
  const Logo = () => (
    <Link href="/" className="flex items-center group">
      <div className="relative">
        <Image
          src={LOGO_URL}
          alt="Cake-Bakery Shop Logo"
          width={50}
          height={50}
          className="rounded-full transform group-hover:rotate-12 transition-transform duration-300"
          priority
        />
      </div>
      <span className="ml-3 sm:text-3xl text-base font-bold text-[#4A4A4A] group-hover:text-[#FF9494] transition-colors duration-300">
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
      {cart.length > 0 && (
        <span className="absolute -top-1 -right-1 bg-[#FF9494] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs animate-bounce">
          {cart.reduce((total, item) => total + item.quantity, 0)}
        </span>
      )}
    </Button>
  );
  const WishlistButton = () => (
    <Link href="/wishlist">
      <Button
        variant="ghost"
        className="relative p-2 hover:bg-[#FFF5E4] transition-colors duration-300"
        aria-label="Open cart"
      >
        <Heart className="h-6 w-6 text-[#4A4A4A] hover:text-[#FF9494] transition-colors duration-300" />
      </Button>
    </Link>
  );

  //if (loading) return <p>Loading...</p>;
  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <nav className="container mx-auto px-6 py-3">
        {/* Main Navigation Bar */}
        <div className="flex items-center justify-between">
          {/* Logo and Brand Name */}
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Navigation Links */}

            <div className="flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className="text-[#4A4A4A] hover:text-[#FF9494] transition duration-300 relative group"
                >
                  {item.name}
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#FF9494] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                </Link>
              ))}
            </div>
            <CartButton />
            {session && (
              // <Link href="/wishlist">
              //   <Button variant="ghost" className="relative p-2">
              //     <Heart className="h-6 w-6 hover:text-[#FF9494]" />
              //   </Button>
              // </Link>
              <WishlistButton />
            )}
            {/* User Menu */}
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="p-0 hover:bg-[#FFF5E4] transition-colors duration-300"
                  >
                    <Avatar className="h-8 w-8 border-2 border-[#FF9494]">
                      <AvatarFallback className="bg-[#FFF5E4] text-[#FF9494]">
                        {session.user?.name?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {session.user?.role === "admin" && (
                    <DropdownMenuItem className="hover:bg-[#FFF5E4]">
                      <Link href="/admin" className="w-full">
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="hover:bg-[#FFF5E4]">
                    <Link href="/profile" className="w-full">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-[#FFF5E4]">
                    <Link href="/my-orders" className="w-full">
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => signOut()}
                    className="hover:bg-[#FFF5E4]"
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center">
                <a
                  href="/login"
                  className="py-2 text-[#4A4A4A] hover:text-[#FF9494] transition duration-300"
                >
                  <Avatar className="h-8 w-8 border-2">
                    <AvatarFallback className="bg-white">
                      <User />
                    </AvatarFallback>
                  </Avatar>
                </a>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-4">
            <CartButton />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-[#FFF5E4] transition-colors duration-300"
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
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden transform transition-all duration-300 ${
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          } overflow-hidden`}
        >
          <div className="py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                onClick={() => setIsOpen(false)}
                key={item.name}
                href={item.path}
                className="block py-2 px-4 text-[#4A4A4A] hover:bg-[#FFF5E4] hover:text-[#FF9494] transition duration-300 rounded-md"
              >
                {item.name}
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#FF9494] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </Link>
            ))}
            {session ? (
              <>
                {session.user?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="px-4 py-2 hover:bg-base-200 block w-full"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  onClick={() => setIsOpen(false)}
                  href="/wishlist"
                  className="block py-2 px-4 text-[#4A4A4A] hover:bg-[#FFF5E4] hover:text-[#FF9494] transition duration-300 rounded-md"
                >
                  Wishlist
                </Link>
                <Link
                  onClick={() => setIsOpen(false)}
                  href="/profile"
                  className="block py-2 px-4 text-[#4A4A4A] hover:bg-[#FFF5E4] hover:text-[#FF9494] transition duration-300 rounded-md"
                >
                  Profile
                </Link>
                <Link
                  onClick={() => setIsOpen(false)}
                  href="/my-orders"
                  className="block py-2 px-4 text-[#4A4A4A] hover:bg-[#FFF5E4] hover:text-[#FF9494] transition duration-300 rounded-md"
                >
                  My Orders
                </Link>
                <Button
                  onClick={() => {
                    setIsOpen(false);
                    handleSignOut();
                  }}
                  variant="ghost"
                  className="w-full text-left px-4 hover:bg-[#FFF5E4]"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <div className="space-y-2 px-4">
                <Link
                  onClick={() => setIsOpen(false)}
                  href="/login"
                  className="block py-2 text-center text-[#4A4A4A] hover:text-[#FF9494] transition duration-300"
                >
                  Login
                </Link>
                <Link
                  onClick={() => setIsOpen(false)}
                  href="/register"
                  className="block py-2 text-center bg-[#FF9494] text-white rounded-md hover:bg-[#FFB4B4] transition duration-300"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
      <CartOffCanvas isOpen={isCartOpen} setIsOpen={setIsCartOpen} />
    </header>
  );
}
