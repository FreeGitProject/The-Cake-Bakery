"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface FooterData {
  companyName: string
  description: string
  email: string
  phone: string
  socialLinks: {
    facebook: string
    twitter: string
    instagram: string
  }
}

export default function Footer() {
  const [footerData, setFooterData] = useState<FooterData | null>(null)

  useEffect(() => {
    async function fetchFooterData() {
      try {
        const res = await fetch('/api/footer')
        const data = await res.json()
        setFooterData(data)
      } catch (error) {
        console.error('Error fetching footer data:', error)
      }
    }
    fetchFooterData()
  }, [])

  if (!footerData) {
    return <div>Loading...</div>
  }

  return (
    <footer className="bg-[#FF9494] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between">
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h3 className="text-2xl font-semibold mb-4">{footerData.companyName}</h3>
            <p className="text-sm">{footerData.description}</p>
          </div>
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {['Home', 'News', 'About', 'Favorites', 'Location'].map((item) => (
                <li key={item}>
                  <Link href={`#${item.toLowerCase()}`} className="hover:text-[#FFF5E4] transition duration-300">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full md:w-1/3">
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <p className="mb-2">Email: {footerData.email}</p>
            <p className="mb-4">Phone: {footerData.phone}</p>
            <div className="flex space-x-4">
              {Object.entries(footerData.socialLinks).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#FFF5E4] transition duration-300"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    {platform === 'facebook' && (
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    )}
                    {platform === 'twitter' && (
                      <path d="M23.953 4.57a10 10 0 01-2.88.79 5.03 5.03 0 002.21-2.78 10.05 10.05 0 01-3.19 1.22 5.02 5.02 0 00-8.55 4.58A14.25 14.25 0 011.67 3.15a5.02 5.02 0 001.56 6.7 5 5 0 01-2.27-.62v.06a5.02 5.02 0 004.03 4.92 5.04 5.04 0 01-2.27.09 5.02 5.02 0 004.68 3.48 10.06 10.06 0 01-6.22 2.15A10.15 10.15 0 010 19.54a14.21 14.21 0 007.7 2.26c9.24 0 14.3-7.65 14.3-14.3v-.65a10.2 10.2 0 002.5-2.6"/>
                    )}
                    {platform === 'instagram' && (
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    )}
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
