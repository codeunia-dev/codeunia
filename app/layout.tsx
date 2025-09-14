import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GlobalErrorHandler } from "@/components/GlobalErrorHandler";
import AIProvider from "@/components/ai/AIProvider";
import AuthProvider from "@/components/AuthProvider";
import { getPageMetadata, getPageStructuredData } from "@/lib/seo/metadata";

// Only load dev tools in development
const ReactDevTools = () => null;
const AuthDebug = () => null;
import "./globals.css";

// const defaultUrl = process.env.VERCEL_URL
//   ? `https://${process.env.VERCEL_URL}`
//   : "http://localhost:3000";

export const metadata: Metadata = getPageMetadata('home', {
  title: "Codeunia – Empowering Coders Globally",
  description: "Join the global coding community. Participate in hackathons, compete on leaderboards, and advance your coding skills with Codeunia.",
  keywords: ['coding', 'hackathons', 'programming', 'developer', 'competition', 'leaderboard', 'coding community'],
  url: '/',
  type: 'website'
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = getPageStructuredData('home');

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Critical CSS for above-the-fold content */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical CSS for initial render */
            body { margin: 0; font-family: var(--font-geist-sans), system-ui, sans-serif; }
            .hero-section { min-height: 100vh; display: flex; align-items: center; }
            .loading-spinner { animation: spin 1s linear infinite; }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            .fade-in { animation: fadeIn 0.5s ease-in; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          `
        }} />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/fonts/geist-sans.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/geist-mono.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://ocnorlktyfswjqgvzrve.supabase.co" />
        
        {/* DNS prefetch for better performance */}
        <link rel="dns-prefetch" href="//vercel.live" />
        <link rel="dns-prefetch" href="//va.vercel-scripts.com" />
        
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        
        {/* Apple specific meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Codeunia" />
        
        {/* Viewport for mobile optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      </head>
      <body className={`${geistSans.className} antialiased`} suppressHydrationWarning>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem={true}
            disableTransitionOnChange
          >
            <AuthProvider>
              <GlobalErrorHandler />
              {children}
              <Toaster richColors position="top-center" />
              <AIProvider />

              <ReactDevTools />
              <AuthDebug />
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
