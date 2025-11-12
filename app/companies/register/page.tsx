"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CompanyRegistrationForm } from "@/components/companies/CompanyRegistrationForm";
import { useAuth } from "@/lib/hooks/useAuth";
import { Building2, CheckCircle2, Clock, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CompanyRegisterPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [companyData, setCompanyData] = useState<{ name: string; email: string } | null>(null);

  const handleSuccess = (company: unknown) => {
    const companyObj = company as { name: string; email: string };
    setCompanyData(companyObj);
    setRegistrationComplete(true);
  };

  const handleError = (error: Error) => {
    console.error("Registration error:", error);
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-0 shadow-2xl bg-background/60 backdrop-blur-xl">
              <CardContent className="p-8 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show sign-in prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-0 shadow-2xl bg-background/60 backdrop-blur-xl">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mb-4 w-fit">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">Authentication Required</CardTitle>
                <CardDescription className="text-base">
                  Please sign in to register your company on CodeUnia
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <p className="text-sm text-muted-foreground">
                  You need to be signed in to register your company. This helps us track your 
                  application and provide better support throughout the verification process.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                    asChild
                  >
                    <Link href="/auth/signin">Sign In to Continue</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/auth/signup">Create Account</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show success state after registration
  if (registrationComplete && companyData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-0 shadow-2xl bg-background/60 backdrop-blur-xl">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto p-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 mb-4 w-fit">
                  <CheckCircle2 className="h-12 w-12 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold">Registration Successful!</CardTitle>
                <CardDescription className="text-base">
                  Your company registration has been submitted for review
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-4">What happens next?</h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                          1
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Email Confirmation</h4>
                        <p className="text-sm text-muted-foreground">
                          We&apos;ve sent a confirmation email to <strong>{companyData.email}</strong>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                          2
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Verification Review</h4>
                        <p className="text-sm text-muted-foreground">
                          Our team will review your application and verification documents within 48 hours
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                          3
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Get Started</h4>
                        <p className="text-sm text-muted-foreground">
                          Once approved, you&apos;ll receive access to your company dashboard to start creating events
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-500" />
                        <CardTitle className="text-base">Review Timeline</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Most applications are reviewed within 24-48 hours. We&apos;ll notify you via email once your company is verified.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-blue-500" />
                        <CardTitle className="text-base">Need Help?</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        If you have questions about your application, contact us at{" "}
                        <a href="mailto:support@codeunia.com" className="text-primary hover:underline">
                          support@codeunia.com
                        </a>
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button
                    onClick={() => router.push("/protected")}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/companies">Browse Companies</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show registration form
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="mx-auto p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mb-4 w-fit">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Register Your Company</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join CodeUnia&apos;s marketplace and start hosting hackathons and events for the developer community
            </p>
          </div>

          {/* Benefits */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">Why host events on CodeUnia?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Reach Developers</p>
                    <p className="text-xs text-muted-foreground">Connect with thousands of talented developers</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Easy Management</p>
                    <p className="text-xs text-muted-foreground">Intuitive dashboard for event and team management</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Analytics & Insights</p>
                    <p className="text-xs text-muted-foreground">Track engagement and measure event success</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Registration Form */}
          <CompanyRegistrationForm onSuccess={handleSuccess} onError={handleError} />

          {/* Help Text */}
          <Card className="border-0 shadow-lg bg-muted/50">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                By registering, you agree to our{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
