/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF5E4]">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-[#FF9494]">404</h1>
        <h2 className="text-3xl font-semibold text-[#4A4A4A]">Oops! Page not found</h2>
        <p className="text-xl text-gray-600">
          It looks like we couldn&apos;t find the sweet treat you were looking for.
        </p>
        <div className="mt-8">
          <Link href="/">
            <Button className="bg-[#FF9494] hover:bg-[#FFD1D1] text-white">
              Back to Home
            </Button>
          </Link>
        </div>
        <div className="mt-12">
          <img
            src="/cake-404.png"
            alt="Sad cake"
            className="mx-auto w-48 h-48 object-contain"
          />
        </div>
      </div>
    </div>
  )
}

