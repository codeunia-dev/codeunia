'use client';

import { CustomContent } from '@/types/resume';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface CustomSectionProps {
  content: CustomContent;
  onChange: (content: CustomContent) => void;
  sectionTitle?: string;
}

export function CustomSection({ content, onChange, sectionTitle }: CustomSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {sectionTitle || 'Custom Section'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Section Title */}
        <div className="space-y-2">
          <Label htmlFor="custom-title" className="text-sm font-medium">
            Section Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="custom-title"
            value={content.title}
            onChange={(e) =>
              onChange({
                ...content,
                title: e.target.value,
              })
            }
            placeholder="e.g., Publications, Languages, Volunteer Work"
            required
          />
          <p className="text-xs text-muted-foreground">
            Give your custom section a descriptive title
          </p>
        </div>

        {/* Section Content */}
        <div className="space-y-2">
          <Label htmlFor="custom-content" className="text-sm font-medium">
            Content <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="custom-content"
            value={content.content}
            onChange={(e) =>
              onChange({
                ...content,
                content: e.target.value,
              })
            }
            placeholder="Enter your content here. You can add multiple paragraphs, bullet points, or any text you'd like to include in this section..."
            rows={8}
            className="resize-y min-h-[200px]"
            required
          />
          <p className="text-xs text-muted-foreground">
            {content.content.length} characters
          </p>
        </div>

        {/* Formatting Tips */}
        <div className="rounded-lg bg-muted/50 p-4 space-y-2">
          <p className="text-sm font-medium">Formatting Tips:</p>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>Use line breaks to separate paragraphs</li>
            <li>Start lines with • or - for bullet points</li>
            <li>Keep content concise and relevant</li>
            <li>Use this for sections like Publications, Languages, Volunteer Work, etc.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
