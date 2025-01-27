"use client"
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Clock, Phone, Wifi, Car, Cake, Coffee, Calendar, Instagram, Facebook, Twitter } from 'lucide-react'
import locationData from '../public/dataJson/location-data.json'

export default function Location() {
  const [activeTab, setActiveTab] = useState('info')
  const location = locationData.locations[0]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }

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
    <section id="location" className="py-16 bg-[#FFD1D1]">
      <motion.div 
        className="container mx-auto px-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div 
          className="text-center mb-12"
          variants={itemVariants}
        >
          <h2 className="text-4xl font-bold text-[#4A4A4A] mb-4 relative inline-block">
            Visit {locationData.companyName}
            <motion.div 
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-[#FF9494] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </h2>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Map Section */}
          <motion.div 
            className="lg:w-1/2"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="rounded-lg overflow-hidden shadow-lg">
              <iframe
                src={location.coordinates.mapUrl}
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                className="w-full"
              />
            </div>
          </motion.div>

          {/* Information Section */}
          <motion.div 
            className="lg:w-1/2"
            variants={itemVariants}
          >
            {/* Tab Navigation */}
            <div className="flex mb-6 bg-white rounded-lg p-2 shadow-md">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex-1 py-2 rounded-lg ${activeTab === 'info' ? 'bg-[#FF9494] text-white' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                Basic Info
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex-1 py-2 rounded-lg ${activeTab === 'features' ? 'bg-[#FF9494] text-white' : ''}`}
                onClick={() => setActiveTab('features')}
              >
                Features
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex-1 py-2 rounded-lg ${activeTab === 'delivery' ? 'bg-[#FF9494] text-white' : ''}`}
                onClick={() => setActiveTab('delivery')}
              >
                Delivery
              </motion.button>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg p-6 shadow-lg"
              >
                {activeTab === 'info' && (
                  <div className="space-y-6">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-6 h-6 text-[#FF9494] mt-1" />
                      <div>
                        <h3 className="text-xl font-semibold text-[#4A4A4A] mb-2">Address</h3>
                        <p className="text-gray-600">
                          {location.address.line1}<br />
                          {location.address.line2}<br />
                          {location.address.city}, {location.address.state} {location.address.pincode}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-6 h-6 text-[#FF9494] mt-1" />
                      <div>
                        <h3 className="text-xl font-semibold text-[#4A4A4A] mb-2">Hours</h3>
                        <p className="text-gray-600">
                          {location.hours.weekdays.days}: {location.hours.weekdays.open} - {location.hours.weekdays.close}<br />
                          {location.hours.saturday.days}: {location.hours.saturday.open} - {location.hours.saturday.close}<br />
                          {location.hours.sunday.days}: {location.hours.sunday.open} - {location.hours.sunday.close}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="w-6 h-6 text-[#FF9494] mt-1" />
                      <div>
                        <h3 className="text-xl font-semibold text-[#4A4A4A] mb-2">Contact</h3>
                        <p className="text-gray-600">
                          Phone: {location.contact.phone}<br />
                          Email: {location.contact.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'features' && (
                  <div className="grid grid-cols-2 gap-4">
                    {location.features.map((feature, index) => (
                      <motion.div
                        key={feature}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-2 bg-[#FFF6F6] p-3 rounded-lg"
                      >
                        <FeatureIcon feature={feature} />
                        <span className="text-gray-700">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                )}

                {activeTab === 'delivery' && (
                  <div className="space-y-6">
                    <div className="bg-[#FFF6F6] p-4 rounded-lg">
                      <h3 className="text-xl font-semibold text-[#4A4A4A] mb-2">Delivery Information</h3>
                      <p className="text-gray-600">
                        Delivery Radius: {locationData.delivery.radius}<br />
                        Minimum Order: ₹{locationData.delivery.minimumOrder}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[#4A4A4A] mb-2">Delivery Partners</h3>
                      <div className="flex gap-3">
                        {locationData.delivery.partners.map((partner) => (
                          <motion.span
                            key={partner}
                            whileHover={{ scale: 1.1 }}
                            className="bg-[#FF9494] text-white px-4 py-2 rounded-full text-sm"
                          >
                            {partner}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Social Media Links */}
            <motion.div 
              className="flex justify-center gap-4 mt-6"
              variants={itemVariants}
            >
              <motion.a
                href={`https://instagram.com/${locationData.socialMedia.instagram}`}
                whileHover={{ scale: 1.2, rotate: 5 }}
                className="text-[#FF9494]"
              >
                <Instagram />
              </motion.a>
              <motion.a
                href={`https://facebook.com/${locationData.socialMedia.facebook}`}
                whileHover={{ scale: 1.2, rotate: 5 }}
                className="text-[#FF9494]"
              >
                <Facebook />
              </motion.a>
              <motion.a
                href={`https://twitter.com/${locationData.socialMedia.twitter}`}
                whileHover={{ scale: 1.2, rotate: 5 }}
                className="text-[#FF9494]"
              >
                <Twitter />
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}