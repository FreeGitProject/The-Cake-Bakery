/* eslint-disable @next/next/no-img-element */
"use client"
//import Image from 'next/image'
import { useState, useEffect } from 'react'

interface NewsItem {
  _id: string
  title: string
  date: string
  description: string
  imageUrl?: string
}

export default function News() {
  const [news, setNews] = useState<NewsItem[]>([])

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch('/api/news')
        const data = await res.json()
        setNews(data)
      } catch (error) {
        console.error('Error fetching news:', error)
      }
    }
    fetchNews()
  }, [])

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#4A4A4A] mb-4 relative inline-block">Latest Updates
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-[#FF9494] rounded-full"></div>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {news.map((item) => (
            <div 
              key={item._id} 
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-lg mb-6">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                  <p className="text-white text-sm">
                    {new Date(item.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-[#FF9494] transition-colors">
                {item.title}
              </h3>
              
              <p className="text-gray-600 text-base line-clamp-2 mb-4">
                {item.description}
              </p>
{/* 
              <div className="flex items-center text-[#FF9494] font-medium">
                <span className="group-hover:mr-4 transition-all">Read Article</span>
                <svg 
                  className="w-0 group-hover:w-4 transition-all" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div> */}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

