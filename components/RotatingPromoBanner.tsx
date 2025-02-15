import React, { useState } from 'react';
import { X } from 'lucide-react';

type PromoBannerProps = {
  message: string;
  link?: string;
  linkText?: string;
  backgroundColor?: string;
  textColor?: string;
  onClose?: () => void;
};

const PromoBanner = ({
  message = "🎂 Free delivery on orders over $50! Limited time offer",
  link = "/shop",
  linkText = "Shop Now",
  onClose
}: PromoBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
    // Optionally save to localStorage to keep banner closed
    localStorage.setItem('promoBannerClosed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="relative bg-pink-600 text-white">
      <div className="max-w-7xl mx-auto py-2 px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center">
          <span className="text-sm md:text-base font-medium">
            {message}
            {link && linkText && (
              <a href={link} className="ml-2 font-bold underline hover:text-pink-100 transition-colors">
                {linkText}
              </a>
            )}
          </span>
          <button
            onClick={handleClose}
            className="p-1 ml-4 rounded-full hover:bg-pink-500 transition-colors"
            aria-label="Close banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Example usage with multiple promotions that rotate
const RotatingPromoBanner = () => {
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

  const promotions = [
    {
      message: "🎂 Free delivery on orders over $50!",
      linkText: "Order Now",
      link: "/shop"
    },
    {
      message: "🎉 New! Custom Birthday Cakes Available",
      linkText: "Customize Now",
      link: "/custom-cakes"
    },
    {
      message: "💝 Valentine's Special: 20% off on all heart-shaped cakes",
      linkText: "View Collection",
      link: "/valentines"
    }
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % promotions.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const currentPromo = promotions[currentPromoIndex];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 transition-transform duration-300">
      <PromoBanner
        message={currentPromo.message}
        linkText={currentPromo.linkText}
        link={currentPromo.link}
      />
    </div>
  );
};

export default RotatingPromoBanner;