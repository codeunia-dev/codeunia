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
import { Check, Crown, Star, Sparkles, Zap, Shield, ArrowRight, CheckCircle } from 'lucide-react';
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
  const supabase = createClient();

  const checkPremiumStatus = useCallback(async () => {
    try {
      const { data: profile } = await supabase
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
  }, [supabase, user?.id]);

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
        <section className="py-20 md:py-32 relative overflow-hidden">
          <div
            className="absolute inset-0 [background-size:20px_20px] [background-image:linear-gradient(to_right,rgba(99,102,241,0.8)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.8)_1px,transparent_1px)] dark:[background-image:linear-gradient(to_right,rgba(139,92,246,0.8)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,92,246,0.8)_1px,transparent_1px)]"
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-purple-500/5 animate-gradient"></div>
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }}></div>
          </div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-center mb-8">
                <div className="relative mr-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-lg opacity-75 animate-pulse"></div>
                  <Crown className="w-16 h-16 text-yellow-400 relative z-10" />
                </div>
                <h1 className="text-6xl md:text-7xl font-extrabold">
                  <span className="bg-gradient-to-r from-yellow-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Premium
                  </span>{' '}
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
                    Membership
                  </span>
                </h1>
              </div>
              <p className="text-2xl md:text-3xl text-muted-foreground mb-12 leading-relaxed font-light">
                Unlock exclusive features, priority support, and enhanced opportunities
              </p>
              
              {isPremium && premiumExpiry && (
                <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full font-semibold mb-8 shadow-2xl border border-green-300/20">
                  <CheckCircle className="w-6 h-6 mr-3" />
                  <span className="text-lg">Premium Active until {formatExpiryDate(premiumExpiry)}</span>
                </div>
              )}
              
              {/* Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-400 mb-2">3x</div>
                  <div className="text-muted-foreground">Points Multiplier</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-400 mb-2">24/7</div>
                  <div className="text-muted-foreground">Priority Support</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-pink-400 mb-2">100+</div>
                  <div className="text-muted-foreground">Exclusive Resources</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Elite Membership Promotion Banner */}
        <section className="py-12 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-4">
                <Crown className="w-8 h-8 text-white mr-3 animate-pulse" />
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  Elite Membership - Not For Everyone
                </h2>
                <Crown className="w-8 h-8 text-white ml-3 animate-pulse" />
              </div>
              <p className="text-xl text-white/90 mb-6">
                Join the exclusive circle of leaders, builders, and future innovators
              </p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-white">
                <div className="flex items-center">
                  <Shield className="w-6 h-6 mr-2" />
                  <span className="font-semibold">Elite Member Status</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-6 h-6 mr-2" />
                  <span className="font-semibold">Invitation-Only Access</span>
                </div>
                <div className="flex items-center">
                  <Sparkles className="w-6 h-6 mr-2" />
                  <span className="font-semibold">Prestige & Excellence</span>
                </div>
              </div>
              <div className="mt-6 inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 text-white font-semibold">
                <ArrowRight className="w-5 h-5 mr-2" />
                Premium Members Shape the Future
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 relative overflow-hidden bg-muted/30">
          <div
            className="absolute inset-0 [background-size:20px_20px] [background-image:linear-gradient(to_right,rgba(99,102,241,0.3)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.3)_1px,transparent_1px)] dark:[background-image:linear-gradient(to_right,rgba(139,92,246,0.3)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,92,246,0.3)_1px,transparent_1px)]"
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }}></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                Choose Your <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Plan</span>
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Exclusive membership for leaders, builders, and future innovators
              </p>
              
              {/* Elite Member Count */}
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 dark:from-purple-500/30 dark:to-indigo-500/30 rounded-full border border-purple-200 dark:border-purple-700/50 backdrop-blur-sm mb-8">
                <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                <span className="text-purple-700 dark:text-purple-300 font-semibold text-sm">Exclusive Elite Membership - By Invitation Only</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto pt-8 pb-4">
              {premiumPlans.map((plan) => {
                const isProcessing = processingPlans.has(plan.id);
                const isFree = plan.id === 'free';
                
                return (
                  <div key={plan.id} className="flex">
                    <Card 
                      className={`w-full relative transition-all duration-300 group flex flex-col ${
                        isFree 
                          ? 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg' 
                          : 'bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-xl'
                      } ${
                        plan.popular 
                          ? 'ring-2 ring-yellow-400 shadow-2xl transform scale-[1.02] bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-red-900/20 border-yellow-200 dark:border-yellow-700/50' 
                          : 'hover:scale-[1.02] hover:shadow-xl'
                      } ${selectedPlan === plan.id ? 'ring-2 ring-primary shadow-lg' : ''} rounded-2xl overflow-hidden`}
                    >
                    {/* Background decoration for popular plan */}
                    {plan.popular && (
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-orange-400/5 to-red-400/5 dark:from-yellow-400/10 dark:via-orange-400/10 dark:to-red-400/10 rounded-2xl"></div>
                    )}

                    {plan.popular && (
                      <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-20">
                        <Badge className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-3 py-1 text-xs font-bold shadow-xl border-0 rounded-full animate-pulse whitespace-nowrap">
                          <Star className="w-3 h-3 mr-1.5" />
                          MOST POPULAR
                        </Badge>
                      </div>
                    )}

                    {plan.savings && (
                      <div className="absolute top-3 right-3 z-20">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-md opacity-60 animate-pulse"></div>
                          <Badge className="relative bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 text-xs font-bold shadow-lg rounded-full border border-white/50 dark:border-slate-700/50">
                            {plan.savings}
                          </Badge>
                        </div>
                      </div>
                    )}

                    <CardHeader className={`text-center pb-4 px-6 relative z-10 ${plan.popular ? 'pt-14' : plan.savings ? 'pt-12' : 'pt-8'}`}>
                      <CardTitle className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-100">
                        {plan.name}
                      </CardTitle>
                      
                      <div className="mb-4">
                        <div className="flex items-baseline justify-center gap-1 mb-2">
                          {isFree ? (
                            <span className="text-3xl font-bold text-slate-700 dark:text-slate-200">Free</span>
                          ) : (
                            <>
                              <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                                ₹{plan.price}
                              </span>
                              {plan.originalPrice && (
                                <span className="text-sm text-slate-500 line-through ml-2">
                                  ₹{plan.originalPrice}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">{plan.duration}</p>
                      </div>

                      <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 dark:from-indigo-500/30 dark:to-purple-500/30 rounded-full border border-indigo-200 dark:border-indigo-700/50 backdrop-blur-sm">
                        <Zap className="w-3 h-3 text-indigo-600 dark:text-indigo-400 mr-1" />
                        <span className="text-indigo-700 dark:text-indigo-300 font-semibold text-xs">{plan.pointsMultiplier}x Points</span>
                      </div>
                    </CardHeader>

                    <CardContent className="px-4 pb-6 relative z-10 flex flex-col flex-grow">
                      <div className="space-y-2 mb-4 flex-grow">
                        {plan.features.slice(0, 6).map((feature, index) => (
                          <div key={index} className="flex items-start gap-2 group/feature">
                            <div className="flex-shrink-0 w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mt-0.5 shadow-sm">
                              <Check className="w-2 h-2 text-white font-bold" />
                            </div>
                            <span className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed font-medium">
                              {feature}
                            </span>
                          </div>
                        ))}
                        {plan.features.length > 6 && (
                          <div className="flex items-center justify-center mt-3 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-full">
                            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                              +{plan.features.length - 6} more features
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-auto">
                        {isFree ? (
                          <Button 
                            className="w-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 font-semibold py-2.5 text-sm rounded-xl border-0 cursor-default" 
                            disabled
                          >
                            Current Plan
                          </Button>
                        ) : isPremium ? (
                          <Button 
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-2.5 text-sm rounded-xl shadow-lg border-0" 
                            disabled
                          >
                            <CheckCircle className="w-3 h-3 mr-2" />
                            Already Premium
                          </Button>
                        ) : (
                          <Button 
                            className={`w-full font-semibold py-2.5 text-sm rounded-xl shadow-lg border-0 transition-all duration-300 ${
                              plan.popular 
                                ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-white hover:shadow-xl' 
                                : 'bg-gradient-to-r from-indigo-500 via-purple-600 to-blue-600 hover:from-indigo-600 hover:via-purple-700 hover:to-blue-700 text-white hover:shadow-xl'
                            } disabled:opacity-50`}
                            onClick={() => handlePayment(plan.id)}
                            disabled={isProcessing || processingPlans.size > 0}
                          >
                            {isProcessing ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                                Processing...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3 h-3 mr-2" />
                                Get {plan.name}
                                <ArrowRight className="w-3 h-3 ml-2" />
                              </>
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
            
            {/* Trust indicators */}
            <div className="mt-16 text-center">
              <p className="text-muted-foreground mb-6">Trusted by thousands of developers</p>
              <div className="flex items-center justify-center space-x-8 opacity-60">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="text-muted-foreground text-sm">Secure Payments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                  <span className="text-muted-foreground text-sm">Instant Activation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-muted-foreground text-sm">Cancel Anytime</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
} 