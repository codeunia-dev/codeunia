'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import CodeuniaLogo from '@/components/codeunia-logo';
import { Send, User, Loader2, Calendar, Trophy, BookOpen, Briefcase, RotateCcw, Copy, MoreVertical, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  context?: string;
  isTyping?: boolean;
}

interface AIResponse {
  success: boolean;
  response: string;
  context: string;
  timestamp: string;
  error?: string;
}

const quickSuggestions = [
  { text: "What events are happening this month?", icon: Calendar },
  { text: "Show me active hackathons", icon: Trophy },
  { text: "What can I learn at Codeunia?", icon: BookOpen },
  { text: "Tell me about internship opportunities", icon: Briefcase },
];

export default function AIPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<{ first_name: string; last_name: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // const [isTyping, setIsTyping] = useState(false); // Unused for now
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Authentication check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin?returnUrl=' + encodeURIComponent('/ai'));
    }
  }, [user, authLoading, router]);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Load chat history from localStorage on mount (before welcome message)
  useEffect(() => {
    const savedHistory = localStorage.getItem('codeunia-ai-chat-history');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        if (Array.isArray(parsedHistory) && parsedHistory.length > 1) {
          setMessages(parsedHistory.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })));
          return; // Don't show welcome message if we loaded history
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    }
  }, []);

  // Initialize welcome message after profile is loaded (only if no history)
  useEffect(() => {
    if (profile && messages.length === 0) {
      const userName = profile.first_name || 'there';
      setMessages([
        {
          id: 'page-welcome-1',
          text: `Hello ${userName}! I'm Unio, your AI assistant powered by Codeunia and OpenRouter. I can help you with information about events, hackathons, internships, blogs, and more. What would you like to know?`,
          sender: 'ai',
          timestamp: new Date(),
          context: 'general'
        }
      ]);
    }
  }, [profile, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  const copyMessage = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const retryMessage = () => {
    if (messages.length > 1) {
      const lastUserMessage = [...messages].reverse().find(m => m.sender === 'user');
      if (lastUserMessage) {
        setInput(lastUserMessage.text);
        setMessages(prev => prev.slice(0, -1));
      }
    }
  };

  // const clearChat = () => { // Unused for now
  //   localStorage.removeItem('codeunia-ai-chat-history');
  //   setMessages([]);
  //   // The welcome message will be recreated by the useEffect
  // };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    autoResizeTextarea();
  }, [input]);

  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 1) { // Don't save just the initial message
      localStorage.setItem('codeunia-ai-chat-history', JSON.stringify(messages));
    }
  }, [messages]);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: `page-user-${Date.now()}`,
      text: textToSend,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    // setIsTyping(true); // Typing indicator disabled
    setShowSuggestions(false);

    // Don't add typing message to the messages array anymore
    // We'll handle it with a separate state

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: textToSend }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: AIResponse = await response.json();
      
      // setIsTyping(false); // Typing indicator disabled
      
      if (data.success) {
        const aiMessage: Message = {
          id: `page-ai-${Date.now() + 1}`,
          text: data.response,
          sender: 'ai',
          timestamp: new Date(),
          context: data.context
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.error || 'AI response was not successful');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // setIsTyping(false); // Typing indicator disabled
      
      const errorMessage: Message = {
        id: `page-error-${Date.now() + 1}`,
        text: 'Sorry, I\'m having trouble connecting to the AI service. Please try again later.',
        sender: 'ai',
        timestamp: new Date(),
        context: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSendClick = () => {
    sendMessage();
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  // Show loading spinner while authenticating or loading profile
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <CodeuniaLogo size="lg" showText={false} noLink={true} instanceId="ai-loading" />
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          <p className="text-gray-400">Loading Unio...</p>
        </div>
      </div>
    );
  }

  // Show auth required message if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <CodeuniaLogo size="lg" showText={false} noLink={true} instanceId="ai-auth" />
          <h2 className="text-2xl font-bold text-white mt-4">Authentication Required</h2>
          <p className="text-gray-400 mt-2">Please sign in to access Unio.</p>
          <Link href="/auth/signin?returnUrl=/ai">
            <Button className="mt-4">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Mobile-Optimized Header */}
      <div className="border-b border-gray-800 bg-gray-900 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/" className="flex items-center gap-1 sm:gap-2 hover:opacity-80 transition-opacity">
                <ArrowLeft className="w-4 h-4 text-gray-400" />
                <span className="text-xs sm:text-sm text-gray-400 hover:text-gray-300 hidden sm:inline">Back to Codeunia</span>
                <span className="text-xs text-gray-400 hover:text-gray-300 sm:hidden">Back</span>
              </Link>
              <div className="h-4 sm:h-6 w-px bg-gray-700"></div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative">
                  <CodeuniaLogo size="sm" showText={false} noLink={true} instanceId="ai-header" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-medium text-white">
                    Unio
                  </h1>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Link href="/">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-400 hover:bg-gray-800 hover:text-gray-300 rounded-lg h-8 w-8 sm:h-9 sm:w-9 p-0"
                  title="Go to Homepage"
                >
                  <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:bg-gray-800 hover:text-gray-300 rounded-lg h-8 w-8 sm:h-9 sm:w-9 p-0"
                onClick={() => window.location.reload()}
                title="Refresh Chat"
              >
                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:bg-gray-800 hover:text-gray-300 rounded-lg h-8 w-8 sm:h-9 sm:w-9 p-0"
                title="More Options"
              >
                <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Messages Container for All Screen Sizes */}
      <div className="flex-1 overflow-hidden bg-gray-900">
        <div className="max-w-6xl mx-auto h-full flex flex-col">
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 sm:py-8">
            <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
              {/* Enhanced Welcome State for Large Mobile */}
              {messages.length === 1 && (
                <div className="text-center py-8 sm:py-20">
                  <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 mb-6 sm:mb-8">
                    <CodeuniaLogo size="lg" showText={false} noLink={true} instanceId="ai-welcome" />
                  </div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-blue-400 mb-4 sm:mb-6">
                    Hello, {profile?.first_name || 'Codeunia User'}
                  </h2>
                  <p className="text-gray-400 text-lg sm:text-xl mb-8 sm:mb-12 max-w-lg sm:max-w-xl mx-auto px-4">
                    How can I help you today?
                  </p>
                </div>
              )}
              
              {messages.slice(1).map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 sm:gap-4 group ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.sender === 'ai' && (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0 mt-1">
                      <CodeuniaLogo size="sm" showText={false} noLink={true} instanceId={`ai-msg-${message.id}`} />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] sm:max-w-[85%] group transition-all duration-200 ${
                      message.sender === 'user'
                        ? 'bg-gray-700 text-white rounded-2xl rounded-br-md'
                        : 'bg-transparent text-gray-100 rounded-2xl'
                    } px-4 sm:px-5 py-3 sm:py-4 relative`}
                  >
                    {message.isTyping ? (
                      <div className="flex items-center gap-2 sm:gap-3 py-2 sm:py-3">
                        <div className="flex space-x-1.5 sm:space-x-2">
                          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {message.sender === 'ai' ? (
                          <div className="text-sm sm:text-base leading-relaxed prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                                em: ({ children }) => <em className="italic text-gray-200">{children}</em>,
                                ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                                li: ({ children }) => <li className="text-gray-200">{children}</li>,
                                code: ({ children }) => <code className="bg-gray-800 px-1.5 py-1 rounded text-sm sm:text-base">{children}</code>,
                                h1: ({ children }) => <h1 className="text-lg sm:text-xl font-semibold mb-2 text-white">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-base sm:text-lg font-semibold mb-2 text-white">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-sm sm:text-base font-semibold mb-1 text-white">{children}</h3>,
                              }}
                            >
                              {message.text}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{message.text}</p>
                        )}
                        
                        <div className="flex items-center justify-between mt-2 sm:mt-3 gap-2 sm:gap-3">
                          <span className={`text-xs ${message.sender === 'user' ? 'text-gray-300' : 'text-gray-500'}`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            {message.context && message.sender === 'ai' && (
                              <Badge variant="secondary" className={`text-xs bg-gray-800 text-gray-300 border-gray-700`}>
                                {message.context}
                              </Badge>
                            )}
                            
                            <div className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-6 w-6 p-0 rounded-lg transition-all duration-200 ${
                                  message.sender === 'user' 
                                    ? 'text-gray-300 hover:text-white hover:bg-gray-600' 
                                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                                }`}
                                onClick={() => copyMessage(message.text)}
                                title="Copy message"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              {message.sender === 'ai' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 rounded-lg transition-all duration-200 text-gray-500 hover:text-gray-300 hover:bg-gray-800"
                                  onClick={retryMessage}
                                  title="Retry response"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {message.sender === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-4 h-4 text-gray-300" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Enhanced Input Area for All Screen Sizes */}
          <div className="border-t border-gray-800 bg-gray-900 px-4 sm:px-6 py-4 sm:py-6 sticky bottom-0">
            <div className="max-w-4xl mx-auto">
              {showSuggestions && messages.length <= 1 && (
                <div className="mb-4 sm:mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {quickSuggestions.map((suggestion, index) => {
                      const Icon = suggestion.icon;
                      return (
                        <Button
                          key={index}
                          variant="outline"
                          className="text-left justify-start h-auto p-4 sm:p-5 bg-gray-800/50 hover:bg-gray-700/50 border-gray-700 rounded-xl text-gray-300 hover:text-white transition-all duration-200"
                          onClick={() => handleSuggestionClick(suggestion.text)}
                        >
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5 mr-3 sm:mr-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm sm:text-base leading-tight">{suggestion.text}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    setInput(e.target.value);
                    autoResizeTextarea();
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Unio"
                  disabled={isLoading}
                  className="resize-none min-h-[52px] sm:min-h-[60px] max-h-[140px] sm:max-h-[160px] w-full rounded-2xl sm:rounded-3xl border-2 border-gray-700 focus:border-gray-600 focus:ring-0 bg-gray-800 text-gray-100 placeholder-gray-500 px-5 sm:px-6 py-4 sm:py-5 pr-14 sm:pr-16 text-base sm:text-lg leading-relaxed transition-all duration-200 hover:border-gray-600"
                  rows={1}
                />
                
                <Button
                  onClick={handleSendClick}
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-transparent hover:bg-gray-700 text-gray-400 hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> : <Send className="w-5 h-5 sm:w-6 sm:h-6" />}
                </Button>
              </div>
              
              <div className="flex items-center justify-center mt-3 sm:mt-4 px-2">
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  Unio may display inaccurate info, including about people, so double-check its responses.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
