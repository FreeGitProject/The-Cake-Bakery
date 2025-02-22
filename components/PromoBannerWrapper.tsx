// "use client";

// import { useEffect, useState } from "react";
// import { PromoBanner } from "@/components/PromoBanner";

// interface PromoBannerData {
//   message: string;
//   link: string;
//   linkText: string;
//   backgroundColor: string;
//   textColor: string;
// }

// export default function PromoBannerWrapper() {
//   const [banner, setBanner] = useState<PromoBannerData | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     async function fetchBanner() {
//       try {
//         const response = await fetch("/api/admin/banners");
//         if (!response.ok) {
//           throw new Error("Failed to fetch banner");
//         }
//         const data: PromoBannerData | null = await response.json();
//         setBanner(data);
//       } catch (error) {
//         console.error("Error fetching promo banner:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     }

//     fetchBanner();
//   }, []);

//   if (isLoading || !banner) return null; // Return nothing if loading or no banner exists

//   return (
//     <PromoBanner
//       message={banner.message}
//       link={banner.link}
//       linkText={banner.linkText}
//       backgroundColor={banner.backgroundColor}
//       textColor={banner.textColor}
//       onClose={() => console.log("Banner closed")}
//     />
//   );
// }
