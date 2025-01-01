"use client"; // Mark this as a Client Component

import './globals.css';
import { Inter } from 'next/font/google';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react'
const inter = Inter({ subsets: ['latin'] });


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <SessionProvider>
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        {!isAdminPage && <Header />} {/* Exclude Header on admin pages */}
        <main className='min-h-screen'>{children}</main>
        {!isAdminPage && <Footer />} {/* Exclude Footer on admin pages */}
      </body>
    </html>
    </SessionProvider>
  );
}
