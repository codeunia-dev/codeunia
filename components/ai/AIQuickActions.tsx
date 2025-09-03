'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Calendar, Trophy, BookOpen, Briefcase, Sparkles, Zap, Users, Globe } from 'lucide-react';

interface QuickActionProps {
  onQuestionSelect: (question: string) => void;
}

const quickQuestions = [
  {
    category: 'Events',
    icon: Calendar,
    color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200',
    gradient: 'from-blue-500 to-blue-600',
    questions: [
      'What events are happening this month?',
      'Tell me about upcoming workshops',
      'Are there any networking events?'
    ]
  },
  {
    category: 'Hackathons',
    icon: Trophy,
    color: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200',
    gradient: 'from-purple-500 to-purple-600',
    questions: [
      'What hackathons are currently active?',
      'Tell me about hackathon themes',
      'When is the next hackathon registration?'
    ]
  },
  {
    category: 'Learning',
    icon: BookOpen,
    color: 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200',
    gradient: 'from-green-500 to-green-600',
    questions: [
      'What can I learn at Codeunia?',
      'Show me the latest blog posts',
      'Tell me about coding tutorials'
    ]
  },
  {
    category: 'Opportunities',
    icon: Briefcase,
    color: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200',
    gradient: 'from-orange-500 to-orange-600',
    questions: [
      'What internship opportunities are available?',
      'Tell me about remote opportunities',
      'How can I apply for internships?'
    ]
  }
];

export default function AIQuickActions({ onQuestionSelect }: QuickActionProps) {
  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
        <CardTitle className="flex items-center justify-center gap-3 text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          <div className="relative">
            <MessageCircle className="w-8 h-8 text-blue-600" />
            <Sparkles className="w-4 h-4 text-purple-500 absolute -top-1 -right-1" />
          </div>
          Ask Codeunia AI
        </CardTitle>
        <p className="text-gray-600 text-lg mt-2">
          Get instant answers about events, hackathons, learning opportunities, and more!
        </p>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {quickQuestions.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.category} className="space-y-4">
                <div className={`flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r ${category.gradient} text-white shadow-md`}>
                  <Icon className="w-6 h-6" />
                  <h3 className="font-bold text-xl">{category.category}</h3>
                </div>
                <div className="space-y-3">
                  {category.questions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className={`w-full text-left justify-start h-auto p-4 text-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${category.color}`}
                      onClick={() => onQuestionSelect(question)}
                    >
                      <span className="text-left leading-relaxed">{question}</span>
                    </Button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-800 text-lg">💡 Pro Tips</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <span>Ask specific questions for better answers</span>
            </div>
            <div className="flex items-start gap-2">
              <Globe className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span>The AI has access to real-time Codeunia data</span>
            </div>
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Try: &ldquo;What hackathons are happening in November?&rdquo;</span>
            </div>
            <div className="flex items-start gap-2">
              <MessageCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <span>Or: &ldquo;Show me beginner-friendly events&rdquo;</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
