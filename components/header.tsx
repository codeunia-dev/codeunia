"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
// import { ThemeToggle } from "@/components/theme-toggle"
import { UserIcon } from "@/components/user-icon"
import { Menu, X, Shield, LogOut } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
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
  const router = useRouter()
  const { user, loading } = useAuth()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsMenuOpen(false)
    router.push("/")
    router.refresh()
  }

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
    { href: "/companies", label: "Companies" },
    { href: "/opportunities", label: "Opportunities" },
    { href: "/zenith-hall", label: "Zenith Hall" },
    { href: "/blog", label: "Blog" },
    { href: "/join", label: "Join Codeunia" },
    { href: "/contact", label: "Contact Us" },
  ]

  return (
    <>
      <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-2 sm:px-4">
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
                className={`text-sm font-medium transition-colors relative group ${isActive(item.href)
                  ? "text-primary"
                  : "text-foreground hover:text-primary"
                  }`}
              >
                {item.label}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${isActive(item.href)
                    ? "w-full"
                    : "w-0 group-hover:w-full"
                    }`}
                ></span>
              </Link>
            ))}
          </nav>

          {/* desktop auth & theme - right */}
          <div className="hidden md:flex items-center space-x-3 flex-shrink-0">
            {/* <ThemeToggle /> */}
            {loading ? (
              <div className="flex items-center space-x-3">
                {/* Skeleton for Sign In button */}
                <div className="w-[70px] h-[34px] bg-muted/50 rounded-md animate-pulse" />
                {/* Skeleton for Sign Up button */}
                <div className="w-[75px] h-[34px] bg-muted/50 rounded-md animate-pulse" />
              </div>
            ) : user ? (
              <div className="flex items-center space-x-3" key={user.id}>
                <PremiumButton user={user} />
                <UserDisplay userId={user.id} showCodeuniaId={false} />
                <UserIcon />
              </div>
            ) : (
              <>
                <Button variant="ghost" asChild className="hover:scale-105 transition-transform px-3 py-1.5 h-auto text-sm">
                  <Link href={`/auth/signin?returnUrl=${encodeURIComponent(pathname)}`}>Sign In</Link>
                </Button>
                <Button asChild className="glow-effect hover:scale-105 transition-all duration-300 px-3 py-1.5 h-auto text-sm">
                  <Link href={`/auth/signup?returnUrl=${encodeURIComponent(pathname)}`}>Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* mobile menu button */}
          <div className="flex md:hidden items-center space-x-1">
            {/* <ThemeToggle /> */}
            {!loading && user && (
              <PremiumButton user={user} compact />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`hover:scale-105 transition-all duration-200 ml-1 w-8 h-8 ${isMenuOpen ? 'bg-muted/50' : ''
                }`}
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* mobile nav - slide from right (outside header for full page overlay) */}
      {isMenuOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] md:hidden animate-in fade-in duration-200"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Side drawer */}
          <div className="mobile-menu-container fixed top-0 right-0 bottom-0 w-[280px] max-w-[85vw] bg-background border-l shadow-2xl z-[70] md:hidden animate-in slide-in-from-right duration-300">
            <nav className="flex flex-col h-full">
              {/* Header with close button */}
              <div className="flex items-center justify-between px-4 py-4 border-b">
                <span className="text-sm font-semibold">Menu</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMenuOpen(false)}
                  className="h-8 w-8 hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                {/* Navigation Links */}
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block text-sm font-medium transition-colors py-2.5 px-3 rounded-md relative ${isActive(item.href)
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
                  <div className="pt-3 mt-3 border-t border-border space-y-1">
                    {/* Dashboard Link */}
                    <Link
                      href="/protected"
                      className="flex items-center space-x-2 text-sm font-medium transition-colors py-2.5 px-3 rounded-md text-foreground hover:text-primary hover:bg-muted/50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Shield className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 text-sm font-medium transition-colors py-2.5 px-3 rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log out</span>
                    </button>
                  </div>
                )}

                {/* Auth Buttons for non-authenticated users */}
                {!loading && !user && (
                  <div className="pt-3 mt-3 border-t border-border space-y-2">
                    <Button variant="ghost" asChild className="w-full text-sm">
                      <Link href={`/auth/signin?returnUrl=${encodeURIComponent(pathname)}`}>Sign In</Link>
                    </Button>
                    <Button asChild className="w-full glow-effect text-sm">
                      <Link href={`/auth/signup?returnUrl=${encodeURIComponent(pathname)}`}>Sign Up</Link>
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  )
}