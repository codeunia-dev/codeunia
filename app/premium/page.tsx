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
      'Standard event participation',
      'Community access',
      'Basic support',
      'Public resources'
    ]
  },
  {
    id: 'monthly',
    name: 'Monthly',
    price: 69,
    duration: '30 days',
    pointsMultiplier: 2,
    features: [
      'Golden username & Codeunia ID',
      'Double leaderboard points',
      'Free access to paid events',
      'Priority support',
      'Exclusive resources',
      'Premium badge on profile'
    ]
  },
  {
    id: 'biannual',
    name: 'Biannual',
    price: 299,
    originalPrice: 500,
    duration: '6 months',
    pointsMultiplier: 3,
    popular: true,
    savings: 'Save 32%',
    features: [
      'Golden username & Codeunia ID',
      'Triple leaderboard points',
      'Free access to paid events',
      'Priority support',
      'Exclusive resources',
      'Early access to new features',
      'Premium badge on profile',
      'Save 32% vs monthly'
    ]
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 599,
    originalPrice: 1000,
    duration: '12 months',
    pointsMultiplier: 3,
    savings: 'Save 41%',
    features: [
      'Golden username & Codeunia ID',
      'Triple leaderboard points',
      'Free access to paid events',
      'Priority support',
      'Exclusive resources',
      'Early access to new features',
      'Personal mentorship session',
      'Premium badge on profile',
      'Save 41% vs monthly'
    ]
  }
];

export default function PremiumPage() {
  const { user, loading } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [processingPlans, setProcessingPlans] = useState<Set<string>>(new Set());
  const [premiumExpiry, setPremiumExpiry] = useState<string | null>(null);
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
    if (user) {
      checkPremiumStatus();
    }
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
      // Create order
      const orderResponse = await fetch('/api/premium/create-order', {
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
              const verifyResponse = await fetch('/api/premium/verify-payment', {
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
                  const emailResponse = await fetch('/api/membership/send-card', {
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

  if (loading) {
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
                  <Crown className="h-16 w-16 text-yellow-400 relative z-10" />
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
                  <CheckCircle className="h-6 w-6 mr-3" />
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
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                Start your premium journey today and unlock your full potential
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-8xl mx-auto">
              {premiumPlans.map((plan) => {
                const isProcessing = processingPlans.has(plan.id);
                const isFree = plan.id === 'free';
                
                return (
                  <Card 
                    key={plan.id} 
                    className={`relative transition-all duration-500 hover:shadow-2xl ${
                      isFree 
                        ? 'bg-background/50 border-border hover:bg-background/70' 
                        : 'bg-background/80 border-border backdrop-blur-sm'
                    } ${
                      plan.popular 
                        ? 'ring-2 ring-yellow-400 shadow-2xl scale-105 bg-gradient-to-b from-background/90 to-background/80' 
                        : 'hover:scale-105 hover:bg-background/90'
                    } ${selectedPlan === plan.id ? 'ring-2 ring-primary' : ''}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-6 py-2 text-sm font-bold shadow-xl border-0 rounded-full">
                          <Star className="h-4 w-4 mr-2" />
                          MOST POPULAR
                        </Badge>
                      </div>
                    )}

                    {plan.savings && (
                      <div className="absolute -top-3 -right-3">
                        <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-2 text-sm font-bold shadow-lg rounded-full border-2 border-background/20">
                          {plan.savings}
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="text-center pb-6 pt-8">
                      <CardTitle className="text-2xl font-bold mb-4">{plan.name}</CardTitle>
                      <div className="flex items-baseline justify-center gap-2 mb-2">
                        {isFree ? (
                          <span className="text-4xl md:text-5xl font-bold">Free</span>
                        ) : (
                          <>
                            <span className="text-4xl md:text-5xl font-bold">₹{plan.price}</span>
                            {plan.originalPrice && (
                              <span className="text-lg text-muted-foreground line-through ml-2">
                                ₹{plan.originalPrice}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      <p className="text-muted-foreground text-base">{plan.duration}</p>
                      <div className="mt-4 inline-flex items-center px-3 py-2 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full border border-primary/30">
                        <Zap className="h-3 w-3 text-primary mr-2" />
                        <span className="text-primary font-semibold text-sm">{plan.pointsMultiplier}x Points</span>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6 px-4 pb-6">
                      <div className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mt-0.5">
                              <Check className="h-2.5 w-2.5 text-white font-bold" />
                            </div>
                            <span className="text-foreground text-xs leading-relaxed">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4">
                        {isFree ? (
                          <Button 
                            className="w-full bg-muted text-muted-foreground font-bold py-3 text-sm rounded-xl border-0 cursor-default" 
                            disabled
                          >
                            Current Plan
                          </Button>
                        ) : isPremium ? (
                          <Button 
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 text-sm rounded-xl shadow-lg border-0" 
                            disabled
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Already Premium
                          </Button>
                        ) : (
                          <Button 
                            className={`w-full font-bold py-3 text-sm rounded-xl shadow-xl border-0 transition-all duration-300 ${
                              plan.popular 
                                ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-white' 
                                : 'bg-gradient-to-r from-primary via-purple-600 to-indigo-600 hover:from-primary/90 hover:via-purple-700 hover:to-indigo-700 text-white'
                            } disabled:opacity-50 hover:scale-105 hover:shadow-2xl`}
                            onClick={() => handlePayment(plan.id)}
                            disabled={isProcessing || processingPlans.size > 0}
                          >
                            {isProcessing ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Processing...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Get {plan.name}
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {/* Trust indicators */}
            <div className="mt-16 text-center">
              <p className="text-muted-foreground mb-6">Trusted by thousands of developers</p>
              <div className="flex items-center justify-center space-x-8 opacity-60">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="text-muted-foreground text-sm">Secure Payments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                  <span className="text-muted-foreground text-sm">Instant Activation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
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