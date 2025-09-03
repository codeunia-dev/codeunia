import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GlobalErrorHandler } from "@/components/GlobalErrorHandler";
import AIProvider from "@/components/ai/AIProvider";

// Only load dev tools in development
const ReactDevTools = () => null;
const AuthDebug = () => null;
import "./globals.css";


const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Codeunia – Empowering Coders Globally",
  description: "The fastest way to build apps with Next.js and Supabase",
  icons: {
    icon: [
      {
        url: '/codeunia-favicon-light.svg',
        type: 'image/svg+xml',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/codeunia-favicon-dark.svg',
        type: 'image/svg+xml',
        media: '(prefers-color-scheme: light)',
      }
    ],
    shortcut: '/codeunia-favicon-dark.svg',
    apple: '/codeunia-favicon-dark.svg',
  },
};

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
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body className={`${geistSans.className} antialiased`} suppressHydrationWarning>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem={true}
            disableTransitionOnChange
          >
            <GlobalErrorHandler />
            {children}
            <Toaster richColors position="top-center" />
            <AIProvider />

            <ReactDevTools />
            <AuthDebug />
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
