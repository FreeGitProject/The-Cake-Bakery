/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect, useCallback } from "react";
import Loader from "./Loader";
import { useHomePageData } from '@/lib/useData';
import { ChevronLeft, ChevronRight } from "lucide-react";

const CakeShopHero = () => {
  const { homeDataList } = useHomePageData();
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % homeDataList?.length);
  }, [homeDataList?.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + homeDataList?.length) % homeDataList?.length);
  }, [homeDataList?.length]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  if (homeDataList?.length === 0) {
    return (
      <div className="relative h-screen overflow-hidden">
        <Loader />
      </div>
    );
  }

  return (
    <section className="relative h-screen overflow-hidden bg-brand-text">
      {/* Slides */}
      {homeDataList?.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-[1200ms] ease-out
            ${index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}
        >
          <img
            src={slide?.heroImage}
            alt={slide?.heroTitle}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Premium gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-3 text-white/70 hover:text-white
                   bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl border border-white/10
                   transition-all duration-300 hover:scale-105 group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform duration-300" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-3 text-white/70 hover:text-white
                   bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl border border-white/10
                   transition-all duration-300 hover:scale-105 group"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-300" />
      </button>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 sm:px-8">
        <div key={currentSlide} className="text-center max-w-4xl mx-auto">
          <h1
            className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight tracking-tight"
            style={{
              animation: 'fade-in-up 0.8s ease-out forwards',
              textShadow: '0 4px 30px rgba(0,0,0,0.3)',
            }}
          >
            {homeDataList[currentSlide]?.heroTitle}
          </h1>
          <p
            className="text-base sm:text-lg md:text-xl text-white/85 mb-10 max-w-2xl mx-auto leading-relaxed font-light"
            style={{
              animation: 'fade-in-up 0.8s ease-out 0.2s forwards',
              opacity: 0,
            }}
          >
            {homeDataList[currentSlide]?.heroSubtitle}
          </p>
          <div
            style={{
              animation: 'fade-in-up 0.8s ease-out 0.4s forwards',
              opacity: 0,
            }}
          >
            <a href={homeDataList[currentSlide]?.buttonLink}>
              <button className="group relative px-8 py-3.5 bg-white text-brand-text rounded-full text-sm sm:text-base font-semibold
                               transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)]
                               overflow-hidden">
                <span className="relative z-10">{homeDataList[currentSlide]?.buttonText}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                  {/* hover text color handled by group-hover above */}
                </span>
              </button>
            </a>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {homeDataList?.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`rounded-full transition-all duration-500 ${
              index === currentSlide
                ? "bg-white w-8 h-2.5"
                : "bg-white/40 w-2.5 h-2.5 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black/40 to-transparent z-[5]" />
    </section>
  );
};

export default CakeShopHero;
