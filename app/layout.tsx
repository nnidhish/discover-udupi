import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import OfflineIndicator from '@/components/OfflineIndicator';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: '#F59E0B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'Discover Udupi — Your Local Guide',
  description: 'Explore temples, beaches, food & hidden gems in the cultural heart of Karnataka, India.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Discover Udupi'
  },
  openGraph: {
    title: 'Discover Udupi — Your Local Guide',
    description: 'Explore temples, beaches, food & hidden gems in Udupi, Karnataka.',
    type: 'website',
    locale: 'en_IN',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <ErrorBoundary>
          {children}
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          <PWAInstallPrompt />
          <OfflineIndicator />
          <ServiceWorkerRegistration />
        </ErrorBoundary>
      </body>
    </html>
  );
}