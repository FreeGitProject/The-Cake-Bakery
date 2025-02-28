"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import Header from "../components/Header";
import { usePathname } from "next/navigation";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { SessionProvider } from "../context/SessionContext";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "@/components/ui/toaster";
import Script from "next/script";
import RotatingPromoBanner from "@/components/RotatingPromoBanner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
//import FooterWrapper from "@/components/FooterWrapper";

const inter = Inter({ subsets: ["latin"] });
const queryClient = new QueryClient();

export default  function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");

  return (
    <NextAuthSessionProvider>
      <QueryClientProvider client={queryClient}>
        <html lang="en" className="scroll-smooth">
          <body className={inter.className}>
            <SessionProvider>
              <CartProvider>
                {!isAdminPage && <RotatingPromoBanner />}
                {!isAdminPage && <Header />}
                <main className="min-h-screen">{children}</main>
                {/* {!isAdminPage && <FooterWrapper />} */}
              </CartProvider>
              <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
              <Toaster />
            </SessionProvider>
          </body>
        </html>
      </QueryClientProvider>
    </NextAuthSessionProvider>
  );
}


// function PromoBannerWrapper() {
//   return (
//     <PromoBanner
//       message="Special offer! 20% off on all cakes"
//       link="/cakes"
//       linkText="Shop now"
//       backgroundColor="#FF9494"
//       textColor="#FFFFFF"
//       onClose={() => {
//         // Handle close action (e.g., store in local storage to not show again for a while)
//         console.log("Banner closed")
//       }}
//     />
//   )
// }