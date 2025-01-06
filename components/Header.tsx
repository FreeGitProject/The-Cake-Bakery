'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {  signOut } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { useSessionContext } from '@/context/SessionContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from 'next/navigation'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import CartOffCanvas from '../app/components/CartOffCanvas'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Favorites', path: '/favorites' },
    { name: 'Cakes', path: '/cakes' },
    { name: 'News', path: '/news' },
  ];
  const { session } = useSessionContext();
  //console.log("header session",session?.user)
  const router = useRouter()
  const { cart } = useCart()
  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }
  //if (loading) return <p>Loading...</p>;
  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <nav className="container mx-auto px-6 py-3">
        {/* Main Navigation Bar */}
        <div className="flex items-center justify-between">
          {/* Logo and Brand Name */}
          <Link href="/" className="flex items-center group">
            <div className="relative">
              <Image
                src="https://res.cloudinary.com/dzabikj6s/image/upload/v1735310817/The-cake-shop/Logo_p9gapg.png"
                alt="Cake-Bakery Shop Logo"
                width={50}
                height={50}
                className="rounded-full transform group-hover:rotate-12 transition-transform duration-300"
              />
            </div>
            <span className="ml-3 text-3xl font-bold text-[#4A4A4A] group-hover:text-[#FF9494] transition-colors duration-300">
              The Cake Shop
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
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

            {/* Cart Button */}
            <Button
              variant="ghost"
              className="relative p-2 hover:bg-[#FFF5E4] transition-colors duration-300"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-6 w-6 text-[#4A4A4A] hover:text-[#FF9494] transition-colors duration-300" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF9494] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs animate-bounce">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </Button>

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
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="px-4 py-2 text-[#4A4A4A] hover:text-[#FF9494] transition duration-300"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-[#FF9494] text-white rounded-md hover:bg-[#FFB4B4] transition duration-300"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md hover:bg-[#FFF5E4] transition-colors duration-300"
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

        {/* Mobile Menu */}
        <div
          className={`md:hidden transform transition-all duration-300 ${
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          } overflow-hidden`}
        >
          <div className="py-4 space-y-2">
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
            <Button
              variant="ghost"
              className="w-full justify-start px-4 hover:bg-[#FFF5E4]"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-6 w-6 mr-2" />
              Cart ({cart.reduce((total, item) => total + item.quantity, 0)})
            </Button>

            {session ? (
              <>
                <Link
                  href="/profile"
                  className="block py-2 px-4 text-[#4A4A4A] hover:bg-[#FFF5E4] hover:text-[#FF9494] transition duration-300 rounded-md"
                >
                  Profile
                </Link>
                <Link
                  href="/my-orders"
                  className="block py-2 px-4 text-[#4A4A4A] hover:bg-[#FFF5E4] hover:text-[#FF9494] transition duration-300 rounded-md"
                >
                  My Orders
                </Link>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  className="w-full text-left px-4 hover:bg-[#FFF5E4]"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <div className="space-y-2 px-4">
                <Link
                  href="/login"
                  className="block py-2 text-center text-[#4A4A4A] hover:text-[#FF9494] transition duration-300"
                >
                  Login
                </Link>
                <Link
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

