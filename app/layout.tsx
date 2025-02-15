"use client"; // Mark this as a Client Component

import "./globals.css";
import { Inter } from "next/font/google";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { usePathname } from "next/navigation";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { SessionProvider } from "../context/SessionContext";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "@/components/ui/toaster";
const inter = Inter({ subsets: ["latin"] });
import Script from "next/script";
import RotatingPromoBanner from "@/components/RotatingPromoBanner";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");

  return (
    <NextAuthSessionProvider>
      <html lang="en" className="scroll-smooth">
        <body className={inter.className}>
          <SessionProvider>
            <CartProvider>
              {!isAdminPage && <RotatingPromoBanner />} {/* Exclude Header on admin pages */}
              {!isAdminPage && <Header />} {/* Exclude Header on admin pages */}
              <main className="min-h-screen">{children}</main>
              {!isAdminPage && <Footer />} {/* Exclude Footer on admin pages */}
            </CartProvider>
            <Script
              src="https://checkout.razorpay.com/v1/checkout.js"
              strategy="lazyOnload"
            />
            <Toaster />
          </SessionProvider>
        </body>
      </html>
    </NextAuthSessionProvider>
  );
}
