'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Sparkles, Zap, Shield, ArrowRight, CheckCircle, HelpCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api-fetch';

interface PremiumPlan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  duration: string;
  features: string[];
  popular?: boolean;
  pointsMultiplier: number;
  savings?: string;
}

const premiumPlans: PremiumPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    duration: 'Forever',
    pointsMultiplier: 1,
    features: [
      'Basic leaderboard access',
      'Standard events',
      'Community access',
      'Basic support'
    ]
  },
  {
    id: 'monthly',
    name: 'Monthly',
    price: 499,
    duration: '30 days',
    pointsMultiplier: 2,
    features: [
      'Golden username',
      '2x leaderboard points',
      'Free paid events',
      'Priority support',
      'Exclusive resources',
      'Premium badge'
    ]
  },
  {
    id: 'biannual',
    name: 'Bi-Annual',
    price: 2499,
    originalPrice: 2994, // 6 months × ₹499
    duration: '6 months',
    pointsMultiplier: 3,
    savings: 'Save ₹495',
    features: [
      'Golden username',
      '3x leaderboard points',
      'Free paid events',
      'Priority support',
      'Early feature access',
      'Premium badge',
      '~₹416/month',
      'Better value'
    ]
  },
  {
    id: 'yearly',
    name: 'Yearly - Most Popular',
    price: 4499,
    originalPrice: 5988, // 12 months × ₹499
    duration: '12 months',
    pointsMultiplier: 4,
    popular: true,
    savings: 'Save ₹1,489',
    features: [
      'Golden username',
      '4x leaderboard points',
      'Free paid events',
      'Personal mentorship',
      'Early feature access',
      'Elite member status',
      '~₹375/month',
      'Best value'
    ]
  }
];

export default function PremiumPage() {
  const { user, loading } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [processingPlans, setProcessingPlans] = useState<Set<string>>(new Set());
  const [premiumExpiry, setPremiumExpiry] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const getSupabaseClient = () => {
    return createClient();
  };

  const checkPremiumStatus = useCallback(async () => {
    try {
      const { data: profile } = await getSupabaseClient()
        .from('profiles')
        .select('is_premium, premium_expires_at')
        .eq('id', user?.id)
        .single();

      if (profile?.is_premium && profile?.premium_expires_at) {
        const expiresAt = new Date(profile.premium_expires_at);
        setIsPremium(expiresAt > new Date());
        if (expiresAt > new Date()) {
          setPremiumExpiry(profile.premium_expires_at);
        }
      }
    } catch (error) {
      console.error('Error checking premium status:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    // Clear any existing toasts when component mounts
    toast.dismiss();
  }, []);

  useEffect(() => {
    if (user) {
      checkPremiumStatus();
    }
    setIsInitialized(true);
  }, [user, checkPremiumStatus]);

  const handlePayment = async (planId: string) => {
    if (!user) {
      toast.error('Please sign in to purchase premium');
      return;
    }

    const plan = premiumPlans.find(p => p.id === planId);
    if (!plan) {
      toast.error('Invalid plan selected');
      return;
    }

    // Set processing state for this specific plan
    setProcessingPlans(prev => new Set(prev).add(planId));

    try {
      // Clear any existing error toasts
      toast.dismiss();
      
      // Create order
      const orderResponse = await apiFetch('/api/premium/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          amount: plan.price * 100,
          currency: 'INR',
          userId: user.id,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: orderData.key,
          amount: plan.price * 100,
          currency: 'INR',
          name: 'Codeunia',
          description: `${plan.name} Premium Plan`,
          order_id: orderData.orderId,
          handler: async function (response: { razorpay_payment_id: string; razorpay_signature: string }) {
            try {
              // Verify payment
              const verifyResponse = await apiFetch('/api/premium/verify-payment', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  orderId: orderData.orderId,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                  planId: plan.id,
                  userId: user.id,
                }),
              });

              const verifyData = await verifyResponse.json();

              if (verifyResponse.ok) {
                toast.success('Premium activated successfully! 🎉');
                setIsPremium(true);
                setSelectedPlan(null);
                await checkPremiumStatus(); // Refresh premium status
                
                // Send premium membership card email
                try {
                  const emailResponse = await apiFetch('/api/membership/send-card', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      userId: user.id,
                      email: user.email,
                      name: user.email?.split('@')[0] || 'Member',
                      membershipType: 'premium',
                      membershipId: `CU-${user.id.slice(-4)}`,
                    }),
                  });
                  
                  if (emailResponse.ok) {
                    toast.success('🎫 Premium membership card sent to your email!', {
                      description: 'Check your inbox for your golden membership card.',
                      duration: 5000,
                    });
                  }
                } catch (emailError) {
                  console.error('Error sending premium card email:', emailError);
                  // Don't show error to user as payment was successful
                }
              } else {
                console.error('Payment verification failed:', verifyData);
                console.error('Verification response status:', verifyResponse.status);
                console.error('Plan details:', { planId: plan.id, amount: plan.price * 100 });
                throw new Error(verifyData.error || 'Payment verification failed');
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              const errorMessage = error instanceof Error ? error.message : 'Payment verification failed';
              toast.error(`Payment failed: ${errorMessage}. Please try again or contact support.`);
            }
          },
          modal: {
            ondismiss: function() {
              // Remove processing state when modal is dismissed
              setProcessingPlans(prev => {
                const newSet = new Set(prev);
                newSet.delete(planId);
                return newSet;
              });
            }
          },
          prefill: {
            email: user.email,
          },
          theme: {
            color: '#6366f1',
          },
        };

        const razorpay = new (window as typeof window & { Razorpay: new (options: unknown) => { open: () => void } }).Razorpay(options);
        razorpay.open();
      };

      script.onerror = () => {
        throw new Error('Failed to load payment gateway');
      };

    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to initiate payment. Please try again.');
    } finally {
      // Remove processing state for this plan
      setProcessingPlans(prev => {
        const newSet = new Set(prev);
        newSet.delete(planId);
        return newSet;
      });
    }
  };

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading || !isInitialized) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading premium plans...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-12 sm:py-16 md:py-24 lg:py-32 relative overflow-hidden">
          <div
            className="absolute inset-0 [background-size:20px_20px] [background-image:linear-gradient(to_right,rgba(99,102,241,0.8)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.8)_1px,transparent_1px)] dark:[background-image:linear-gradient(to_right,rgba(139,92,246,0.8)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,92,246,0.8)_1px,transparent_1px)]"
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-purple-500/5 animate-gradient"></div>
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }}></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center justify-center mb-6 sm:mb-8 gap-3 sm:gap-0">
                <div className="relative sm:mr-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-lg opacity-75 animate-pulse"></div>
                  <Crown className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-yellow-400 relative z-10" />
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold">
                  <span className="bg-gradient-to-r from-yellow-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Premium
                  </span>{' '}
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
                    Membership
                  </span>
                </h1>
              </div>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-muted-foreground mb-8 sm:mb-12 leading-relaxed font-light px-4">
                Unlock exclusive features, priority support, and enhanced opportunities
              </p>
              
              {isPremium && premiumExpiry && (
                <div className="inline-flex items-center px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full font-semibold mb-6 sm:mb-8 shadow-2xl border border-green-300/20 text-sm sm:text-base md:text-lg">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 flex-shrink-0" />
                  <span className="break-words">Premium Active until {formatExpiryDate(premiumExpiry)}</span>
                </div>
              )}
              
              {/* Stats Section */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 mt-12 sm:mt-16 max-w-4xl mx-auto px-4">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400 mb-1 sm:mb-2">3x</div>
                  <div className="text-muted-foreground text-xs sm:text-sm md:text-base">Points Multiplier</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-400 mb-1 sm:mb-2">24/7</div>
                  <div className="text-muted-foreground text-xs sm:text-sm md:text-base">Priority Support</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-pink-400 mb-1 sm:mb-2">100+</div>
                  <div className="text-muted-foreground text-xs sm:text-sm md:text-base">Exclusive Resources</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Elite Membership Promotion Banner */}
       <section className="py-8 sm:py-10 md:py-12 mx-4 sm:mx-6 md:mx-8 lg:mx-12 my-8 sm:my-10 md:my-12 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-700 relative overflow-hidden rounded-3xl shadow-2xl group cursor-pointer transition-all duration-500 hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-700 animate-gradient-x rounded-3xl" style={{ backgroundSize: '200% 200%' }}></div>
          <div className="absolute inset-0 bg-black/20 rounded-3xl"></div>
          <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-3 sm:mb-4 gap-2 sm:gap-3">
                <Crown className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-yellow-400 animate-pulse flex-shrink-0" />
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                  Elite Membership - Not For Everyone
                </h2>
                <Crown className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-yellow-400 animate-pulse flex-shrink-0" />
              </div>
              <p className="text-base sm:text-lg md:text-xl text-white/90 mb-4 sm:mb-6 px-4">
                Join the exclusive circle of leaders, builders, and future innovators
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6 text-white px-4">
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                  <span className="font-semibold text-sm sm:text-base">Elite Member Status</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                  <span className="font-semibold text-sm sm:text-base">Invitation-Only Access</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                  <span className="font-semibold text-sm sm:text-base">Prestige & Excellence</span>
                </div>
              </div>
              <div className="mt-4 sm:mt-6 inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 text-white font-semibold text-sm sm:text-base">
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                <span className="whitespace-nowrap">Premium Members Shape the Future</span>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-12 sm:py-16 md:py-20 relative overflow-hidden bg-muted/30">
          <div
            className="absolute inset-0 [background-size:20px_20px] [background-image:linear-gradient(to_right,rgba(99,102,241,0.3)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.3)_1px,transparent_1px)] dark:[background-image:linear-gradient(to_right,rgba(139,92,246,0.3)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,92,246,0.3)_1px,transparent_1px)]"
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }}></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center mb-10 sm:mb-12 md:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 px-4">
                Choose Your{' '}
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]">
                  Plan
                </span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
                Exclusive membership for leaders, builders, and future innovators
              </p>
              
              {/* Elite Member Count */}
              <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 dark:from-purple-500/30 dark:to-indigo-500/30 rounded-full border border-purple-200 dark:border-purple-700/50 backdrop-blur-sm mb-6 sm:mb-8 mx-4">
                <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400 mr-2 flex-shrink-0" />
                <span className="text-purple-700 dark:text-purple-300 font-semibold text-xs sm:text-sm">Exclusive Elite Membership - By Invitation Only</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 max-w-7xl mx-auto pt-8 sm:pt-10 md:pt-12 pb-4">
              {premiumPlans.map((plan) => {
                const isProcessing = processingPlans.has(plan.id);
                const isFree = plan.id === 'free';
                
                return (
                  <div key={plan.id} className="flex">
                    <Card 
                      className={`w-full relative transition-all duration-300 group flex flex-col hover:-translate-y-1 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-2xl ${
                        plan.popular 
                          ? 'ring-2 ring-yellow-400 shadow-2xl transform scale-[1.02] border-yellow-200 dark:border-yellow-700/50' 
                          : 'hover:scale-[1.02]'
                      } ${selectedPlan === plan.id ? 'ring-2 ring-primary shadow-lg' : ''} rounded-2xl overflow-hidden`}
                    >
{/* Background decoration for popular plan */}
{plan.popular && (
  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-orange-400/5 to-red-400/5 dark:from-yellow-400/10 dark:via-orange-400/10 dark:to-red-400/10 rounded-2xl"></div>
)}

{/* Most Popular Badge */}
{plan.popular && (
  <div className="absolute top-4 left-4 z-30">
    <Badge className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-3 py-1 text-[10px] sm:text-xs font-bold shadow-2xl border-2 border-white dark:border-slate-800 rounded-full whitespace-nowrap inline-flex items-center">
      <Star className="w-3 h-3 mr-1" />
      MOST POPULAR
    </Badge>
  </div>
)}

{/* Savings Badge */}
{plan.savings && (
  <div className="absolute top-4 right-4 z-30">
    <Badge className="bg-green-500 text-white px-3 py-1 text-[10px] sm:text-xs font-bold shadow-lg rounded-full border-2 border-white dark:border-green-700 whitespace-nowrap">
      💰 {plan.savings}
    </Badge>
  </div>
)}

<CardHeader className={`text-center pb-3 sm:pb-4 px-4 sm:px-6 relative z-10 ${plan.savings || plan.popular ? 'pt-16 sm:pt-20' : 'pt-6 sm:pt-8'}`}>
  <CardTitle className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-slate-800 dark:text-slate-100">
    {plan.name}
  </CardTitle>
                      
                      <div className="mb-3 sm:mb-4">
                        <div className="flex items-baseline justify-center gap-1 mb-2">
                          {isFree ? (
                            <span className="text-2xl sm:text-3xl font-bold text-slate-700 dark:text-slate-200">Free</span>
                          ) : (
                            <>
                              <span className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
                                ₹{plan.price}
                              </span>
                              {plan.originalPrice && (
                                <span className="text-xs sm:text-sm text-slate-500 line-through ml-2">
                                  ₹{plan.originalPrice}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium">{plan.duration}</p>
                      </div>

                      <div className="inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 dark:from-indigo-500/30 dark:to-purple-500/30 rounded-full border border-indigo-200 dark:border-indigo-700/50 backdrop-blur-sm">
                        <Zap className="w-3 h-3 text-indigo-600 dark:text-indigo-400 mr-1 flex-shrink-0" />
                        <span className="text-indigo-700 dark:text-indigo-300 font-semibold text-xs whitespace-nowrap">{plan.pointsMultiplier}x Points</span>
                      </div>
                    </CardHeader>

                    <CardContent className="px-3 sm:px-4 pb-4 sm:pb-6 relative z-10 flex flex-col flex-grow">
                      <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4 flex-grow">
                        {plan.features.slice(0, 6).map((feature, index) => (
                          <div key={index} className="flex items-start gap-1.5 sm:gap-2 group/feature">
                            <div className="flex-shrink-0 w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mt-0.5 shadow-sm">
                              <Check className="w-2 h-2 text-white font-bold" />
                            </div>
                            <span className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed font-medium">
                              {feature}
                            </span>
                          </div>
                        ))}
                        {plan.features.length > 6 && (
                          <div className="flex items-center justify-center mt-2 sm:mt-3 px-2 sm:px-3 py-1 sm:py-1.5 bg-slate-100 dark:bg-slate-700 rounded-full">
                            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                              +{plan.features.length - 6} more features
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-auto">
                        {isFree ? (
                          <Button 
                            className="w-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 font-semibold py-2 sm:py-2.5 text-xs sm:text-sm rounded-xl border-0 cursor-default" 
                            disabled
                          >
                            Current Plan
                          </Button>
                        ) : isPremium ? (
                          <Button 
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-2 sm:py-2.5 text-xs sm:text-sm rounded-xl shadow-lg border-0" 
                            disabled
                          >
                            <CheckCircle className="w-3 h-3 mr-1.5 sm:mr-2 flex-shrink-0" />
                            Already Premium
                          </Button>
                        ) : (
                          <Button 
                            className={`w-full font-semibold py-3 text-sm rounded-xl shadow-lg border-0 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl active:scale-95 focus:ring-4 focus:ring-primary/50 relative overflow-hidden group/btn ${
                              plan.popular 
                                ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-white' 
                                : 'bg-gradient-to-r from-indigo-500 via-purple-600 to-blue-600 hover:from-indigo-600 hover:via-purple-700 hover:to-blue-700 text-white'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                            onClick={() => handlePayment(plan.id)}
                            disabled={isProcessing || processingPlans.size > 0}
                          >
                            {/* Shimmer effect */}
                            <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            
                            {isProcessing ? (
                              <span className="relative z-10 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 flex-shrink-0"></div>
                                <span className="whitespace-nowrap">Processing...</span>
                              </span>
                            ) : (
                              <span className="relative z-10 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span className="whitespace-nowrap">Get {plan.name.split(' - ')[0]}</span>
                                <ArrowRight className="w-4 h-4 ml-2 flex-shrink-0" />
                              </span>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  </div>
                );
              })}
            </div>
            
            {/* Enhanced Trust indicators */}
          <div className="mt-20 bg-slate-50 dark:bg-slate-900/50 py-16 rounded-2xl">
              <p className="text-muted-foreground mb-8 text-center text-lg font-semibold">
                Trusted by 2,000+ developers across India
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto px-8">
                <div className="flex flex-col items-center text-center space-y-3 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="font-bold text-lg">Secure Payments</span>
                  <span className="text-sm text-muted-foreground">256-bit SSL encryption via Razorpay</span>
                </div>
                
                <div className="flex flex-col items-center text-center space-y-3 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-bold text-lg">Instant Activation</span>
                  <span className="text-sm text-muted-foreground">Premium features unlock immediately</span>
                </div>
                
                <div className="flex flex-col items-center text-center space-y-3 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                    <Star className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <span className="font-bold text-lg">7-Day Guarantee</span>
                  <span className="text-sm text-muted-foreground">Not satisfied? Get a full refund</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">
                What Our <span className="text-primary">Premium Members</span> Say
              </h2>
              <p className="text-muted-foreground text-lg">
                Join 500+ developers who upgraded their careers
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                    RS
                  </div>
                  <div>
                    <div className="font-bold">Rahul Sharma</div>
                    <div className="text-sm text-muted-foreground">Full-Stack Developer</div>
                  </div>
                </div>
                
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <p className="text-muted-foreground italic">&ldquo;Premium membership helped me land my dream job! The 4x points and exclusive resources were game-changers.&rdquo;</p>
              </Card>

              <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center text-white font-bold text-lg">
                    PP
                  </div>
                  <div>
                    <div className="font-bold">Priya Patel</div>
                    <div className="text-sm text-muted-foreground">CS Student</div>
                  </div>
                </div>
                
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <p className="text-muted-foreground italic">&ldquo;Best investment I made for my coding journey. Priority support is incredible!&rdquo;</p>
              </Card>

              <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center text-white font-bold text-lg">
                    AM
                  </div>
                  <div>
                    <div className="font-bold">Arjun Mehta</div>
                    <div className="text-sm text-muted-foreground">Startup Founder</div>
                  </div>
                </div>
                
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <p className="text-muted-foreground italic">&ldquo;The personal mentorship alone is worth 10x the price. Highly recommended!&rdquo;</p>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-12">
              Frequently Asked <span className="text-primary">Questions</span>
            </h2>
            
            <div className="max-w-3xl mx-auto space-y-4">
              <details className="group bg-white dark:bg-slate-900 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-lg">
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    What happens when my premium expires?
                  </span>
                  <span className="text-primary group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-6 pb-6 text-muted-foreground">
                  You&apos;ll continue to have access to all content you&apos;ve saved, but won&apos;t accumulate new points at the premium multiplier rate.
                </div>
              </details>

              <details className="group bg-white dark:bg-slate-900 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-lg">
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    Can I upgrade from monthly to yearly?
                  </span>
                  <span className="text-primary group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-6 pb-6 text-muted-foreground">
                  Yes! Contact support and we&apos;ll help you upgrade with credit for remaining time.
                </div>
              </details>

              <details className="group bg-white dark:bg-slate-900 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-lg">
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    Do you offer refunds?
                  </span>
                  <span className="text-primary group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-6 pb-6 text-muted-foreground">
                  Yes, we offer a 7-day money-back guarantee. No questions asked.
                </div>
              </details>

              <details className="group bg-white dark:bg-slate-900 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-lg">
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    What payment methods do you accept?
                  </span>
                  <span className="text-primary group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-6 pb-6 text-muted-foreground">
                  We accept all major credit/debit cards, UPI, net banking, and wallets via Razorpay.
                </div>
              </details>

              <details className="group bg-white dark:bg-slate-900 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-lg">
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    Is my payment information secure?
                  </span>
                  <span className="text-primary group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-6 pb-6 text-muted-foreground">
                  Absolutely. We use Razorpay&apos;s PCI-DSS compliant payment gateway. We never store your card details.
                </div>
              </details>
            </div>
            
            <div className="text-center mt-12">
              <p className="text-muted-foreground mb-4">Still have questions?</p>
              <Button variant="outline" size="lg">
                Contact Support
              </Button>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
} 