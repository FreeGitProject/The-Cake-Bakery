"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";
import { AiOutlineMenuFold } from "react-icons/ai";
import { MdClose } from "react-icons/md";

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
];

export default function AdminNavbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center text-[#FF9494]">
            <a href="/" className="flex items-center text-3xl font-bold">
              <Image
                src="https://res.cloudinary.com/dzabikj6s/image/upload/v1735310817/The-cake-shop/Logo_p9gapg.png"
                alt="The-Cake-Shop"
                width={50}
                height={50}
                className="rounded-full"
              />
              The Cake Shop
            </a>
            <Link href="/admin" className="text-2xl font-bold ml-2">
              (Admin Panel)
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium",
                  pathname === item.path
                    ? "bg-[#FF9494] text-white"
                    : "text-gray-600 hover:bg-[#FFD1D1] hover:text-gray-900"
                )}
              >
                {item.name}
              </Link>
            ))}
            <Button
              onClick={() => signOut({ callbackUrl: "/" })}
              variant="outline"
              className="ml-4"
            >
              Sign Out
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="xl:hidden flex items-center">
            <button
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
              onClick={toggleMobileMenu}
              aria-label="Toggle navigation menu"
            >
              <AiOutlineMenuFold size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Offcanvas Mobile Menu */}
      <div
  className={cn(
    "fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out",
    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
  )}
>
  {/* Backdrop */}
  {isMobileMenuOpen && (
    <div
      className="fixed inset-0 bg-black bg-opacity-50"
      onClick={toggleMobileMenu}
      aria-hidden="true"
    ></div>
  )}

  {/* Menu */}
  <div className="relative w-64 bg-white h-full shadow-lg p-4 overflow-y-auto">
    <button
      className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 focus:outline-none"
      onClick={toggleMobileMenu}
      aria-label="Close menu"
    >
      <MdClose size={24} />
    </button>
    <div className="mt-8 flex flex-col space-y-4">
      {navItems.map((item) => (
        <Link
          key={item.name}
          href={item.path}
          className={cn(
            "block px-3 py-2 rounded-md text-sm font-medium",
            pathname === item.path
              ? "bg-[#FF9494] text-white"
              : "text-gray-600 hover:bg-[#FFD1D1] hover:text-gray-900"
          )}
          onClick={toggleMobileMenu}
        >
          {item.name}
        </Link>
      ))}
      <Button
        onClick={() => signOut({ callbackUrl: "/" })}
        variant="outline"
        className="mt-4"
      >
        Sign Out
      </Button>
    </div>
  </div>
</div>

    </header>
  );
}
