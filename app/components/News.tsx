"use client"
import Image from 'next/image'
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
    <section id="news" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="section-title">Latest News</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item) => (
            <div key={item._id} className="card p-6 animate-fadeIn">
              {item.imageUrl && (
                <Image
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-48 object-cover mb-4 rounded"
                width={500} // You can adjust the width as needed
                height={200} // Adjust the height as needed
              />
              )}
              <h3 className="text-xl font-semibold mb-2 text-[var(--primary)]">{item.title}</h3>
              <p className="text-gray-600 mb-4">{new Date(item.date).toLocaleDateString()}</p>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

