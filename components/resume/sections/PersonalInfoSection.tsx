'use client';

import { PersonalInfo } from '@/types/resume';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useRef, useEffect } from 'react';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';
import { SectionContentHint } from '../ContentHint';
import { validatePersonalInfo } from '@/lib/validation/resume-validation';

interface PersonalInfoSectionProps {
  content: PersonalInfo;
  onChange: (content: PersonalInfo) => void;
  autoFocus?: boolean;
}

export function PersonalInfoSection({ content, onChange, autoFocus = false }: PersonalInfoSectionProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus first field when section is newly added
  useEffect(() => {
    if (autoFocus && firstInputRef.current) {
      const timer = setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  const handleChange = (field: keyof PersonalInfo, value: string) => {
    onChange({
      ...content,
      [field]: value,
    });

    // Validate if field has been touched
    if (touched[field]) {
      const validationErrors = validatePersonalInfo({ ...content, [field]: value });
      setErrors(validationErrors);
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev: Record<string, boolean>) => ({ ...prev, [field]: true }));
    
    // Validate on blur
    const validationErrors = validatePersonalInfo(content);
    setErrors(validationErrors);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="full_name" className="text-sm font-medium">
            Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            ref={firstInputRef}
            id="full_name"
            value={content.full_name}
            onChange={(e) => handleChange('full_name', e.target.value)}
            onBlur={() => handleBlur('full_name')}
            placeholder="John Doe"
            required
          />
        </div>

        {/* Email and Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" />
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={content.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="john.doe@example.com"
              aria-invalid={!!errors.email}
              required
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" />
              Phone <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={content.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              onBlur={() => handleBlur('phone')}
              placeholder="+1 (555) 123-4567"
              aria-invalid={!!errors.phone}
              required
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone}</p>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            Location <span className="text-destructive">*</span>
          </Label>
          <Input
            id="location"
            value={content.location}
            onChange={(e) => handleChange('location', e.target.value)}
            onBlur={() => handleBlur('location')}
            placeholder="San Francisco, CA"
            required
          />
        </div>

        {/* Website */}
        <div className="space-y-2">
          <Label htmlFor="website" className="text-sm font-medium flex items-center gap-1">
            <Globe className="h-3.5 w-3.5" />
            Website
          </Label>
          <Input
            id="website"
            type="url"
            value={content.website || ''}
            onChange={(e) => handleChange('website', e.target.value)}
            onBlur={() => handleBlur('website')}
            placeholder="https://johndoe.com"
            aria-invalid={!!errors.website}
          />
          {errors.website && (
            <p className="text-xs text-destructive">{errors.website}</p>
          )}
        </div>

        {/* LinkedIn and GitHub */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="linkedin" className="text-sm font-medium">
              LinkedIn
            </Label>
            <Input
              id="linkedin"
              value={content.linkedin || ''}
              onChange={(e) => handleChange('linkedin', e.target.value)}
              onBlur={() => handleBlur('linkedin')}
              placeholder="linkedin.com/in/johndoe"
              aria-invalid={!!errors.linkedin}
            />
            {errors.linkedin && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {errors.linkedin}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="github" className="text-sm font-medium">
              GitHub
            </Label>
            <Input
              id="github"
              value={content.github || ''}
              onChange={(e) => handleChange('github', e.target.value)}
              onBlur={() => handleBlur('github')}
              placeholder="github.com/johndoe"
              aria-invalid={!!errors.github}
            />
            {errors.github && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {errors.github}
              </p>
            )}
          </div>
        </div>

        {/* Summary/Objective */}
        <div className="space-y-2">
          <Label htmlFor="summary" className="text-sm font-medium">
            Professional Summary
          </Label>
          <Textarea
            id="summary"
            value={content.summary || ''}
            onChange={(e) => handleChange('summary', e.target.value)}
            onBlur={() => handleBlur('summary')}
            placeholder="A brief summary of your professional background, skills, and career objectives..."
            rows={4}
            className="resize-none"
          />
          <SectionContentHint
            isEmpty={!content.summary || content.summary.trim().length === 0}
            characterCount={content.summary?.length || 0}
            exampleContent="Results-driven software engineer with 5+ years of experience in full-stack development. Specialized in React, Node.js, and cloud technologies. Passionate about building scalable applications and mentoring junior developers."
            minCharacters={100}
          />
        </div>
      </CardContent>
    </Card>
  );
}
