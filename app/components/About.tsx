/* eslint-disable @next/next/no-img-element */
"use client"
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Loader from './Loader'

interface AboutData {
  title: string
  description: string[]
  imageUrl: string
  founderName: string
  foundedYear: number
}

export default function About() {
  const [aboutData, setAboutData] = useState<AboutData | null>(null)

  useEffect(() => {
    async function fetchAboutData() {
      try {
        const res = await fetch('/api/about')
        const data = await res.json()
        setAboutData(data)
      } catch (error) {
        console.error('Error fetching about data:', error)
      }
    }
    fetchAboutData()
  }, [])

  if (!aboutData) {
    return <div><Loader/></div>
  }

  return (
    <section className="relative py-24 bg-[#FF9494]">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute top-0 left-0 w-72 h-72 bg-[#FFB4B4] rounded-full mix-blend-soft-light blur-3xl"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.2 }}
          className="absolute bottom-0 right-0 w-96 h-96 bg-[#FFF5E4] rounded-full mix-blend-soft-light blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              {aboutData.title || 'Our Story'}
            </h2>
            <div className="w-24 h-1 bg-white/70 mx-auto" />
          </motion.div>

          <div className="flex flex-col md:flex-row items-center gap-16">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="md:w-1/2 relative group"
            >
              <div className="absolute -inset-4 bg-[#FFB4B4] rounded-2xl opacity-50 group-hover:opacity-70 transition duration-300 blur-lg" />
              <div className="relative">
                <img
                  src={aboutData.imageUrl || "/bakery-image.jpg"}
                  alt="Our bakery"
                  className="rounded-2xl w-full object-cover h-[400px] shadow-xl transform group-hover:scale-[1.02] transition duration-300"
                />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20" />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="md:w-1/2 space-y-6"
            >
              {aboutData.description.map((paragraph, index) => (
                <motion.p 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-lg text-white/90 leading-relaxed"
                >
                  {paragraph}
                </motion.p>
              ))}
              
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="border-l-4 border-[#FFF5E4] pl-6 mt-8"
              >
                <p className="text-lg font-medium text-white">
                  Founded by {aboutData.founderName}
                </p>
                <p className="text-white/80">
                  Established {aboutData.foundedYear}
                </p>
              </motion.div>

              <motion.button 
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-8 px-8 py-3 bg-white text-[#FF9494] rounded-xl font-medium 
                          transform hover:bg-[#FFF5E4] transition-all duration-200 
                          shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 
                          focus:ring-white focus:ring-offset-2 focus:ring-offset-[#FF9494]"
              >
                Learn More
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}