/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from "react";
import Loader from "./Loader";
import { useData } from "@/context/DataContext";

const CakeShopHero = () => {
  const { homeDataList } = useData(); // Fetch from context
  const [currentSlide, setCurrentSlide] = useState(0);
//console.log(homeDataList);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % homeDataList?.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [homeDataList?.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % homeDataList?.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + homeDataList?.length) % homeDataList?.length);
  };

  if (homeDataList?.length==0) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Styles */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-down {
          animation: slideDown 0.8s ease-out forwards;
        }

        .animate-slide-up {
          animation: slideUp 0.8s ease-out forwards;
        }

        .content-enter {
          opacity: 0;
        }

        .content-enter-active {
          opacity: 1;
          transition: opacity 0.5s ease-in-out;
        }
      `}</style>

      {/* Slides */}
      {homeDataList.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 
          ${index === currentSlide ? "opacity-100" : "opacity-0"}`}
        >
          <img
            src={slide?.heroImage}
            alt={slide?.heroTitle}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 text-white/80 hover:text-white
                 bg-black/20 hover:bg-black/40 rounded-full transition-all duration-200"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 text-white/80 hover:text-white
                 bg-black/20 hover:bg-black/40 rounded-full transition-all duration-200"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
        <div
          key={currentSlide}
          className="text-center space-y-6 max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 animate-slide-down">
            {homeDataList[currentSlide]?.heroTitle}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 animate-slide-up">
            {homeDataList[currentSlide]?.heroSubtitle}
          </p>
          <a href={homeDataList[currentSlide]?.buttonLink}>
            <button
              className="px-8 py-3 bg-white text-gray-900 rounded-full text-lg font-medium
                     transform hover:-translate-y-0.5 hover:shadow-lg
                     transition-all duration-200 mt-2"
            >
              {homeDataList[currentSlide]?.buttonText}
            </button>
          </a>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {homeDataList.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 
            ${
              index === currentSlide
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/50 to-transparent z-10" />
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black/50 to-transparent z-10" />
    </section>
  );
};

export default CakeShopHero;
