"use client"

import { useState } from "react"
import Link from "next/link"
import { X } from "lucide-react"

interface PromoBannerProps {
  message: string
  link: string
  linkText: string
  backgroundColor: string
  textColor: string
  onClose: () => void
}

export function PromoBanner({ message, link, linkText, backgroundColor, textColor, onClose }: PromoBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) {
    return null
  }

  const handleClose = () => {
    setIsVisible(false)
    onClose()
  }

  return (
    <div className="relative px-4 py-3 text-center" style={{ backgroundColor, color: textColor }}>
      <p className="text-sm font-medium">
        {message}{" "}
        <Link href={link} className="underline font-bold">
          {linkText}
        </Link>
      </p>
      <button
        onClick={handleClose}
        className="absolute top-1/2 right-2 -translate-y-1/2 p-1 rounded-full hover:bg-opacity-20 hover:bg-black transition-colors"
        aria-label="Close banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

