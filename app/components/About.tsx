/* eslint-disable @next/next/no-img-element */
"use client"
import { useAbout } from '@/lib/useData'
import { motion } from 'framer-motion'

export default function About() {
  const { data: aboutData, isLoading } = useAbout();

  if (isLoading) {
    return (
      <section className="py-24">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-24 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #FF9494 0%, #FFB4B4 40%, #FF9494 100%)',
      }}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-sm font-semibold tracking-widest uppercase text-white/70 mb-3">
              Who We Are
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              {aboutData?.title || 'Our Story'}
            </h2>
            <div className="w-16 h-1 bg-white/50 mx-auto rounded-full" />
          </motion.div>

          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Image */}
            <motion.div
              className="lg:w-1/2 w-full"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7 }}
            >
              <div className="relative group">
                {/* Decorative frame */}
                <div className="absolute -inset-3 bg-white/20 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                <div className="relative overflow-hidden rounded-2xl">
                  <img
                    src={aboutData?.imageUrl || "/bakery-image.jpg"}
                    alt="Our bakery"
                    className="w-full object-cover h-[350px] sm:h-[420px] transform group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20" />
                </div>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              className="lg:w-1/2 w-full"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <div className="space-y-5">
                {aboutData?.description.map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-base sm:text-lg text-white/90 leading-relaxed"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Founder Attribution */}
              <div className="mt-8 flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                <div className="w-1 h-full min-h-[48px] bg-white/50 rounded-full flex-shrink-0" />
                <div>
                  <p className="text-base font-semibold text-white">
                    Founded by {aboutData?.founderName}
                  </p>
                  <p className="text-sm text-white/70 mt-0.5">
                    Established {aboutData?.foundedYear}
                  </p>
                </div>
              </div>

              <motion.button
                className="mt-8 px-8 py-3 bg-white text-[#FF9494] rounded-xl font-semibold text-sm
                           transition-all duration-300 shadow-elevated hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)]
                           focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#FF9494]"
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
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
