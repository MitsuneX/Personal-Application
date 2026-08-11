import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono, Orbitron } from "next/font/google";
import Script from "next/script";
import { RootProviders } from "@/components/providers/RootProviders";
import "./globals.css";

// ─── Fonts ────────────────────────────────────────────────────────────────────

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : "http://localhost:3000"
  ),
  title: {
    default: "Nexus Xenon — Personal Hub",
    template: "%s | Nexus Xenon",
  },
  description:
    "A highly personal command-center dashboard tracking games, media, anime, and more. Built with Next.js, Tailwind CSS, and Framer Motion.",
  keywords: ["dashboard", "personal", "gaming", "anime", "media tracker", "PWA"],
  authors: [{ name: "Dashboard User" }],
  creator: "Dashboard",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nexus Xenon",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Nexus Xenon — Personal Hub",
    description: "Personal command-center dashboard",
    siteName: "Nexus Xenon",
    images: [{ url: "/icons/icon-512.png", width: 512, height: 512 }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFF5E4" },
    { media: "(prefers-color-scheme: dark)", color: "#050816" },
  ],
};

// ─── Root Layout ──────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`
        ${spaceGrotesk.variable}
        ${jetBrainsMono.variable}
        ${orbitron.variable}
      `}
    >
      <head>
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Nexus Xenon" />
        <meta name="application-name" content="Nexus Xenon" />
        <meta name="msapplication-TileColor" content="#FF6B35" />
        <meta name="msapplication-TileImage" content="/icons/icon-192.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('dashboard-theme');var root=document.documentElement;if(t==='cyber'){root.setAttribute('data-theme','cyber');root.classList.add('theme-cyber');root.classList.remove('theme-neo-brutal');}else{root.setAttribute('data-theme','brutal');root.classList.add('theme-neo-brutal');root.classList.remove('theme-cyber');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-[family-name:var(--font-space-grotesk)] antialiased" suppressHydrationWarning>
        {/* 📱 PWA — Service Worker registration */}
        <Script
          id="sw-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                if ('${process.env.NODE_ENV}' === 'production') {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js', {scope: '/'}).catch(console.warn);
                  });
                } else {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for (let registration of registrations) {
                      registration.unregister();
                    }
                  });
                }
              }
            `,
          }}
        />
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
