"use client"

import Footer from "@/components/footer";
import Header from "@/components/header";
import type React from "react"
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { useState, Suspense, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Code2, Github, Mail, Eye, EyeOff, Check, Code, Terminal, Database, Server, Cpu, Layers } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AuthError } from "@supabase/supabase-js"
import { BackgroundGradient } from "@/components/ui/background-gradient"
import { useAuth } from "@/lib/hooks/useAuth"

function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  // Get the return URL from query parameters
  const returnUrl = searchParams.get('returnUrl') || '/'

  // Check if user is already authenticated
  useEffect(() => {
    if (user) {
      // User is already authenticated, redirect to protected page
      router.push(returnUrl);
    }
  }, [user, router, returnUrl]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_-]+$/
    if (!usernameRegex.test(formData.username)) {
      toast.error("Username can only contain letters, numbers, hyphens, and underscores")
      return
    }

    if (formData.username.length < 3 || formData.username.length > 20) {
      toast.error("Username must be between 3 and 20 characters")
      return
    }

    try {
      setIsLoading(true)
      const supabase = createClient()

      // Check username availability
      const { data: isAvailable, error: availabilityError } = await supabase.rpc('check_username_availability', {
        username_param: formData.username
      })

      if (availabilityError) {
        console.error('Username availability check error:', availabilityError)
        toast.error("Error checking username availability")
        return
      }

      if (!isAvailable) {
        toast.error("Username is already taken. Please choose a different one.")
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            username: formData.username,
          },
        },
      })

      if (error) {
        throw error
      }

      // Profile will be created automatically via database trigger
      // No need to manually create it here

      toast.success("Account created successfully! Please check your email for verification.")
      // Pass the return URL to the signin page
      router.push(`/auth/signin?returnUrl=${encodeURIComponent(returnUrl)}`)
    } catch (error) {
      if (error instanceof AuthError) {
        toast.error(error.message)
      } else {
        toast.error("An error occurred during sign up")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== "undefined"
            ? `${window.location.origin}/auth/callback?returnUrl=${encodeURIComponent(returnUrl)}`
            : undefined,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        throw error;
      }

      // Show success message while redirecting
      toast.success("Redirecting to Google...");
      
      // The OAuth flow will redirect the user to Google
      // After successful authentication, they'll be redirected back to /auth/callback
      // which will then redirect them to the returnUrl
    } catch (error) {
      console.error('Google sign in error:', error);
      toast.error("Google sign in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: typeof window !== "undefined"
            ? `${window.location.origin}/auth/callback?returnUrl=${encodeURIComponent(returnUrl)}`
            : undefined,
        },
      });
      if (error) {
        throw error;
      }
      toast.success("Redirecting to GitHub...");
    } catch (error) {
      console.error('GitHub sign in error:', error);
      toast.error("GitHub sign in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRequirements = [
    { text: "At least 8 characters", met: formData.password.length >= 8 },
    { text: "Contains uppercase letter", met: /[A-Z]/.test(formData.password) },
    { text: "Contains lowercase letter", met: /[a-z]/.test(formData.password) },
    { text: "Contains number", met: /\d/.test(formData.password) },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-background via-muted/30 to-muted/50 relative overflow-hidden">
    
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
       
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 text-primary/20"
        >
          <Code className="w-12 h-12" />
        </motion.div>
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/3 left-1/3 text-secondary/20"
        >
          <Terminal className="w-10 h-10" />
        </motion.div>
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 3, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-1/4 left-1/4 text-primary/20"
        >
          <Database className="w-8 h-8" />
        </motion.div>
        <motion.div
          animate={{
            y: [0, 15, 0],
            rotate: [0, -3, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-1/3 left-1/3 text-secondary/20"
        >
          <Server className="w-9 h-9" />
        </motion.div>

       
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 4, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 right-1/4 text-primary/20"
        >
          <Cpu className="w-7 h-7" />
        </motion.div>
        <motion.div
          animate={{
            y: [0, 10, 0],
            rotate: [0, -4, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/3 right-1/3 text-secondary/20"
        >
          <Layers className="w-8 h-8" />
        </motion.div>
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 3, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-1/4 right-1/4 text-primary/20"
        >
          <Code2 className="w-9 h-9" />
        </motion.div>
        <motion.div
          animate={{
            y: [0, 15, 0],
            rotate: [0, -3, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-1/3 right-1/3 text-secondary/20"
        >
          <Terminal className="w-8 h-8" />
        </motion.div>

       
        <motion.div
          animate={{
            y: [0, -12, 0],
            rotate: [0, 4, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 text-primary/20"
        >
          <Database className="w-7 h-7" />
        </motion.div>
        <motion.div
          animate={{
            y: [0, 12, 0],
            rotate: [0, -4, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-2/3 left-1/2 text-secondary/20"
        >
          <Server className="w-8 h-8" />
        </motion.div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-8 relative z-10 pt-16"
      >
        {/* code unia logo */}
        <motion.div 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <TypewriterEffect
            words={[
              { text: "Join" },
              { text: "Our" },
              { text: "Community" }
            ]}
            className="mt-6 text-4xl font-bold tracking-tight whitespace-nowrap"
          />
          <p className="mt-3 text-muted-foreground text-lg">Create your account and start your coding journey with us</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <BackgroundGradient>
          <Card className="shadow-2xl transition-all duration-300 relative overflow-hidden bg-background rounded-3xl">
             
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 pointer-events-none" />
              
              <CardHeader className="space-y-1 relative">
                <CardTitle className="text-2xl text-center font-bold">Sign Up</CardTitle>
                <CardDescription className="text-center text-base">Create your account to get started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 relative">
                {/* socials login */}
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="w-full hover:bg-background/80 transition-colors backdrop-blur-sm border-white/10 hover:border-primary/20"
                    onClick={handleGitHubSignIn}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent mr-2"></div>
                        Connecting...
                      </div>
                    ) : (
                      <>
                        <Github className="mr-2 h-4 w-4" />
                        GitHub
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full hover:bg-background/80 transition-colors backdrop-blur-sm border-white/10 hover:border-primary/20"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent mr-2"></div>
                        Connecting...
                      </div>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Google
                      </>
                    )}
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="bg-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background/40 backdrop-blur-sm px-2 text-muted-foreground">Or continue with email</span>
                  </div>
                </div>

                {/* sign up form of codeunia*/}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="h-11 focus:ring-2 focus:ring-primary/20 bg-background/30 backdrop-blur-sm border-white/10 hover:border-primary/20 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="h-11 focus:ring-2 focus:ring-primary/20 bg-background/30 backdrop-blur-sm border-white/10 hover:border-primary/20 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="h-11 focus:ring-2 focus:ring-primary/20 bg-background/30 backdrop-blur-sm border-white/10 hover:border-primary/20 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      placeholder="johndoe123"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      minLength={3}
                      maxLength={20}
                      pattern="[a-zA-Z0-9_-]+"
                      title="Username can only contain letters, numbers, hyphens, and underscores"
                      className="h-11 focus:ring-2 focus:ring-primary/20 bg-background/30 backdrop-blur-sm border-white/10 hover:border-primary/20 transition-colors"
                    />
                    <p className="text-xs text-muted-foreground">
                      3-20 characters, letters, numbers, hyphens, and underscores only
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="h-11 focus:ring-2 focus:ring-primary/20 bg-background/30 backdrop-blur-sm border-white/10 hover:border-primary/20 transition-colors"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>

                    {/* password req. */}
                    {formData.password && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-1.5 mt-2"
                      >
                        {passwordRequirements.map((req, index) => (
                          <motion.div 
                            key={index} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center space-x-2 text-xs"
                          >
                            <Check className={cn("h-3.5 w-3.5", req.met ? "text-green-500" : "text-muted-foreground")} />
                            <span className={cn(req.met ? "text-green-500" : "text-muted-foreground")}>{req.text}</span>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        className="h-11 focus:ring-2 focus:ring-primary/20 bg-background/30 backdrop-blur-sm border-white/10 hover:border-primary/20 transition-colors"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-red-500 mt-1"
                      >
                        Passwords do not match
                      </motion.p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <input 
                      id="terms" 
                      type="checkbox" 
                      className="h-4 w-4 rounded border-white/10 focus:ring-primary/20 bg-background/30" 
                      required 
                    />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the{" "}
                      <Link href="/terms" className="text-primary hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 text-base font-medium hover:opacity-90 transition-opacity bg-primary/90 hover:bg-primary relative overflow-hidden group"
                    disabled={isLoading}
                  >
                    <span className="relative z-10">
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  </Button>
                </form>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Already have an account? </span>
                  <Link href={`/auth/signin?returnUrl=${encodeURIComponent(returnUrl)}`} className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </div>
              </CardContent>
            </Card>
          </BackgroundGradient>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-xs text-muted-foreground"
        >
          By creating an account, you agree to receive updates about new features, events, and community activities.
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <>
      <Header />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-muted/50">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping"></div>
          </div>
        </div>
      }>
        <SignUpForm />
      </Suspense>
      <Footer />
    </>
  )
}
