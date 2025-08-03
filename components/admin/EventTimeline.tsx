import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Award, Users, Play, CheckCircle, XCircle } from "lucide-react";

interface EventTimelineProps {
  test: {
    event_start?: string;
    event_end?: string;
    registration_start?: string;
    registration_end?: string;
    test_start?: string;
    test_end?: string;
    round_two_start?: string;
    round_two_end?: string;
    certificate_start?: string;
    certificate_end?: string;
    is_paid?: boolean;
    price?: number;
  };
}

export function EventTimeline({ test }: EventTimelineProps) {
  const now = new Date();
  
  const getPhaseStatus = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return 'not-scheduled';
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'active';
    if (now > end) return 'completed';
    return 'not-scheduled';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="h-4 w-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'upcoming':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Live</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'upcoming':
        return <Badge variant="outline">Upcoming</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-400">Not Scheduled</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const phases = [
    {
      title: 'Event Live',
      description: 'Event goes live and becomes visible',
      startDate: test.event_start,
      endDate: test.event_end,
      icon: <Calendar className="h-5 w-5" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Registration Open',
      description: 'Users can register for the test',
      startDate: test.registration_start,
      endDate: test.registration_end,
      icon: <Users className="h-5 w-5" />,
      color: 'bg-green-500'
    },
    {
      title: 'Test Period',
      description: 'Main test is active',
      startDate: test.test_start,
      endDate: test.test_end,
      icon: <Play className="h-5 w-5" />,
      color: 'bg-purple-500'
    },
    {
      title: 'Round 2',
      description: 'Second round (if applicable)',
      startDate: test.round_two_start,
      endDate: test.round_two_end,
      icon: <Award className="h-5 w-5" />,
      color: 'bg-orange-500'
    },
    {
      title: 'Certificate Distribution',
      description: 'Certificates are distributed',
      startDate: test.certificate_start,
      endDate: test.certificate_end,
      icon: <Award className="h-5 w-5" />,
      color: 'bg-pink-500'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Event Timeline
          {test.is_paid && (
            <Badge className="ml-auto bg-green-500">
              Paid Test - ₹{(test.price || 0) / 100}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {phases.map((phase, index) => {
            const status = getPhaseStatus(phase.startDate, phase.endDate);
            const isRound2 = phase.title === 'Round 2';
            
            // Skip Round 2 if not scheduled
            if (isRound2 && status === 'not-scheduled') {
              return null;
            }

            return (
              <div key={index} className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full ${phase.color} flex items-center justify-center text-white`}>
                  {phase.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">
                      {phase.title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(status)}
                      {getStatusBadge(status)}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 mt-1">
                    {phase.description}
                  </p>
                  
                  <div className="mt-2 text-xs text-gray-400">
                    <div>Start: {formatDate(phase.startDate)}</div>
                    <div>End: {formatDate(phase.endDate)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Phase Indicator */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h5 className="text-sm font-medium mb-2">Current Phase:</h5>
          {(() => {
            const currentPhase = phases.find(phase => {
              const status = getPhaseStatus(phase.startDate, phase.endDate);
              return status === 'active';
            });

            if (currentPhase) {
              return (
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${currentPhase.color}`}></div>
                  <span className="text-sm font-medium">{currentPhase.title}</span>
                  <Badge className="bg-green-500">Live Now</Badge>
                </div>
              );
            }

            const nextPhase = phases.find(phase => {
              const status = getPhaseStatus(phase.startDate, phase.endDate);
              return status === 'upcoming';
            });

            if (nextPhase) {
              return (
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${nextPhase.color}`}></div>
                  <span className="text-sm font-medium">Next: {nextPhase.title}</span>
                  <Badge variant="outline">Upcoming</Badge>
                </div>
              );
            }

            return (
              <div className="text-sm text-gray-500">
                No active phases at the moment
              </div>
            );
          })()}
        </div>
      </CardContent>
    </Card>
  );
} 