"use client"; // Mark this as a Client Component

import './globals.css';
import { Inter } from 'next/font/google';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { usePathname } from 'next/navigation';
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { SessionProvider } from '../context/SessionContext';
import { CartProvider } from '@/context/CartContext'
const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <NextAuthSessionProvider>
      <SessionProvider>
        <html lang="en" className="scroll-smooth">
          <body className={inter.className}>
          <CartProvider>
            {!isAdminPage && <Header />} {/* Exclude Header on admin pages */}
            <main className="min-h-screen">{children}</main>
            {!isAdminPage && <Footer />} {/* Exclude Footer on admin pages */}
            </CartProvider>
          </body>
        </html>
      </SessionProvider>
    </NextAuthSessionProvider>
  );
}
