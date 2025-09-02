'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CodeuniaLogo from '@/components/codeunia-logo';
import { MessageCircle, Send, User, Loader2, X, Minimize2, Maximize2, Copy, RotateCcw, Sparkles, Zap, Calendar, Trophy } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
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
  { text: "Tell me about events", icon: Calendar },
  { text: "Show me hackathons", icon: Trophy },
  { text: "What's new at Codeunia?", icon: Sparkles },
  { text: "Help me get started", icon: Zap },
];

export default function AIChat() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<{ first_name: string; last_name: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch user profile when authenticated
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfileLoading(false);
        return;
      }
      
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

  // Initialize welcome message after profile is loaded
  useEffect(() => {
    if (user && profile && messages.length === 0) {
      const userName = profile.first_name || 'there';
      setMessages([
        {
          id: '1',
          text: `Hello ${userName}! I'm Unio, your AI assistant powered by Codeunia and OpenRouter. I can help you with information about events, hackathons, internships, blogs, and more. What would you like to know?`,
          sender: 'ai',
          timestamp: new Date(),
          context: 'general'
        }
      ]);
    }
  }, [user, profile, messages.length]);

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
        // Remove the last AI response to retry
        setMessages(prev => prev.slice(0, -1));
      }
    }
  };

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

  // Load chat history from localStorage on mount
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
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    }
  }, []);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      text: '',
      sender: 'ai',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await fetch('/api/ai/chat', {
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
      
      // Remove typing indicator
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      
      if (data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
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
      // Remove typing indicator
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
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

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="relative">
          <Button
            onClick={() => setIsOpen(true)}
            className="relative rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out ${
      isMinimized ? 'w-72 sm:w-80 h-16' : 'w-[calc(100vw-2rem)] max-w-sm sm:max-w-md h-[calc(100vh-8rem)] max-h-[600px] sm:w-80 sm:h-[500px]'
    }`}>
      <Card className="w-full h-full shadow-2xl border-0 bg-gray-900 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg px-3 sm:px-6">
          <CardTitle className="text-sm sm:text-lg font-semibold flex items-center gap-2">
            <div className="relative">
              <CodeuniaLogo size="sm" showText={false} noLink={true} instanceId="chat-header" />
            </div>
            <span className="hidden sm:inline">Unio Assistant</span>
            <span className="sm:hidden">Unio</span>
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20 p-1 h-7 w-7 sm:h-8 sm:w-8 transition-colors"
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-1 h-7 w-7 sm:h-8 sm:w-8 transition-colors"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className={`flex flex-col p-0 bg-gray-900 ${isMinimized ? 'hidden' : 'h-[calc(100%-4rem)]'}`}>
          {/* Authentication Check */}
          {authLoading || profileLoading ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                <p className="text-sm text-gray-400">Loading...</p>
              </div>
            </div>
          ) : !user ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <CodeuniaLogo size="md" showText={false} noLink={true} instanceId="chat-auth" />
                <h3 className="text-lg font-semibold text-white mt-3">Sign in Required</h3>
                <p className="text-sm text-gray-400 mt-2 mb-4">Please sign in to chat with Unio</p>
                <Link href="/auth/signin?returnUrl=/ai" className="inline-block">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.sender === 'ai' && (
                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                      <CodeuniaLogo size="sm" showText={false} noLink={true} instanceId={`chat-msg-${message.id}`} />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 group relative ${
                      message.sender === 'user'
                        ? 'bg-gray-700 text-white rounded-br-md'
                        : 'bg-transparent text-gray-100'
                    }`}
                  >
                    {message.isTyping ? (
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {message.sender === 'ai' ? (
                          <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                                em: ({ children }) => <em className="italic text-gray-200">{children}</em>,
                                ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                                li: ({ children }) => <li className="text-gray-200">{children}</li>,
                                code: ({ children }) => <code className="bg-gray-800 px-1 py-0.5 rounded text-xs">{children}</code>,
                                h1: ({ children }) => <h1 className="text-base font-semibold mb-2 text-white">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-sm font-semibold mb-2 text-white">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-xs font-semibold mb-1 text-white">{children}</h3>,
                              }}
                            >
                              {message.text}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                        )}
                        <div className="flex items-center justify-between mt-2 gap-2">
                          <span className={`text-xs opacity-70 ${message.sender === 'user' ? 'text-gray-300' : 'text-gray-500'}`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <div className="flex items-center gap-1">
                            {message.context && message.sender === 'ai' && (
                              <Badge variant="secondary" className="text-xs bg-gray-800 text-gray-300 border-gray-700">
                                {message.context}
                              </Badge>
                            )}
                            {/* Message Actions */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-6 w-6 p-0 transition-colors ${
                                  message.sender === 'user' 
                                    ? 'hover:bg-gray-600 text-gray-300' 
                                    : 'hover:bg-gray-800 text-gray-500'
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
                                  className="h-6 w-6 p-0 hover:bg-gray-800 text-gray-500"
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
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area - Always visible when chat is open and not minimized */}
          <div className="border-t border-gray-800 bg-gray-900">
            {/* Mobile-Optimized Quick Suggestions */}
            {showSuggestions && messages.length <= 1 && (
              <div className="p-2 sm:p-3 border-b border-gray-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                  {quickSuggestions.map((suggestion, index) => {
                    const Icon = suggestion.icon;
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 sm:h-8 bg-gray-800/50 hover:bg-gray-700/50 border-gray-700 text-gray-300 hover:text-white transition-all duration-200 justify-start px-2 sm:px-3"
                        onClick={() => handleSuggestionClick(suggestion.text)}
                      >
                        <Icon className="w-3 h-3 mr-1 sm:mr-1.5 flex-shrink-0" />
                        <span className="truncate text-xs">{suggestion.text}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Mobile-Optimized Input Field */}
            <div className="p-3 sm:p-4">
              <div className="flex gap-2 items-end">
                <div className="flex-1 relative">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                      setInput(e.target.value);
                      autoResizeTextarea();
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask Unio..."
                    disabled={isLoading}
                    className="resize-none min-h-[36px] sm:min-h-[40px] max-h-[100px] sm:max-h-[120px] rounded-lg sm:rounded-xl border-2 border-gray-700 focus:border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-500 transition-colors pr-10 sm:pr-12 text-sm px-3 py-2 sm:px-4 sm:py-2"
                    rows={1}
                    autoComplete="off"
                  />
                  {input.trim() && (
                    <div className="absolute right-1.5 sm:right-2 top-1.5 sm:top-2">
                      <Button
                        onClick={handleSendClick}
                        disabled={isLoading || !input.trim()}
                        size="icon"
                        className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-transparent hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-all duration-200"
                      >
                        {isLoading ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> : <Send className="w-3 h-3 sm:w-4 sm:h-4" />}
                      </Button>
                    </div>
                  )}
                </div>
                {!input.trim() && (
                  <Button
                    onClick={handleSendClick}
                    disabled={isLoading}
                    size="icon"
                    className="h-10 w-10 rounded-xl bg-transparent hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-all duration-200"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              {/* Input Help Text */}
              <div className="text-xs text-gray-500 mt-2 flex items-center justify-between">
                <span>Press Enter to send, Shift+Enter for new line</span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Unio
                </span>
              </div>
            </div>
          </div>
          </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}