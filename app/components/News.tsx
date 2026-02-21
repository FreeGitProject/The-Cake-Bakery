/* eslint-disable @next/next/no-img-element */
"use client"
import { useNews } from '@/lib/useData'
import { motion } from 'framer-motion'
import { ArrowRight, Calendar } from 'lucide-react'

export default function News() {
  const { data: news, isLoading } = useNews();

  if (isLoading) return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-brand-pink border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    </section>
  );

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-sm font-semibold tracking-widest uppercase text-[#FF9494] mb-3">
            Stay Updated
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-text mb-4">
            Latest Updates
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] mx-auto rounded-full" />
        </motion.div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news?.map((item, index) => (
            <motion.article
              key={item._id}
              className="group cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1">
                {/* Image */}
                <div className="relative overflow-hidden aspect-[16/10]">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Date Badge */}
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md text-brand-text px-3 py-1.5 rounded-lg text-xs font-medium shadow-soft">
                      <Calendar className="w-3 h-3 text-[#FF9494]" />
                      {new Date(item.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-brand-text mb-2 group-hover:text-[#FF9494] transition-colors duration-300 line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-sm text-brand-text-secondary line-clamp-2 mb-4 leading-relaxed">
                    {item.description}
                  </p>
                  <div className="flex items-center text-[#FF9494] text-sm font-medium">
                    <span>Read More</span>
                    <ArrowRight className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1.5 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
