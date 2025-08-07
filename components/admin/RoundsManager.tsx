import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Target, 
  Award, 
  Users, 
  FileText,
  Mic,
  Code,
  Presentation,
  Star,
  AlertTriangle
} from 'lucide-react';
import type { CreateTestRoundForm } from '@/types/test-management';

interface RoundsManagerProps {
  rounds: CreateTestRoundForm[];
  onRoundsChange: (rounds: CreateTestRoundForm[]) => void;
}

const ROUND_TYPES = [
  { value: 'submission', label: 'Submission', icon: FileText, description: 'Document/Project submission' },
  { value: 'evaluation', label: 'Evaluation', icon: Target, description: 'Jury/Expert evaluation' },
  { value: 'live', label: 'Live Round', icon: Mic, description: 'Live presentation/interview' },
  { value: 'interview', label: 'Interview', icon: Users, description: 'One-on-one interview' },
  { value: 'presentation', label: 'Presentation', icon: Presentation, description: 'Project presentation' },
  { value: 'coding', label: 'Coding', icon: Code, description: 'Live coding challenge' },
  { value: 'custom', label: 'Custom', icon: Star, description: 'Custom round type' }
];

export function RoundsManager({ rounds, onRoundsChange }: RoundsManagerProps) {
  const [editingRound, setEditingRound] = useState<number | null>(null);

  const addRound = () => {
    const newRound: CreateTestRoundForm = {
      round_number: rounds.length + 1,
      name: `Round ${rounds.length + 1}`,
      description: '',
      start_date: '',
      end_date: '',
      duration_minutes: 60,
      max_attempts: 1,
      passing_score: 70,
      requirements: [''],
      assessment_criteria: [''],
      round_type: 'submission',
      is_elimination_round: false,
      weightage: 100
    };
    onRoundsChange([...rounds, newRound]);
  };

  const updateRound = (index: number, field: keyof CreateTestRoundForm, value: CreateTestRoundForm[keyof CreateTestRoundForm]) => {
    const updatedRounds = [...rounds];
    updatedRounds[index] = { ...updatedRounds[index], [field]: value };
    onRoundsChange(updatedRounds);
  };

  const removeRound = (index: number) => {
    const updatedRounds = rounds.filter((_, i) => i !== index);
    // Reorder round numbers
    updatedRounds.forEach((round, i) => {
      round.round_number = i + 1;
    });
    onRoundsChange(updatedRounds);
  };

  const addRequirement = (roundIndex: number) => {
    const updatedRounds = [...rounds];
    updatedRounds[roundIndex].requirements.push('');
    onRoundsChange(updatedRounds);
  };

  const updateRequirement = (roundIndex: number, reqIndex: number, value: string) => {
    const updatedRounds = [...rounds];
    updatedRounds[roundIndex].requirements[reqIndex] = value;
    onRoundsChange(updatedRounds);
  };

  const removeRequirement = (roundIndex: number, reqIndex: number) => {
    const updatedRounds = [...rounds];
    updatedRounds[roundIndex].requirements.splice(reqIndex, 1);
    onRoundsChange(updatedRounds);
  };

  const addAssessmentCriteria = (roundIndex: number) => {
    const updatedRounds = [...rounds];
    updatedRounds[roundIndex].assessment_criteria.push('');
    onRoundsChange(updatedRounds);
  };

  const updateAssessmentCriteria = (roundIndex: number, critIndex: number, value: string) => {
    const updatedRounds = [...rounds];
    updatedRounds[roundIndex].assessment_criteria[critIndex] = value;
    onRoundsChange(updatedRounds);
  };

  const removeAssessmentCriteria = (roundIndex: number, critIndex: number) => {
    const updatedRounds = [...rounds];
    updatedRounds[roundIndex].assessment_criteria.splice(critIndex, 1);
    onRoundsChange(updatedRounds);
  };

  const getRoundTypeIcon = (type: string) => {
    const roundType = ROUND_TYPES.find(rt => rt.value === type);
    return roundType ? roundType.icon : Star;
  };

  const getRoundTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      submission: 'bg-blue-500',
      evaluation: 'bg-green-500',
      live: 'bg-purple-500',
      interview: 'bg-orange-500',
      presentation: 'bg-pink-500',
      coding: 'bg-red-500',
      custom: 'bg-gray-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Event Rounds</h3>
          <p className="text-sm text-muted-foreground">
            Define the structure and timeline of your event rounds
          </p>
        </div>
        <Button onClick={addRound} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Round
        </Button>
      </div>

      {rounds.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="text-center py-8">
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-medium mb-2">No Rounds Defined</h4>
            <p className="text-muted-foreground mb-4">
              Start by adding rounds to structure your event timeline
            </p>
            <Button onClick={addRound} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add First Round
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {rounds.map((round, index) => {
            const IconComponent = getRoundTypeIcon(round.round_type);
            const colorClass = getRoundTypeColor(round.round_type);
            
            return (
              <Card key={index} className="border-2 border-purple-100">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center text-white`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          Round {round.round_number}: {round.name}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {ROUND_TYPES.find(rt => rt.value === round.round_type)?.label}
                          </Badge>
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
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingRound(editingRound === index ? null : index)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeRound(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Basic Info */}
                    <div className="space-y-3">
                      <div>
                        <Label>Round Name</Label>
                        <Input
                          value={round.name}
                          onChange={(e) => updateRound(index, 'name', e.target.value)}
                          placeholder="e.g., Online Submission, Live Coding"
                        />
                      </div>
                      
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={round.description}
                          onChange={(e) => updateRound(index, 'description', e.target.value)}
                          placeholder="Describe what this round involves..."
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Start Date</Label>
                          <Input
                            type="datetime-local"
                            value={round.start_date}
                            onChange={(e) => updateRound(index, 'start_date', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>End Date</Label>
                          <Input
                            type="datetime-local"
                            value={round.end_date}
                            onChange={(e) => updateRound(index, 'end_date', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Configuration */}
                    <div className="space-y-3">
                      <div>
                        <Label>Round Type</Label>
                        <Select
                          value={round.round_type}
                          onValueChange={(value) => updateRound(index, 'round_type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROUND_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center space-x-2">
                                  <type.icon className="w-4 h-4" />
                                  <span>{type.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Duration (min)</Label>
                          <Input
                            type="number"
                            value={round.duration_minutes || ''}
                            onChange={(e) => updateRound(index, 'duration_minutes', parseInt(e.target.value) || undefined)}
                            placeholder="60"
                          />
                        </div>
                        <div>
                          <Label>Max Attempts</Label>
                          <Input
                            type="number"
                            value={round.max_attempts || ''}
                            onChange={(e) => updateRound(index, 'max_attempts', parseInt(e.target.value) || undefined)}
                            placeholder="1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Passing Score (%)</Label>
                          <Input
                            type="number"
                            value={round.passing_score || ''}
                            onChange={(e) => updateRound(index, 'passing_score', parseInt(e.target.value) || undefined)}
                            placeholder="70"
                          />
                        </div>
                        <div>
                          <Label>Weightage (%)</Label>
                          <Input
                            type="number"
                            value={round.weightage || ''}
                            onChange={(e) => updateRound(index, 'weightage', parseInt(e.target.value) || undefined)}
                            placeholder="100"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`elimination-${index}`}
                          checked={round.is_elimination_round}
                          onCheckedChange={(checked) => updateRound(index, 'is_elimination_round', !!checked)}
                        />
                        <Label htmlFor={`elimination-${index}`}>Elimination Round</Label>
                      </div>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Requirements & Deliverables</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addRequirement(index)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Requirement
                      </Button>
                    </div>
                    {round.requirements.map((req, reqIndex) => (
                      <div key={reqIndex} className="flex items-center space-x-2">
                        <Input
                          value={req}
                          onChange={(e) => updateRequirement(index, reqIndex, e.target.value)}
                          placeholder="e.g., Submit project proposal (PDF, max 5 pages)"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeRequirement(index, reqIndex)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Assessment Criteria */}
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Assessment Criteria</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addAssessmentCriteria(index)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Criteria
                      </Button>
                    </div>
                    {round.assessment_criteria.map((crit, critIndex) => (
                      <div key={critIndex} className="flex items-center space-x-2">
                        <Input
                          value={crit}
                          onChange={(e) => updateAssessmentCriteria(index, critIndex, e.target.value)}
                          placeholder="e.g., Innovation and creativity (30%)"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeAssessmentCriteria(index, critIndex)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {rounds.length > 0 && (
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6">
            <h4 className="font-medium mb-3">Event Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Rounds:</span>
                <div className="font-medium">{rounds.length}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Elimination Rounds:</span>
                <div className="font-medium">{rounds.filter(r => r.is_elimination_round).length}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Total Duration:</span>
                <div className="font-medium">
                  {rounds.reduce((sum, r) => sum + (r.duration_minutes || 0), 0)} min
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Total Weightage:</span>
                <div className="font-medium">
                  {rounds.reduce((sum, r) => sum + (r.weightage || 0), 0)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 