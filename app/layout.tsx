import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ridge AI Push - Intelligent Push Notification SaaS Platform",
  description: "Enterprise-grade push notification platform with AI-powered campaign generation, smart targeting, and multi-app management. OneSignal alternative with natural language campaign creation.",
  icons: {
    icon: [
      { url: '/logo-icon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: '/logo-icon.svg',
  },
  keywords: [
    "push notifications",
    "AI marketing",
    "mobile notifications",
    "SaaS platform", 
    "campaign management",
    "user engagement",
    "mobile marketing",
    "notification API",
    "OneSignal alternative",
    "Firebase messaging",
    "Expo push",
    "React Native notifications"
  ],
  authors: [{ name: "Ridge AI Push Team" }],
  creator: "Ridge AI Push",
  publisher: "Ridge AI Push",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://ai-push.ridge-it.site'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Ridge AI Push - Intelligent Push Notification SaaS Platform",
    description: "Enterprise-grade push notification platform with AI-powered campaign generation, smart targeting, and multi-app management.",
    url: '/',
    siteName: 'Ridge AI Push',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Ridge AI Push - Intelligent Push Notification Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Ridge AI Push - Intelligent Push Notification SaaS Platform",
    description: "Enterprise-grade push notification platform with AI-powered campaign generation, smart targeting, and multi-app management.",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Ridge AI Push",
              "description": "Enterprise-grade push notification platform with AI-powered campaign generation, smart targeting, and multi-app management.",
              "url": process.env.NEXT_PUBLIC_BASE_URL || "https://ai-push.ridge-it.site",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "description": "Free tier available"
              },
              "creator": {
                "@type": "Organization",
                "name": "Ridge AI Push Team"
              },
              "featureList": [
                "AI-powered campaign generation",
                "Smart user targeting",
                "Multi-app management",
                "Real-time analytics",
                "OneSignal alternative",
                "Firebase & Expo push support"
              ]
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
