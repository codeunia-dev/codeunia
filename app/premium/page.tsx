'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Sparkles, Zap, Shield, Users, Gift } from 'lucide-react';

interface PremiumPlan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  duration: string;
  features: string[];
  popular?: boolean;
  pointsMultiplier: number;
}

const premiumPlans: PremiumPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 49,
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
    price: 199,
    originalPrice: 294, // 6 * 49
    duration: '6 months',
    pointsMultiplier: 3,
    popular: true,
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
    price: 349,
    originalPrice: 588, // 12 * 49
    duration: '12 months',
    pointsMultiplier: 3,
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
  const [processingPayment, setProcessingPayment] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      checkPremiumStatus();
    }
  }, [user]);

  const checkPremiumStatus = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_premium, premium_expires_at')
        .eq('id', user?.id)
        .single();

      if (profile?.is_premium && profile?.premium_expires_at) {
        const expiresAt = new Date(profile.premium_expires_at);
        setIsPremium(expiresAt > new Date());
      }
    } catch (error) {
      console.error('Error checking premium status:', error);
    }
  };



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

    setProcessingPayment(true);

    try {
      // Create order
      const orderResponse = await fetch('/api/premium/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          amount: plan.price * 100, // Razorpay expects amount in paise
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
          handler: async function (response: any) {
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
              } else {
                throw new Error(verifyData.error || 'Payment verification failed');
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              toast.error('Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            email: user.email,
          },
          theme: {
            color: '#6366f1',
          },
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      };

    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
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
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 py-20">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-6">
                <Crown className="h-12 w-12 text-yellow-500 mr-3" />
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Premium Membership
                </h1>
              </div>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
                Unlock exclusive features, priority support, and enhanced opportunities
              </p>
              
              {isPremium && (
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-semibold mb-8">
                  <Crown className="h-5 w-5 mr-2" />
                  You are already a Premium member!
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Enhanced Points</h3>
                <p className="text-muted-foreground">Earn 2x-3x more points on leaderboard activities</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Priority Access</h3>
                <p className="text-muted-foreground">Get early access to events and exclusive resources</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Community Perks</h3>
                <p className="text-muted-foreground">Golden username, premium badge, and mentorship</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Plan</h2>
              <p className="text-xl text-muted-foreground">Start your premium journey today</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {premiumPlans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`relative transition-all duration-300 hover:shadow-xl ${
                    plan.popular ? 'ring-2 ring-primary shadow-lg scale-105' : 'hover:scale-105'
                  } ${selectedPlan === plan.id ? 'ring-2 ring-primary' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1">
                        <Star className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-4xl font-bold">₹{plan.price}</span>
                      {plan.originalPrice && (
                        <span className="text-lg text-muted-foreground line-through">
                          ₹{plan.originalPrice}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground">{plan.duration}</p>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4">
                      {isPremium ? (
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700" 
                          disabled
                        >
                          <Crown className="h-4 w-4 mr-2" />
                          Already Premium
                        </Button>
                      ) : (
                        <Button 
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          onClick={() => handlePayment(plan.id)}
                          disabled={processingPayment}
                        >
                          {processingPayment ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Get {plan.name} Plan
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Level Up?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of developers who have already upgraded to Premium
            </p>
            {!isPremium && (
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100"
                onClick={() => handlePayment('biannual')}
                disabled={processingPayment}
              >
                <Gift className="h-5 w-5 mr-2" />
                Start Your Premium Journey
              </Button>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
} 