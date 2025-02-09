import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Menu, X, ChevronRight } from 'lucide-react';

const navItems = [
  { name: "Dashboard", path: "/admin" },
  { name: "Home", path: "/admin/home" },
  { name: "News", path: "/admin/news" },
  { name: "About", path: "/admin/about" },
  { name: "Favorites", path: "/admin/favorites" },
  { name: "Cakes", path: "/admin/cakes" },
  { name: "Categories", path: "/admin/categories" },
  { name: 'Orders', path: '/admin/orders' },
  { name: 'Policies', path: '/admin/policies' },
  { name: "Footer", path: "/admin/footer" },
  { name: 'Settings', path: '/admin/settings' },
  { name: "Users", path: "/admin/users" },
  { name: "Coupons", path: "/admin/coupons" },
];

export default function AdminNavbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Optional: Close menu when route changes completely (not just params)
  useEffect(() => {
    const basePathname = pathname.split('/')[1]; // Gets the first part of the path
    return () => {
      if (basePathname !== 'admin') {
        setIsMobileMenuOpen(false);
      }
    };
  }, [pathname]);

  return (
    <header className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300",
      scrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-white"
    )}>
      <nav className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Title */}
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative w-12 h-12 overflow-hidden rounded-full transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="https://res.cloudinary.com/dzabikj6s/image/upload/v1735310817/The-cake-shop/Logo_p9gapg.png"
                  alt="The-Cake-Shop"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-[#FF9494] tracking-tight">
                  The Cake Shop
                </span>
                <span className="text-sm text-gray-500 font-medium">
                  Admin Panel
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden 2xl:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative group",
                  pathname === item.path
                    ? "bg-[#FF9494] text-white shadow-md"
                    : "text-gray-600 hover:bg-[#FFD1D1]/20"
                )}
              >
                <span className="relative z-10">{item.name}</span>
                {pathname === item.path && (
                  <span className="absolute inset-0 bg-gradient-to-r from-[#FF9494] to-[#FF9494]/80 rounded-lg" />
                )}
              </Link>
            ))}
            <Button
              onClick={() => signOut({ callbackUrl: "/" })}
              variant="outline"
              className="ml-4 border-[#FF9494] text-[#FF9494] hover:bg-[#FF9494] hover:text-white transition-colors duration-300"
            >
              Sign Out
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="2xl:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "fixed inset-0 z-50 2xl:hidden transition-all duration-300 ease-in-out",
            isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
        >
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div
            className={cn(
              "absolute top-0 right-0 w-72 h-full bg-white shadow-2xl transition-transform duration-300 ease-in-out transform",
              isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
            )}
          >
            <div className="p-6 overflow-y-auto h-full">
              <div className="flex items-center justify-between mb-8">
                <span className="text-lg font-semibold text-gray-900">Menu</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.path}
                    // Removed the onClick handler to keep menu open
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                      pathname === item.path
                        ? "bg-[#FF9494] text-white"
                        : "text-gray-600 hover:bg-[#FFD1D1]/20"
                    )}
                  >
                    {item.name}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ))}
                <Button
                  onClick={() => {
                    signOut({ callbackUrl: "/" });
                    setIsMobileMenuOpen(false); // Close menu only for sign out
                  }}
                  variant="outline"
                  className="w-full mt-4 border-[#FF9494] text-[#FF9494] hover:bg-[#FF9494] hover:text-white transition-colors duration-300"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}