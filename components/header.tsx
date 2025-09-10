"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
// import { ThemeToggle } from "@/components/theme-toggle"
import { UserIcon } from "@/components/user-icon"
import { Menu, X } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import CodeuniaLogo from "./codeunia-logo";
import dynamic from "next/dynamic";

// Lazy load non-critical components
const PremiumButton = dynamic(() => import("./PremiumButton"), {
  loading: () => <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />,
  ssr: false
});

const UserDisplay = dynamic(() => import("./UserDisplay"), {
  loading: () => <div className="w-24 h-6 bg-gray-200 rounded animate-pulse" />,
  ssr: false
});

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, loading } = useAuth()

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (isMenuOpen && !target.closest('.mobile-menu-container')) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  // helper function to check if a path is active
  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(path)
  }

  
  const navItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/opportunities", label: "Opportunities" },
    { href: "/zenith-hall", label: "Zenith Hall" },
    { href: "/blog", label: "Blog" },
    { href: "/join", label: "Join Codeunia" },
    { href: "/contact", label: "Contact Us" },
  ]

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">
        {/* logo section - left */}
        <div className="flex items-center flex-shrink-0">
          <Link href="/" className="hover:scale-105 transition-transform duration-200">
            <CodeuniaLogo size="md" noLink={true} showText={true} instanceId="header" />
          </Link>
        </div>

        {/* desktop nav - center */}
        <nav className="hidden md:flex items-center space-x-8 mx-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors relative group ${
                isActive(item.href)
                  ? "text-primary"
                  : "text-foreground hover:text-primary"
              }`}
            >
              {item.label}
              <span
                className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${
                  isActive(item.href)
                    ? "w-full"
                    : "w-0 group-hover:w-full"
                }`}
              ></span>
            </Link>
          ))}
        </nav>

        {/* desktop auth & theme - right */}
        <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
          {/* <ThemeToggle /> */}
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : user ? (
            <div className="flex items-center space-x-2">
              <PremiumButton user={user} />
              <UserDisplay userId={user.id} showCodeuniaId={false} />
              <UserIcon />
            </div>
          ) : (
            <>
              <Button variant="ghost" asChild className="hover:scale-105 transition-transform">
                <Link href={`/auth/signin?returnUrl=${encodeURIComponent(pathname)}`}>Sign In</Link>
              </Button>
              <Button asChild className="glow-effect hover:scale-105 transition-all duration-300">
                <Link href={`/auth/signup?returnUrl=${encodeURIComponent(pathname)}`}>Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* mobile menu button */}
        <div className="flex md:hidden items-center space-x-1">
          {/* <ThemeToggle /> */}
          {!loading && user && (
            <div className="flex items-center space-x-1">
              <PremiumButton user={user} />
              <UserIcon />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`hover:scale-105 transition-all duration-200 ml-1 ${
              isMenuOpen ? 'bg-muted/50' : ''
            }`}
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* mobile nav*/}
      {isMenuOpen && (
        <div className="mobile-menu-container md:hidden border-t bg-background/95 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
          <nav className="container px-4 py-4 space-y-3">
            {/* Navigation Links */}
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block text-sm font-medium transition-colors py-2.5 px-3 rounded-md relative ${
                    isActive(item.href)
                      ? "text-primary font-semibold bg-primary/10"
                      : "text-foreground hover:text-primary hover:bg-muted/50"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                  {isActive(item.href) && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-full"></span>
                  )}
                </Link>
              ))}
            </div>

            {/* User Actions */}
            {!loading && user && (
              <div className="pt-3 border-t border-border">
                <div className="flex items-center space-x-2 py-2 px-3">
                  <UserIcon />
                  <div className="flex-1 min-w-0">
                    <UserDisplay userId={user.id} showCodeuniaId={false} />
                  </div>
                </div>
              </div>
            )}

            {/* Auth Buttons for non-authenticated users */}
            {!loading && !user && (
              <div className="pt-3 border-t border-border">
                <div className="flex space-x-2">
                  <Button variant="ghost" asChild className="flex-1 text-sm">
                    <Link href={`/auth/signin?returnUrl=${encodeURIComponent(pathname)}`}>Sign In</Link>
                  </Button>
                  <Button asChild className="flex-1 glow-effect text-sm">
                    <Link href={`/auth/signup?returnUrl=${encodeURIComponent(pathname)}`}>Sign Up</Link>
                  </Button>
                </div>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}