'use client';

import React, { useState, useEffect } from 'react';
import { useResume } from '@/contexts/ResumeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  TrendingUp,
} from 'lucide-react';
import { ResumeSuggestion } from '@/lib/services/resume-scoring';
import { cn } from '@/lib/utils';
import { ConfettiEffect } from './ConfettiEffect';

interface SuggestionPanelProps {
  className?: string;
}

export function SuggestionPanel({ className }: SuggestionPanelProps) {
  const { getDetailedScore } = useResume();
  const [expanded, setExpanded] = useState(true);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [previousScore, setPreviousScore] = useState(0);

  const scoringResult = getDetailedScore();
  const { totalScore, breakdown, suggestions, completedCategories, totalCategories } = scoringResult;

  // Trigger confetti when score reaches 100 or crosses 90 threshold
  useEffect(() => {
    if (totalScore === 100 && previousScore < 100) {
      setShowConfetti(true);
    } else if (totalScore >= 90 && previousScore < 90) {
      setShowConfetti(true);
    }
    setPreviousScore(totalScore);
  }, [totalScore, previousScore]);

  // Determine score color and status
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  const getSeverityIcon = (severity: ResumeSuggestion['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityBadgeVariant = (severity: ResumeSuggestion['severity']) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'info':
        return 'secondary';
    }
  };

  // Group suggestions by severity
  const criticalSuggestions = suggestions.filter((s) => s.severity === 'critical');
  const warningSuggestions = suggestions.filter((s) => s.severity === 'warning');
  const infoSuggestions = suggestions.filter((s) => s.severity === 'info');

  return (
    <>
      {/* Confetti Effect */}
      <ConfettiEffect 
        trigger={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />
      
      <Card className={cn('w-full', className)}>
        <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg">Resume Score</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="h-8 w-8 p-0"
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        <CardDescription>
          Track your resume completeness and get improvement suggestions
        </CardDescription>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          {/* Score Display */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn('text-4xl font-bold', getScoreColor(totalScore))}>
                  {totalScore}
                </span>
                <span className="text-2xl text-muted-foreground">/100</span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBreakdown(!showBreakdown)}
                    >
                      <Info className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    <p className="text-sm">
                      Click to see how your score is calculated across different sections
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center gap-2">
              <Progress value={totalScore} className="flex-1" />
              <Badge variant={totalScore >= 80 ? 'default' : 'secondary'}>
                {getScoreStatus(totalScore)}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">
              {completedCategories} of {totalCategories} sections completed
            </p>
          </div>

          {/* Score Breakdown */}
          {showBreakdown && (
            <div className="space-y-2 pt-2 border-t">
              <h4 className="text-sm font-semibold">Score Breakdown</h4>
              <div className="space-y-2">
                {breakdown.map((item) => (
                  <TooltipProvider key={item.category}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{item.category}</span>
                            <span className="font-medium">
                              {Math.round(item.score)}/{item.maxScore}
                            </span>
                          </div>
                          <Progress value={item.percentage} className="h-1.5" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-xs">
                        <div className="space-y-1">
                          <p className="font-semibold">{item.category}</p>
                          <p className="text-xs">{item.percentage}% complete</p>
                          {item.issues.length > 0 && (
                            <div className="mt-2 space-y-1">
                              <p className="text-xs font-semibold">Issues:</p>
                              <ul className="text-xs list-disc list-inside space-y-0.5">
                                {item.issues.map((issue, idx) => (
                                  <li key={idx}>{issue}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Improvement Suggestions</h4>
                <Badge variant="outline" className="text-xs">
                  {suggestions.length} {suggestions.length === 1 ? 'suggestion' : 'suggestions'}
                </Badge>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {/* Critical Suggestions */}
                {criticalSuggestions.length > 0 && (
                  <div className="space-y-2">
                    {criticalSuggestions.map((suggestion) => (
                      <SuggestionItem key={suggestion.id} suggestion={suggestion} />
                    ))}
                  </div>
                )}

                {/* Warning Suggestions */}
                {warningSuggestions.length > 0 && (
                  <div className="space-y-2">
                    {warningSuggestions.map((suggestion) => (
                      <SuggestionItem key={suggestion.id} suggestion={suggestion} />
                    ))}
                  </div>
                )}

                {/* Info Suggestions */}
                {infoSuggestions.length > 0 && (
                  <div className="space-y-2">
                    {infoSuggestions.map((suggestion) => (
                      <SuggestionItem key={suggestion.id} suggestion={suggestion} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No Suggestions - Perfect Score */}
          {suggestions.length === 0 && totalScore === 100 && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800 animate-fade-in">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 animate-scale-in" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  🎉 Perfect Resume!
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Your resume is complete and follows best practices
                </p>
              </div>
            </div>
          )}
        </CardContent>
      )}
      </Card>
    </>
  );
}

interface SuggestionItemProps {
  suggestion: ResumeSuggestion;
}

function SuggestionItem({ suggestion }: SuggestionItemProps) {
  const getSeverityIcon = (severity: ResumeSuggestion['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />;
    }
  };

  const getBorderColor = (severity: ResumeSuggestion['severity']) => {
    switch (severity) {
      case 'critical':
        return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20';
      case 'warning':
        return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20';
      case 'info':
        return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20';
    }
  };

  return (
    <div className={cn('flex items-start gap-2 p-2.5 rounded-lg border', getBorderColor(suggestion.severity))}>
      {getSeverityIcon(suggestion.severity)}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground">{suggestion.message}</p>
        {suggestion.category && (
          <p className="text-xs text-muted-foreground mt-0.5">{suggestion.category}</p>
        )}
      </div>
    </div>
  );
}
