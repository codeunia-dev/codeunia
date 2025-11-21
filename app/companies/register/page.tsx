"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CompanyRegistrationForm } from "@/components/companies/CompanyRegistrationForm";
import { useAuth } from "@/lib/hooks/useAuth";
import { Building2, CheckCircle2, Clock, Mail, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface CompanyData {
  id: string;
  name: string;
  email: string;
  legal_name?: string;
  phone?: string;
  website: string;
  industry: string;
  company_size: string;
  description: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zip: string;
  };
  socials?: {
    linkedin: string;
    twitter: string;
    facebook: string;
    instagram: string;
  };
  verification_status: string;
  verification_notes?: string;
  logo_url?: string;
}

function CompanyRegisterContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [companyData, setCompanyData] = useState<{ name: string; email: string } | null>(null);
  const [resubmitData, setResubmitData] = useState<CompanyData | null>(null);
  const [loadingResubmit, setLoadingResubmit] = useState(false);
  const [resubmitError, setResubmitError] = useState<string | null>(null);
  const resubmitId = searchParams.get("resubmit");

  const handleSuccess = (company: unknown) => {
    const companyObj = company as { name: string; email: string };
    setCompanyData(companyObj);
    setRegistrationComplete(true);
  };

  const handleError = (error: Error) => {
    console.error("Registration error:", error);
  };

  // Check if user already has a company
  useEffect(() => {
    const checkExistingCompany = async () => {
      console.log('🔍 Checking for existing company...', { user: !!user, resubmitId });

      if (!user || resubmitId) {
        console.log('⏭️ Skipping check - user:', !!user, 'resubmitId:', resubmitId);
        return; // Skip if already in resubmit mode
      }

      try {
        console.log('📡 Fetching /api/companies/me...');
        const response = await fetch('/api/companies/me');
        console.log('📡 Response status:', response.status);

        if (response.ok) {
          const result = await response.json();
          console.log('📦 API Response:', result);

          if (result.companies && result.companies.length > 0) {
            console.log('🏢 Found companies:', result.companies.length);

            // Get the company where user is owner
            const companyMember = result.companies.find((c: { role: string; company: CompanyData }) => c.role === 'owner');
            console.log('👤 Owner company member:', companyMember);

            // Check if company member exists AND the company object is not null
            if (companyMember && companyMember.company && companyMember.company.id) {
              const company = companyMember.company; // Extract the actual company data
              console.log('✅ Company found - status:', company.verification_status, 'id:', company.id);

              // If company is rejected, redirect to resubmit flow
              if (company.verification_status === 'rejected') {
                console.log('🔄 User has rejected company, redirecting to resubmit flow');
                router.push(`/companies/register?resubmit=${company.id}`);
                return;
              }

              // If company is pending or verified, show message
              if (company.verification_status === 'pending' || company.verification_status === 'verified') {
                console.log('ℹ️ User already has a company');
                toast.info('You already have a registered company');
                router.push('/protected');
                return;
              }
            } else {
              console.log('❌ No valid owner company found (company may have been deleted)');
            }
          } else {
            console.log('📭 No companies found for user');
          }
        } else {
          console.log('❌ API request failed:', response.status);
        }
      } catch (error) {
        console.error('❌ Error checking existing company:', error);
        // Continue to show registration form if check fails
      }
    };

    checkExistingCompany();
  }, [user, resubmitId, router]);

  // Fetch company data for resubmission
  useEffect(() => {
    const fetchResubmitData = async () => {
      if (!resubmitId) {
        console.log('⏭️ No resubmit ID');
        return;
      }

      if (!user) {
        console.log('⏭️ No user yet, waiting for auth...');
        return;
      }

      console.log('🔄 Fetching resubmit data for company:', resubmitId);
      setLoadingResubmit(true);
      setResubmitError(null);
      try {
        const response = await fetch(`/api/companies/resubmit/${resubmitId}`);
        console.log('📡 Response status:', response.status);
        const result = await response.json();
        console.log('📦 Response data:', result);

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch company data");
        }

        setResubmitData(result.company);
        console.log('✅ Successfully loaded company data');
      } catch (error) {
        console.error("❌ Error fetching resubmit data:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to load company data";
        setResubmitError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoadingResubmit(false);
        console.log('🏁 Fetch complete');
      }
    };

    fetchResubmitData();
  }, [resubmitId, user]);

  // Show loading state while checking authentication or loading resubmit data
  if (authLoading || loadingResubmit) {
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
                  <p className="text-muted-foreground">
                    {loadingResubmit ? "Loading company data..." : "Loading..."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show error state if resubmit data fetch failed
  if (resubmitId && resubmitError && !loadingResubmit) {
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
                <div className="mx-auto p-3 rounded-full bg-gradient-to-r from-red-500 to-orange-500 mb-4 w-fit">
                  <AlertCircle className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
                <CardDescription className="text-base">
                  {resubmitError}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <p className="text-sm text-muted-foreground">
                  You can only update companies that you own. If you believe this is an error,
                  please contact support.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                    onClick={() => router.push("/protected")}
                  >
                    Go to Dashboard
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
                <CardTitle className="text-3xl font-bold">
                  {resubmitData ? "Resubmission Successful!" : "Registration Successful!"}
                </CardTitle>
                <CardDescription className="text-base">
                  Your company {resubmitData ? "has been resubmitted" : "registration has been submitted"} for review
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
            <h1 className="text-4xl font-bold tracking-tight">
              {resubmitData ? "Update Company Information" : "Register Your Company"}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {resubmitData
                ? "Update your company information and resubmit for verification"
                : "Join Codeunia's marketplace and start hosting hackathons and events for the developer community"
              }
            </p>
          </div>

          {/* Rejection Feedback Banner */}
          {resubmitData?.verification_notes && (
            <Card className="border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <CardTitle className="text-base text-orange-900 dark:text-orange-100">
                      Verification Feedback
                    </CardTitle>
                    <CardDescription className="text-sm text-orange-800 dark:text-orange-200 mt-2 whitespace-pre-wrap">
                      {resubmitData.verification_notes}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}

          {/* Benefits */}
          {!resubmitData && (
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Why host events on Codeunia?</h3>
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
          )}

          {/* Registration Form */}
          <CompanyRegistrationForm
            onSuccess={handleSuccess}
            onError={handleError}
            initialData={resubmitData || undefined}
            companyId={resubmitData?.id}
          />

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

export default function CompanyRegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-2xl bg-background/60 backdrop-blur-xl">
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground">Loading...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <CompanyRegisterContent />
    </Suspense>
  );
}
