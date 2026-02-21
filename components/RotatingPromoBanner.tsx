import React, { useState, useEffect } from 'react';
import { X, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useSWR from "swr";

type PromoBannerProps = {
  message: string;
  link?: string;
  linkText?: string;
  backgroundColor?: string;
  textColor?: string;
  onClose?: () => void;
  icon?: React.ReactNode;
  isPriority?: boolean;
};

const PromoBanner = ({
  message,
  link,
  linkText,
  backgroundColor = '#FF9494',
  textColor = '#FFFFFF',
  onClose,
  icon,
  isPriority = false
}: PromoBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
    localStorage.setItem('promoBannerClosed', 'true');
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="relative overflow-hidden"
      style={{
        background: backgroundColor === '#FF6B6B' || backgroundColor === '#FF9494'
          ? 'linear-gradient(135deg, #FF9494 0%, #FFB4B4 50%, #FFD1D1 100%)'
          : backgroundColor,
        color: textColor
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-7xl mx-auto py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-x-3">
          {isPriority && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm shadow-sm">
              <Bell className="h-3.5 w-3.5" />
            </span>
          )}

          <motion.span
            className="text-sm font-medium flex items-center gap-2 tracking-wide"
            animate={{ scale: isHovered ? 1.01 : 1 }}
            transition={{ duration: 0.2 }}
          >
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {message}
            {link && linkText && (
              <motion.a
                href={link}
                className="ml-2 font-semibold px-4 py-1 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 text-sm shadow-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {linkText}
              </motion.a>
            )}
          </motion.span>

          <motion.button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-white/20 backdrop-blur-sm transition-all duration-300"
            whileHover={{ rotate: 90 }}
            aria-label="Close banner"
          >
            <X className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface PromoBannerData {
  id: string;
  message: string;
  link?: string;
  linkText?: string;
  backgroundColor?: string;
  textColor?: string;
  icon?: string;
  isPriority?: boolean;
}

const RotatingPromoBanner = () => {
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const { data: banners } = useSWR<PromoBannerData[] | null>("/api/admin/banners", fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    refreshInterval: 86400 * 1000,
  });

  useEffect(() => {
    if (banners && banners.length > 1 && !isPaused) {
      const timer = setInterval(() => {
        setCurrentPromoIndex((prev) => (prev + 1) % banners.length);
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [banners, isPaused]);

  const handlePrevious = () => {
    setCurrentPromoIndex((prev) =>
      prev === 0 ? banners!.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentPromoIndex((prev) =>
      (prev + 1) % banners!.length
    );
  };

  if (!banners || banners.length === 0) return null;

  const currentPromo = banners[currentPromoIndex];

  return (
    <div
      className="relative z-50"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="sync">
        <PromoBanner
          key={currentPromo.id}
          message={currentPromo.message}
          linkText={currentPromo.linkText}
          link={currentPromo.link}
          backgroundColor={currentPromo.backgroundColor}
          textColor={currentPromo.textColor}
          isPriority={currentPromo.isPriority}
        />
      </AnimatePresence>

      {banners.length > 1 && (
        <>
          <motion.button
            className="absolute left-4 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/15 backdrop-blur-sm hover:bg-white/25 transition-all duration-300"
            onClick={handlePrevious}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {/* <ChevronLeft className="w-4 h-4" /> */}
          </motion.button>

          <motion.button
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/15 backdrop-blur-sm hover:bg-white/25 transition-all duration-300"
            onClick={handleNext}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {/* <ChevronRight className="w-4 h-4" /> */}
          </motion.button>

          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1.5">
            {banners.map((_, index) => (
              <motion.button
                key={index}
                className={`rounded-full transition-all duration-300 ${
                  index === currentPromoIndex
                    ? 'bg-white w-4 h-1.5'
                    : 'bg-white/40 w-1.5 h-1.5 hover:bg-white/60'
                }`}
                onClick={() => setCurrentPromoIndex(index)}
                whileHover={{ scale: 1.2 }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default RotatingPromoBanner;
