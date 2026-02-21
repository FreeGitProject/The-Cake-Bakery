"use client"
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Clock, Phone, Wifi, Car, Cake, Coffee, Calendar, Instagram, Facebook, Twitter } from 'lucide-react'
import { useCompanyInfo } from '@/lib/useData'

export default function Location() {
  const [activeTab, setActiveTab] = useState('info')
  const { data: locationData } = useCompanyInfo()
  const location = locationData?.locations?.[0]

  const tabs = [
    { id: 'info', label: 'Basic Info' },
    { id: 'features', label: 'Features' },
    { id: 'delivery', label: 'Delivery' },
  ]

  const FeatureIcon = ({ feature }: { feature: string }) => {
    const icons = {
      "Birthday Cakes": Cake,
      "Cafe Seating": Coffee,
      "Free WiFi": Wifi,
      "Parking Available": Car,
    }
    const Icon = icons[feature as keyof typeof icons] || Calendar
    return <Icon className="w-5 h-5" />
  }

  return (
    <section id="location" className="py-24 bg-white">
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
            Find Us
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-text mb-4">
            Visit {locationData?.companyName}
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] mx-auto rounded-full" />
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
          {/* Map Section */}
          <motion.div
            className="lg:w-1/2"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="rounded-2xl overflow-hidden shadow-card h-full min-h-[400px] lg:min-h-[480px] border border-gray-100">
              <iframe
                src={location?.coordinates.mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '400px' }}
                allowFullScreen
                loading="lazy"
                className="w-full h-full"
              />
            </div>
          </motion.div>

          {/* Information Section */}
          <motion.div
            className="lg:w-1/2"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Tab Navigation */}
            <div className="flex bg-[#FAFAFA] rounded-xl p-1 mb-6 gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300
                    ${activeTab === tab.id
                      ? 'bg-white text-brand-text shadow-soft'
                      : 'text-brand-text-secondary hover:text-brand-text'
                    }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft"
              >
                {activeTab === 'info' && (
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#FFF5E4] flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-[#FF9494]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-brand-text mb-1.5">Address</h3>
                        <p className="text-sm text-brand-text-secondary leading-relaxed">
                          {location?.address.line1}<br />
                          {location?.address.line2}<br />
                          {location?.address.city}, {location?.address.state} {location?.address.pincode}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#FFF5E4] flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-[#FF9494]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-brand-text mb-1.5">Hours</h3>
                        <div className="space-y-1">
                          <p className="text-sm text-brand-text-secondary">
                            <span className="font-medium text-brand-text">{location?.hours.weekdays.days}:</span> {location?.hours.weekdays.open} - {location?.hours.weekdays.close}
                          </p>
                          <p className="text-sm text-brand-text-secondary">
                            <span className="font-medium text-brand-text">{location?.hours.saturday.days}:</span> {location?.hours.saturday.open} - {location?.hours.saturday.close}
                          </p>
                          <p className="text-sm text-brand-text-secondary">
                            <span className="font-medium text-brand-text">{location?.hours.sunday.days}:</span> {location?.hours.sunday.open} - {location?.hours.sunday.close}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#FFF5E4] flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-[#FF9494]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-brand-text mb-1.5">Contact</h3>
                        <p className="text-sm text-brand-text-secondary">
                          Phone: {location?.contact.phone}<br />
                          Email: {location?.contact.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'features' && (
                  <div className="grid grid-cols-2 gap-3">
                    {location?.features.map((feature, index) => (
                      <motion.div
                        key={feature}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                        className="flex items-center gap-3 bg-[#FAFAFA] p-3.5 rounded-xl hover:bg-[#FFF5E4] transition-colors duration-300"
                      >
                        <div className="text-[#FF9494]">
                          <FeatureIcon feature={feature} />
                        </div>
                        <span className="text-sm font-medium text-brand-text">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                )}

                {activeTab === 'delivery' && (
                  <div className="space-y-5">
                    <div className="bg-[#FAFAFA] p-5 rounded-xl">
                      <h3 className="text-sm font-semibold text-brand-text mb-2">Delivery Information</h3>
                      <div className="space-y-1.5">
                        <p className="text-sm text-brand-text-secondary">
                          <span className="font-medium text-brand-text">Delivery Radius:</span> {locationData?.delivery.radius}
                        </p>
                        <p className="text-sm text-brand-text-secondary">
                          <span className="font-medium text-brand-text">Minimum Order:</span> &#8377;{locationData?.delivery.minimumOrder}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-brand-text mb-3">Delivery Partners</h3>
                      <div className="flex flex-wrap gap-2">
                        {locationData?.delivery.partners.map((partner) => (
                          <span
                            key={partner}
                            className="bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] text-white px-4 py-2 rounded-xl text-sm font-medium shadow-soft hover:shadow-glow transition-shadow duration-300"
                          >
                            {partner}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Social Media Links */}
            <div className="flex justify-center gap-3 mt-6">
              {[
                { icon: Instagram, href: `https://instagram.com/${locationData?.socialMedia.instagram}`, label: 'Instagram' },
                { icon: Facebook, href: `https://facebook.com/${locationData?.socialMedia.facebook}`, label: 'Facebook' },
                { icon: Twitter, href: `https://twitter.com/${locationData?.socialMedia.twitter}`, label: 'Twitter' },
              ].map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  whileHover={{ y: -2 }}
                  className="w-10 h-10 rounded-xl bg-[#FAFAFA] flex items-center justify-center text-brand-text-secondary hover:text-[#FF9494] hover:bg-[#FFF5E4] transition-all duration-300"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
