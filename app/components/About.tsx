/* eslint-disable @next/next/no-img-element */
"use client";
//import Image from 'next/image'
import { useEffect, useState } from "react";
import Loader from "./Loader";
import { motion } from "framer-motion";
interface AboutData {
  title: string;
  description: string[];
  imageUrl: string;
  founderName: string;
  foundedYear: number;
}

export default function About() {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);

  useEffect(() => {
    async function fetchAboutData() {
      try {
        const res = await fetch("/api/about");
        const data = await res.json();
        setAboutData(data);
      } catch (error) {
        console.error("Error fetching about data:", error);
      }
    }
    fetchAboutData();
  }, []);

  if (!aboutData) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  return (
    <section className="relative py-24 bg-[#FF9494]">
      <div className="container mx-auto px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6}}
              className="text-4xl font-bold text-white mb-4"
            >
              {aboutData.title || "Our Story"}
            
            <div className="w-24 h-1 bg-white/70 mx-auto" />
            </motion.h2>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2 relative group">
              <div className="absolute -inset-4 bg-[#FFB4B4] rounded-2xl opacity-50 group-hover:opacity-70 transition duration-300 blur-lg" />
              <motion.h2
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6}}
              >
                <div className="relative">
                  <img
                    src={aboutData.imageUrl || "/bakery-image.jpg"}
                    alt="Our bakery"
                    className="rounded-2xl w-full object-cover h-[400px] shadow-xl transform group-hover:scale-[1.02] transition duration-300"
                  />
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20" />
                </div>
              </motion.h2>
            </div>

            <div className="md:w-1/2 space-y-6">
              <motion.h2
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6}}
              >
                {aboutData.description.map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-lg text-white/90 leading-relaxed"
                  >
                    {paragraph}
                  </p>
                ))}
                <div className="border-l-4 border-[#FFF5E4] pl-6 mt-8">
                  <p className="text-lg font-medium text-white">
                    Founded by {aboutData.founderName}
                  </p>
                  <p className="text-white/80">
                    Established {aboutData.foundedYear}
                  </p>
                </div>
              <button
                className="mt-8 px-8 py-3 bg-white text-[#FF9494] rounded-xl font-medium 
                             transform hover:-translate-y-0.5 hover:bg-[#FFF5E4] 
                             transition-all duration-200 shadow-lg hover:shadow-xl
                             focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2
                             focus:ring-offset-[#FF9494]"
              >
                Learn More
              </button>
              </motion.h2>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
