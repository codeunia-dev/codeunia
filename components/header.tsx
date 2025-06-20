"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
// import { ThemeToggle } from "@/components/theme-toggle"
import { UserIcon } from "@/components/user-icon"
import { Menu, X, Code2 } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, loading } = useAuth()

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
    { href: "/events", label: "Events" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact Us" },
  ]

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* logo section - left */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Code2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Codeunia</span>
          </Link>
        </div>

        {/* desktop nav - center */}
        <nav className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
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
        <div className="hidden md:flex items-center space-x-4">
          {/* <ThemeToggle /> */}
          {!loading && (
            user ? (
              <UserIcon />
            ) : (
              <>
                <Button variant="ghost" asChild className="hover:scale-105 transition-transform">
                  <Link href={`/auth/signin?returnUrl=${encodeURIComponent(pathname)}`}>Sign In</Link>
                </Button>
                <Button asChild className="glow-effect hover:scale-105 transition-all duration-300">
                  <Link href={`/auth/signup?returnUrl=${encodeURIComponent(pathname)}`}>Sign Up</Link>
                </Button>
              </>
            )
          )}
        </div>

        {/* mobile menu button */}
        <div className="flex md:hidden items-center space-x-2">
          {/* <ThemeToggle /> */}
          {!loading && user && (
            <UserIcon />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="hover:scale-105 transition-transform"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* mobile nav*/}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur-xl">
          <nav className="container px-4 py-6 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block text-sm font-medium transition-colors py-2 relative ${
                  isActive(item.href)
                    ? "text-primary font-semibold"
                    : "text-foreground hover:text-primary"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
                {isActive(item.href) && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-full"></span>
                )}
              </Link>
            ))}
            {!loading && !user && (
              <div className="flex space-x-2 pt-4">
                <Button variant="ghost" asChild className="flex-1">
                  <Link href={`/auth/signin?returnUrl=${encodeURIComponent(pathname)}`}>Sign In</Link>
                </Button>
                <Button asChild className="flex-1 glow-effect">
                  <Link href={`/auth/signup?returnUrl=${encodeURIComponent(pathname)}`}>Sign Up</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}