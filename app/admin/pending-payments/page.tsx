'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Phone, Mail, User, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface PendingPayment {
  id: string;
  user_id: string;
  order_id: string;
  plan_id: string;
  amount: number;
  currency: string;
  created_at: string;
  expires_at: string;
  status: string;
  contact_attempts: number;
  last_contact_at: string | null;
  notes: string | null;
  profiles: {
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
  };
}

export default function PendingPaymentsPage() {
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    try {
      const response = await fetch('/api/admin/pending-payments');
      const data = await response.json();

      if (data.success) {
        setPendingPayments(data.pendingPayments);
      } else {
        toast.error('Failed to fetch pending payments');
      }
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      toast.error('Failed to fetch pending payments');
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (paymentId: string, action: string, notes?: string) => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/admin/pending-payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          action,
          notes
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Payment status updated successfully');
        fetchPendingPayments(); // Refresh the list
      } else {
        toast.error('Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    } finally {
      setRefreshing(false);
    }
  };

  const formatTimeLeft = (expiresAt: string) => {
    const now = new Date().getTime();
    const expires = new Date(expiresAt).getTime();
    const timeLeft = Math.max(0, Math.floor((expires - now) / 1000));
    
    if (timeLeft <= 0) return 'Expired';
    
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount / 100); // Convert from paise to rupees
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-muted/50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading pending payments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-muted/50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Pending Payments
              </h1>
              <p className="text-muted-foreground">
                Track and follow up on incomplete payments
              </p>
            </div>
            <Button
              onClick={fetchPendingPayments}
              disabled={refreshing}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

          <div className="grid gap-6">
            {pendingPayments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Pending Payments</h3>
                  <p className="text-muted-foreground">
                    All payments have been completed or expired.
                  </p>
                </CardContent>
              </Card>
            ) : (
              pendingPayments.map((payment) => (
                <Card key={payment.id} className="border-orange-200">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5" />
                          Order: {payment.order_id}
                        </CardTitle>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="outline" className="border-orange-200 text-orange-700">
                            {payment.plan_id.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="border-blue-200 text-blue-700">
                            {formatAmount(payment.amount, payment.currency)}
                          </Badge>
                          <Badge variant="outline" className="border-red-200 text-red-700">
                            ⏰ {formatTimeLeft(payment.expires_at)}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Created: {new Date(payment.created_at).toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Contact attempts: {payment.contact_attempts}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* User Information */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Customer Information
                        </h4>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="font-medium">Name:</span> {payment.profiles.first_name} {payment.profiles.last_name}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Email:</span> {payment.profiles.email}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Phone:</span> {payment.profiles.phone || 'Not provided'}
                          </p>
                        </div>
                      </div>

                      {/* Contact Actions */}
                      <div>
                        <h4 className="font-semibold mb-3">Contact Actions</h4>
                        <div className="space-y-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => {
                              navigator.clipboard.writeText(payment.profiles.email);
                              toast.success('Email copied to clipboard');
                            }}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Copy Email
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => updatePaymentStatus(payment.id, 'contacted', 'Contacted via email')}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Mark as Contacted (Email)
                          </Button>

                          {payment.profiles.phone && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => {
                                  navigator.clipboard.writeText(payment.profiles.phone);
                                  toast.success('Phone copied to clipboard');
                                }}
                              >
                                <Phone className="h-4 w-4 mr-2" />
                                Copy Phone
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => updatePaymentStatus(payment.id, 'contacted', 'Contacted via phone')}
                              >
                                <Phone className="h-4 w-4 mr-2" />
                                Mark as Contacted (Phone)
                              </Button>
                            </>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => updatePaymentStatus(payment.id, 'completed', 'Payment completed manually')}
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Mark as Completed
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {payment.notes && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm">
                          <span className="font-medium">Notes:</span> {payment.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 