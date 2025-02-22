'use client'
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ModernLoader = () => {
  const [progress, setProgress] = useState(0);
  const baseColor = '#FF9494';
  const elements = 8;

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 0 : prev + 1));
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm">
      <div className="relative flex flex-col items-center">
        {/* Circular loader */}
        <div className="relative w-40 h-40">
          {[...Array(elements)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-full h-full"
              style={{
                transform: `rotate(${(360 / elements) * i}deg)`,
              }}
            >
              <motion.div
                animate={{
                  scale: [1, 0.8, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * (1.5 / elements),
                  ease: "easeInOut"
                }}
                className="w-4 h-4 rounded-full"
                style={{
                  background: baseColor,
                  transformOrigin: '50% 1000%'
                }}
              />
            </motion.div>
          ))}

          {/* Progress circle */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <motion.circle
              cx="80"
              cy="80"
              r="76"
              strokeWidth="2"
              fill="none"
              stroke={baseColor}
              strokeDasharray="478"
              strokeDashoffset={478 - (478 * progress) / 100}
              className="opacity-20"
            />
            <motion.circle
              cx="80"
              cy="80"
              r="76"
              strokeWidth="2"
              fill="none"
              stroke={baseColor}
              strokeDasharray="478"
              strokeDashoffset={478 - (478 * progress) / 100}
              className="drop-shadow-md"
            />
          </svg>

          {/* Center progress text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-2xl font-semibold"
              style={{ color: baseColor }}
            >
              {progress}%
            </motion.div>
          </div>
        </div>

        {/* Loading bar */}
        <div className="mt-8 w-48">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            className="h-1 rounded-full"
            style={{ background: baseColor }}
          />
          
          {/* Floating dots */}
          <div className="relative h-4 mt-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [-4, 0, -4],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  background: baseColor,
                  left: `${i * 20 + 40}%`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernLoader;
// import { motion } from 'framer-motion';

// export default function Loader() {
//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
//       <div className="relative w-24 h-24">
//         {/* Plate */}
//         <motion.div
//           className="absolute bottom-0 w-24 h-4 bg-muted rounded-full"
//           initial={{ scale: 0.5, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           transition={{ duration: 0.5 }}
//         />
        
//         {/* Cake layers */}
//         <motion.div
//           className="absolute bottom-4 w-20 h-4 mx-auto left-0 right-0 bg-primary rounded-lg"
//           initial={{ y: -50, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ delay: 0.2, duration: 0.5 }}
//         />
//         <motion.div
//           className="absolute bottom-8 w-16 h-4 mx-auto left-0 right-0 bg-secondary rounded-lg"
//           initial={{ y: -40, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ delay: 0.4, duration: 0.5 }}
//         />
//         <motion.div
//           className="absolute bottom-12 w-12 h-4 mx-auto left-0 right-0 bg-accent rounded-lg"
//           initial={{ y: -30, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ delay: 0.6, duration: 0.5 }}
//         />
        
//         {/* Cherry on top */}
//         <motion.div
//           className="absolute bottom-16 w-4 h-4 mx-auto left-0 right-0 bg-destructive rounded-full"
//           initial={{ y: -20, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ 
//             delay: 0.8,
//             duration: 0.5,
//             repeat: Infinity,
//             repeatType: "reverse",
//             repeatDelay: 1
//           }}
//         />
//       </div>
//       <motion.p
//         className="absolute mt-32 text-lg font-medium text-muted-foreground"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 1, duration: 0.5 }}
//       >
//         Baking something sweet...
//       </motion.p>
//     </div>
//   );
// }