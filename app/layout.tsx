import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

import ThemeAwareFavicon from "@/components/ThemeAwareFavicon";
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
        url: '/codeunia-favicon-dark.svg',
        type: 'image/svg+xml',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/codeunia-favicon-light.svg',
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
        <link rel="icon" href="/codeunia-favicon-dark.svg" type="image/svg+xml" media="(prefers-color-scheme: dark)" />
        <link rel="icon" href="/codeunia-favicon-light.svg" type="image/svg+xml" media="(prefers-color-scheme: light)" />
        <link rel="shortcut icon" href="/codeunia-favicon-dark.svg" />
        <link rel="apple-touch-icon" href="/codeunia-favicon-dark.svg" />
      </head>
      <body className={`${geistSans.className} antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange
        >
          <ThemeAwareFavicon />
          {children}
          <Toaster richColors position="top-center" />

          <ReactDevTools />
          <AuthDebug />
        </ThemeProvider>
      </body>
    </html>
  );
}
