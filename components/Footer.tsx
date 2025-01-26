"use client"
import { motion } from 'framer-motion'
import Loader from '@/app/components/Loader'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import NewsletterSubscribe from "@/components/NewsletterSubscribe"
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Mail, 
  Phone, 
  ChevronRight 
} from 'lucide-react'
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
    return <div><Loader/></div>
  }

  return (
    <footer className="relative bg-gradient-to-br from-[#FF9494] to-[#FFB4B4] text-white pt-16 pb-8">
    {/* Decorative Top Border */}
    <div className="absolute top-0 left-0 right-0 h-4 bg-[#FF9494] shadow-lg">
      <div className="absolute top-0 left-0 right-0 h-2 bg-[#FFB4B4]" style={{
        clipPath: "polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)"
      }}/>
    </div>

    <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-12">
      {/* Brand Section */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center md:items-start"
      >
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 6 }}
          className="mb-6 rounded-full overflow-hidden border-4 border-white shadow-xl"
        >
          <Image 
            src="https://res.cloudinary.com/dzabikj6s/image/upload/v1735310817/The-cake-shop/Logo_p9gapg.png" 
            alt="Cake Atelier Logo" 
            width={150} 
            height={150} 
            className="object-cover"
          />
        </motion.div>
        <h2 className="text-3xl font-bold mb-4 text-center md:text-left">
          {footerData.companyName}
        </h2>
        <p className="text-sm text-center md:text-left opacity-80">
          {footerData.description}
        </p>
      </motion.div>

      {/* Rest of the component remains the same as previous submission */}
      {/* Quick Links, Contact Info, Newsletter sections */}
      
      {/* Quick Links */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-4"
      >
        <h3 className="text-xl font-semibold mb-6 border-b pb-2">Explore</h3>
        {[
          { name: 'Home', href: '/' },
          { name: 'Our Cakes', href: '/cakes' },
          { name: 'About Us', href: '/about' },
          { name: 'Events', href: '/events' },
          { name: 'Contact', href: '/contact' },
          { name: 'Policies', href: '/policies' }
        ].map((link) => (
          <motion.div 
            key={link.name}
            whileHover={{ translateX: 10 }}
            className="flex items-center"
          >
            <ChevronRight className="mr-2 text-white/70" size={16} />
            <Link 
              href={link.href} 
              className="hover:text-white/80 transition-colors"
            >
              {link.name}
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Contact Info */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="space-y-6"
      >
        <h3 className="text-xl font-semibold mb-6 border-b pb-2">Connect</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Mail className="text-white/70" />
            <a 
              href={`mailto:${footerData.email}`} 
              className="hover:text-white/80 transition-colors"
            >
              {footerData.email}
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <Phone className="text-white/70" />
            <a 
              href={`tel:${footerData.phone}`} 
              className="hover:text-white/80 transition-colors"
            >
              {footerData.phone}
            </a>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex space-x-6 mt-6">
          {[
            { icon: Facebook, href: footerData.socialLinks.facebook },
            { icon: Instagram, href: footerData.socialLinks.instagram },
            { icon: Twitter, href: footerData.socialLinks.twitter }
          ].map(({ icon: Icon, href }) => (
            <motion.a
              key={href}
              href={href}
              target="_blank"
              whileHover={{ scale: 1.2 }}
              className="text-white/70 hover:text-white transition-colors"
            >
              <Icon size={24} />
            </motion.a>
          ))}
        </div>
      </motion.div>

       {/* Newsletter */}
       <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white/10 rounded-xl p-6 backdrop-blur-sm"
        >
          <h3 className="text-xl font-semibold mb-4">Stay Inspired</h3>
          <p className="text-sm mb-4 opacity-80">
            Subscribe to our newsletter for exclusive recipes, offers, and culinary insights.
          </p>
          <NewsletterSubscribe />
        </motion.div>
      </div>

    {/* Copyright */}
    <div className="text-center text-white/70 mt-12 pt-6 border-t border-white/20">
      © {new Date().getFullYear()} {footerData.companyName}. All Rights Reserved.
    </div>
  </footer>
  )
}

