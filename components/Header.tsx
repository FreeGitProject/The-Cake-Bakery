'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { Button } from "@/components/ui/button"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()
console.log("header session",session?.user)
  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <nav className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-[#FF9494]">
          {/* <RiCake3Fill className="mr-1 text-4xl " /> Cake icon */}
            <Image src="https://res.cloudinary.com/dzabikj6s/image/upload/v1735310817/The-cake-shop/Logo_p9gapg.png" alt="Cake-Bakery Shop Logo" width={50} height={50} className="rounded-full" />
            {/* <span className="ml-3 text-2xl font-semibold">The Cake Shop</span> */}
            <a href="/" className="flex items-center text-3xl font-bold">
                       
                        The Cake Shop
                    </a>
          </div>
          <div className="hidden md:flex space-x-6">
            {['Home', 'News', 'About', 'Favorites', 'Location'].map((item) => (
              <Link key={item} href={`#${item.toLowerCase()}`} className="text-[#4A4A4A] hover:text-[#FF9494] transition duration-300">
                {item}
              </Link>
              
            ))}
              <Link  href="/cakes" className="text-[#4A4A4A] hover:text-[#FF9494] transition duration-300">
                All Cakes
              </Link>
            {session ? (
              <>
                <span className="text-[#4A4A4A]">
                  {session.user?.name?.[0].toUpperCase()}
                </span>
                <Button onClick={() => signOut()} variant="ghost">
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-[#4A4A4A] hover:text-[#FF9494] transition duration-300">
                  Login
                </Link>
                <Link href="/register" className="text-[#4A4A4A] hover:text-[#FF9494] transition duration-300">
                  Register
                </Link>
              </>
            )}
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-[#FF9494]">
              {isOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
        {isOpen && (
          <div className="mt-4 md:hidden space-y-2 animate-fadeIn">
            {['Home', 'News', 'About', 'Favorites', 'Location'].map((item) => (
              <Link key={item} href={`/#${item.toLowerCase()}`} className="block py-2 text-[#4A4A4A] hover:text-[#FF9494] transition duration-300">
                {item}
              </Link>
            ))}
            {session ? (
              <>
                <span className="block py-2 text-[#4A4A4A]">
                  {session.user?.name?.[0].toUpperCase()}
                </span>
                <Button onClick={() => signOut()} variant="ghost" className="w-full text-left">
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" className="block py-2 text-[#4A4A4A] hover:text-[#FF9494] transition duration-300">
                  Login
                </Link>
                <Link href="/register" className="block py-2 text-[#4A4A4A] hover:text-[#FF9494] transition duration-300">
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}

