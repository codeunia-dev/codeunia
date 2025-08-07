import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Clock, 
  Users, 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText,
  Target,
  Mic,
  Code,
  Presentation,
  Star,
  CreditCard,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface Registration {
  round_id: string;
  status: 'not_registered' | 'registered' | 'in_progress' | 'completed';
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open(): void;
    };
  }
}

interface Round {
  id: string;
  round_number: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  duration_minutes?: number;
  max_attempts?: number;
  passing_score?: number;
  requirements: string[];
  assessment_criteria: string[];
  round_type: 'submission' | 'evaluation' | 'live' | 'interview' | 'presentation' | 'coding' | 'custom';
  is_elimination_round: boolean;
  weightage?: number;
}

interface Test {
  id: string;
  name: string;
  description?: string;
  is_paid: boolean;
  price?: number;
  currency?: string;
}

interface RoundsDisplayProps {
  test: Test;
  userId: string;
}

const ROUND_TYPE_ICONS = {
  submission: FileText,
  evaluation: Target,
  live: Mic,
  interview: Users,
  presentation: Presentation,
  coding: Code,
  custom: Star
};

const ROUND_TYPE_COLORS = {
  submission: 'bg-blue-500',
  evaluation: 'bg-green-500',
  live: 'bg-purple-500',
  interview: 'bg-orange-500',
  presentation: 'bg-pink-500',
  coding: 'bg-red-500',
  custom: 'bg-gray-500'
};

export function RoundsDisplay({ test, userId }: RoundsDisplayProps) {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);
  const [paying, setPaying] = useState<string | null>(null);

  const fetchRoundsAndRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch rounds
      const roundsResponse = await fetch(`/api/admin/rounds?testId=${test.id}`);
      const roundsData = await roundsResponse.json();
      
      // Fetch user registrations
      const registrationsResponse = await fetch(`/api/rounds/register?userId=${userId}&testId=${test.id}`);
      const registrationsData = await registrationsResponse.json();
      
      setRounds(roundsData.rounds || []);
      setRegistrations(registrationsData.registrations || []);
    } catch (error) {
      console.error('Error fetching rounds:', error);
      toast.error('Failed to load rounds');
    } finally {
      setLoading(false);
    }
  }, [test.id, userId]);

  useEffect(() => {
    fetchRoundsAndRegistrations();
  }, [fetchRoundsAndRegistrations]);

  const getRoundStatus = (round: Round) => {
    const now = new Date();
    const startDate = new Date(round.start_date);
    const endDate = new Date(round.end_date);
    
    if (now < startDate) return 'upcoming';
    if (now >= startDate && now <= endDate) return 'active';
    if (now > endDate) return 'completed';
    return 'upcoming';
  };

  const getRegistrationStatus = (roundId: string) => {
    const registration = registrations.find(r => r.round_id === roundId);
    return registration?.status || 'not_registered';
  };

  const handleRegister = async (round: Round) => {
    try {
      setRegistering(round.id);
      
      const response = await fetch('/api/rounds/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_id: test.id,
          round_id: round.id,
          user_id: userId
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      toast.success('Successfully registered for round!');
      fetchRoundsAndRegistrations();
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to register');
    } finally {
      setRegistering(null);
    }
  };

  const handlePayment = async (round: Round) => {
    try {
      setPaying(round.id);
      
      // Create payment order
      const response = await fetch('/api/rounds/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_id: test.id,
          round_id: round.id,
          user_id: userId
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment');
      }

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: data.key,
          amount: data.amount,
          currency: data.currency,
          name: 'Codeunia',
          description: `${data.test_name} - ${data.round_name}`,
          order_id: data.orderId,
          handler: async (response: RazorpayResponse) => {
            try {
              // Verify payment
              const verifyResponse = await fetch('/api/rounds/payment', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: data.orderId,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                  test_id: test.id,
                  round_id: round.id,
                  user_id: userId
                })
              });

              const verifyData = await verifyResponse.json();
              
              if (!verifyResponse.ok) {
                throw new Error(verifyData.error || 'Payment verification failed');
              }

              toast.success('Payment successful! You are now registered for this round.');
              fetchRoundsAndRegistrations();
            } catch (error) {
              console.error('Payment verification error:', error);
              toast.error('Payment verification failed');
            }
          },
          prefill: {
            name: 'Participant',
            email: 'participant@example.com'
          },
          theme: {
            color: '#7c3aed'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      };
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process payment');
    } finally {
      setPaying(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (round: Round) => {
    const status = getRoundStatus(round);
    const registrationStatus = getRegistrationStatus(round.id);
    
    if (registrationStatus === 'completed') {
      return <Badge className="bg-green-500">Completed</Badge>;
    }
    
    if (registrationStatus === 'in_progress') {
      return <Badge className="bg-blue-500">In Progress</Badge>;
    }
    
    if (registrationStatus === 'registered') {
      return <Badge className="bg-purple-500">Registered</Badge>;
    }
    
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Live Now</Badge>;
      case 'upcoming':
        return <Badge variant="outline">Upcoming</Badge>;
      case 'completed':
        return <Badge variant="secondary">Ended</Badge>;
      default:
        return <Badge variant="outline">Scheduled</Badge>;
    }
  };

  const getActionButton = (round: Round) => {
    const status = getRoundStatus(round);
    const registrationStatus = getRegistrationStatus(round.id);
    
    if (registrationStatus === 'completed') {
      return (
        <Button variant="outline" disabled>
          <CheckCircle className="w-4 h-4 mr-2" />
          Completed
        </Button>
      );
    }
    
    if (registrationStatus === 'in_progress') {
      return (
        <Button variant="outline" disabled>
          <Loader2 className="w-4 h-4 mr-2 animate-spin mr-2" />
          In Progress
        </Button>
      );
    }
    
    if (registrationStatus === 'registered') {
      return (
        <Button variant="outline" disabled>
          <CheckCircle className="w-4 h-4 mr-2" />
          Registered
        </Button>
      );
    }
    
    if (status === 'active') {
      if (test.is_paid && test.price && test.price > 0) {
        return (
          <Button 
            onClick={() => handlePayment(round)}
            disabled={paying === round.id}
            className="bg-green-600 hover:bg-green-700"
          >
            {paying === round.id ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <CreditCard className="w-4 h-4 mr-2" />
            )}
            Pay ₹{(test.price / 100).toFixed(2)} & Register
          </Button>
        );
      } else {
        return (
          <Button 
            onClick={() => handleRegister(round)}
            disabled={registering === round.id}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {registering === round.id ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Register Now
          </Button>
        );
      }
    }
    
    if (status === 'upcoming') {
      return (
        <Button variant="outline" disabled>
          <Clock className="w-4 h-4 mr-2" />
          Coming Soon
        </Button>
      );
    }
    
    return (
      <Button variant="outline" disabled>
        <XCircle className="w-4 h-4 mr-2" />
        Ended
      </Button>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading rounds...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Event Rounds</h2>
        <p className="text-muted-foreground">
          {test.is_paid && test.price ? 
            `Paid Event - ₹${(test.price / 100).toFixed(2)}` : 
            'Free Event'
          }
        </p>
      </div>

      {rounds.length === 0 ? (
        <Card className="text-center py-8">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Rounds Available</h3>
          <p className="text-muted-foreground">
            Rounds for this event have not been configured yet.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {rounds.map((round) => {
            const IconComponent = ROUND_TYPE_ICONS[round.round_type];
            const colorClass = ROUND_TYPE_COLORS[round.round_type];
            const status = getRoundStatus(round);
            const isActive = status === 'active';
            
            return (
              <Card 
                key={round.id} 
                className={`transition-all duration-200 ${
                  isActive ? 'ring-2 ring-purple-200 bg-purple-50/20' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full ${colorClass} flex items-center justify-center text-white`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          Round {round.round_number}: {round.name}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-2">
                          {getStatusBadge(round)}
                          {round.is_elimination_round && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Elimination
                            </Badge>
                          )}
                          {round.weightage && (
                            <Badge variant="secondary" className="text-xs">
                              {round.weightage}% Weight
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {getActionButton(round)}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-muted-foreground">{round.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Start:</span>
                          <div className="font-medium">{formatDate(round.start_date)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">End:</span>
                          <div className="font-medium">{formatDate(round.end_date)}</div>
                        </div>
                        {round.duration_minutes && (
                          <div>
                            <span className="text-muted-foreground">Duration:</span>
                            <div className="font-medium">{round.duration_minutes} min</div>
                          </div>
                        )}
                        {round.max_attempts && (
                          <div>
                            <span className="text-muted-foreground">Attempts:</span>
                            <div className="font-medium">{round.max_attempts}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {round.requirements.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Requirements</h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {round.requirements.map((req, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-purple-500 mr-2">•</span>
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {round.assessment_criteria.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Assessment Criteria</h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {round.assessment_criteria.map((crit, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-green-500 mr-2">•</span>
                                {crit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Progress Summary */}
      {registrations.length > 0 && (
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6">
            <h4 className="font-medium mb-3">Your Progress</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Rounds Completed</span>
                <span>{registrations.filter(r => r.status === 'completed').length} / {rounds.length}</span>
              </div>
              <Progress 
                value={(registrations.filter(r => r.status === 'completed').length / rounds.length) * 100} 
                className="h-2"
              />
              <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                <div>
                  <div className="font-medium">Registered</div>
                  <div>{registrations.filter(r => r.status === 'registered').length}</div>
                </div>
                <div>
                  <div className="font-medium">In Progress</div>
                  <div>{registrations.filter(r => r.status === 'in_progress').length}</div>
                </div>
                <div>
                  <div className="font-medium">Completed</div>
                  <div>{registrations.filter(r => r.status === 'completed').length}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 