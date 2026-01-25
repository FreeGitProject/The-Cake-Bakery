"use client";
import "./globals.css";
import { Inter } from "next/font/google";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { usePathname } from "next/navigation";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { SessionProvider } from "../context/SessionContext";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import Script from "next/script";
import RotatingPromoBanner from "@/components/RotatingPromoBanner";
import { LocationProvider } from "@/context/LocationContext";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,  // 5 min cache
        gcTime: 10 * 60 * 1000,    // 10 min garbage collection
        retry: 2,
        refetchOnWindowFocus: false,
      },
    },
  }));

  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");

  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <NextAuthSessionProvider>
            <SessionProvider>
              <CartProvider>
                <LocationProvider>
                  {!isAdminPage && <RotatingPromoBanner />}
                  {!isAdminPage && <Header />}
                  <main className="min-h-screen">{children}</main>
                  {!isAdminPage && <Footer />}
                </LocationProvider>
              </CartProvider>
            </SessionProvider>
          </NextAuthSessionProvider>
        
          <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
          <Toaster />
        </QueryClientProvider>
      </body>
    </html>
  );
}
