'use client'
import { Outfit } from 'next/font/google';
import './globals.css';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/firebase';
import { usePathname, useRouter } from 'next/navigation';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname()

  useEffect(() => {
    if (pathname !== '/signin' && auth.currentUser === null) {
      console.log('User not authenticated, redirecting to /signin');
      router.replace('/signin');
    };

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace('/');
      } else {
        console.log('User not authenticated, redirecting to /signin');
        router.replace('/signin');
      }
    });

    return () => {
      unsub();
    }
  }, []);

  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
