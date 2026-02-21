"use client"
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import NewsletterSubscribe from "@/components/NewsletterSubscribe"
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  ChevronRight
} from 'lucide-react'
import { useFooter } from '@/lib/useData'

export default function Footer() {
  const { data: footerData } = useFooter();

  if (!footerData) {
    return (
      <footer className="bg-brand-text py-12">
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white/80 rounded-full animate-spin" />
        </div>
      </footer>
    );
  }

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'Our Cakes', href: '/cakes' },
    { name: 'About Us', href: '/about' },
    { name: 'Events', href: '/events' },
    { name: 'Contact', href: '/contact' },
    { name: 'Policies', href: '/policies' }
  ];

  const socialLinks = [
    { icon: Facebook, href: footerData.socialLinks.facebook, label: 'Facebook' },
    { icon: Instagram, href: footerData.socialLinks.instagram, label: 'Instagram' },
    { icon: Twitter, href: footerData.socialLinks.twitter, label: 'Twitter' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <footer className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #2D2D3F 0%, #1A1A2E 100%)',
      }}
    >
      {/* Decorative gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#FF9494]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#FFB4B4]/5 rounded-full blur-3xl" />
      </div>

      {/* Top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#FF9494]/40 to-transparent" />

      <motion.div
        className="max-w-6xl mx-auto px-6 pt-16 pb-8 relative"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="rounded-full overflow-hidden border-2 border-white/10 shadow-soft">
                <Image
                  src="https://res.cloudinary.com/dzabikj6s/image/upload/v1735310817/The-cake-shop/Logo_p9gapg.png"
                  alt="Cake Atelier Logo"
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
              <h2 className="font-display text-xl font-bold text-white">
                {footerData.companyName}
              </h2>
            </div>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              {footerData.description}
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
              Explore
            </h3>
            <div className="space-y-3">
              {quickLinks.map((link) => (
                <div key={link.name}>
                  <Link
                    href={link.href}
                    className="group flex items-center text-sm text-white/50 hover:text-[#FF9494] transition-colors duration-300"
                  >
                    <ChevronRight className="w-3 h-3 mr-1.5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                    {link.name}
                  </Link>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants}>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
              Connect
            </h3>
            <div className="space-y-4">
              <a
                href={`mailto:${footerData.email}`}
                className="flex items-center gap-3 text-sm text-white/50 hover:text-[#FF9494] transition-colors duration-300"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                {footerData.email}
              </a>
              <a
                href={`tel:${footerData.phone}`}
                className="flex items-center gap-3 text-sm text-white/50 hover:text-[#FF9494] transition-colors duration-300"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                {footerData.phone}
              </a>
            </div>

            {/* Social Links */}
            <div className="flex gap-2 mt-6">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-[#FF9494]/20 flex items-center justify-center text-white/40 hover:text-[#FF9494] transition-all duration-300"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Newsletter */}
          <motion.div variants={itemVariants}>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
              Stay Inspired
            </h3>
            <p className="text-sm text-white/50 mb-4 leading-relaxed">
              Subscribe for exclusive recipes, offers, and culinary insights.
            </p>
            <div className="[&_input]:bg-white/5 [&_input]:border-white/10 [&_input]:text-white [&_input]:placeholder:text-white/30 [&_input]:rounded-xl [&_input]:text-sm
                            [&_button]:bg-gradient-to-r [&_button]:from-[#FF9494] [&_button]:to-[#FFB4B4] [&_button]:text-white [&_button]:rounded-xl [&_button]:text-sm [&_button]:font-medium [&_button]:border-0 [&_button]:hover:shadow-glow [&_button]:transition-shadow [&_button]:duration-300">
              <NewsletterSubscribe />
            </div>
          </motion.div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-white/5">
          <p className="text-center text-xs text-white/30">
            &copy; {new Date().getFullYear()} {footerData.companyName}. All Rights Reserved.
          </p>
        </div>
      </motion.div>
    </footer>
  )
}
