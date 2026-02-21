'use client';
import './globals.css';
import { Inter } from 'next/font/google';
import Header from '@/shared/components/Header';
import Footer from '@/shared/components/Footer';
import { usePathname } from 'next/navigation';
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { CartProvider } from '@/features/cart/context/CartContext';
import { Toaster } from '@/shared/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import Script from 'next/script';
import RotatingPromoBanner from '@/features/content/components/RotatingPromoBanner';
import { LocationProvider } from '@/features/location/context/LocationContext';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 min cache
            gcTime: 10 * 60 * 1000, // 10 min garbage collection
            retry: 2,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <NextAuthSessionProvider>
            <CartProvider>
              <LocationProvider>
                {!isAdminPage && <RotatingPromoBanner />}
                {!isAdminPage && <Header />}
                <main className="min-h-screen">{children}</main>
                {!isAdminPage && <Footer />}
              </LocationProvider>
            </CartProvider>
          </NextAuthSessionProvider>

          <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
          <Toaster />
        </QueryClientProvider>
      </body>
    </html>
  );
}
