'use client';

import { useResume } from '@/contexts/ResumeContext';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Type, Palette, Ruler } from 'lucide-react';

// Professional font families
const FONT_FAMILIES = [
  { value: 'Inter', label: 'Inter', category: 'Sans-serif' },
  { value: 'Roboto', label: 'Roboto', category: 'Sans-serif' },
  { value: 'Open Sans', label: 'Open Sans', category: 'Sans-serif' },
  { value: 'Lato', label: 'Lato', category: 'Sans-serif' },
  { value: 'Montserrat', label: 'Montserrat', category: 'Sans-serif' },
  { value: 'Poppins', label: 'Poppins', category: 'Sans-serif' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro', category: 'Sans-serif' },
  { value: 'Georgia', label: 'Georgia', category: 'Serif' },
  { value: 'Merriweather', label: 'Merriweather', category: 'Serif' },
  { value: 'Playfair Display', label: 'Playfair Display', category: 'Serif' },
  { value: 'Crimson Text', label: 'Crimson Text', category: 'Serif' },
  { value: 'Courier New', label: 'Courier New', category: 'Monospace' },
];

// Color preset schemes
const COLOR_PRESETS = [
  {
    name: 'Purple Professional',
    colors: {
      color_primary: '#8b5cf6',
      color_text: '#1f2937',
      color_accent: '#6366f1',
    },
  },
  {
    name: 'Blue Corporate',
    colors: {
      color_primary: '#3b82f6',
      color_text: '#1e293b',
      color_accent: '#0ea5e9',
    },
  },
  {
    name: 'Green Modern',
    colors: {
      color_primary: '#10b981',
      color_text: '#1f2937',
      color_accent: '#14b8a6',
    },
  },
  {
    name: 'Red Bold',
    colors: {
      color_primary: '#ef4444',
      color_text: '#1f2937',
      color_accent: '#f97316',
    },
  },
  {
    name: 'Gray Minimal',
    colors: {
      color_primary: '#6b7280',
      color_text: '#111827',
      color_accent: '#4b5563',
    },
  },
  {
    name: 'Teal Creative',
    colors: {
      color_primary: '#14b8a6',
      color_text: '#1f2937',
      color_accent: '#06b6d4',
    },
  },
];

export function StyleCustomizer() {
  const { resume, updateStyling } = useResume();

  if (!resume) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>No resume selected</p>
      </div>
    );
  }

  const { styling } = resume;

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Typography Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Type className="h-5 w-5 text-primary" />
            <CardTitle>Typography</CardTitle>
          </div>
          <CardDescription>Customize fonts and text sizes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Font Family */}
          <div className="space-y-2">
            <Label htmlFor="font-family">Font Family</Label>
            <Select
              value={styling.font_family}
              onValueChange={(value) => updateStyling({ font_family: value })}
            >
              <SelectTrigger id="font-family">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {/* Sans-serif fonts */}
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Sans-serif
                </div>
                {FONT_FAMILIES.filter((f) => f.category === 'Sans-serif').map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                  </SelectItem>
                ))}

                {/* Serif fonts */}
                <Separator className="my-2" />
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Serif
                </div>
                {FONT_FAMILIES.filter((f) => f.category === 'Serif').map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                  </SelectItem>
                ))}

                {/* Monospace fonts */}
                <Separator className="my-2" />
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Monospace
                </div>
                {FONT_FAMILIES.filter((f) => f.category === 'Monospace').map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Heading Font Size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="heading-size">Heading Size</Label>
              <span className="text-sm text-muted-foreground">{styling.font_size_heading}pt</span>
            </div>
            <Slider
              id="heading-size"
              min={12}
              max={24}
              step={1}
              value={[styling.font_size_heading]}
              onValueChange={([value]) => updateStyling({ font_size_heading: value })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>12pt</span>
              <span>24pt</span>
            </div>
          </div>

          {/* Body Font Size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="body-size">Body Text Size</Label>
              <span className="text-sm text-muted-foreground">{styling.font_size_body}pt</span>
            </div>
            <Slider
              id="body-size"
              min={8}
              max={14}
              step={0.5}
              value={[styling.font_size_body]}
              onValueChange={([value]) => updateStyling({ font_size_body: value })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>8pt</span>
              <span>14pt</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Color Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle>Colors</CardTitle>
          </div>
          <CardDescription>Customize color scheme</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Color Presets */}
          <div className="space-y-2">
            <Label>Color Presets</Label>
            <div className="grid grid-cols-2 gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => updateStyling(preset.colors)}
                  className="flex items-center gap-2 p-3 rounded-lg border hover:border-primary transition-colors text-left"
                >
                  <div className="flex gap-1">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: preset.colors.color_primary }}
                    />
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: preset.colors.color_accent }}
                    />
                  </div>
                  <span className="text-sm font-medium">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Primary Color */}
          <div className="space-y-2">
            <Label htmlFor="primary-color">Primary Color</Label>
            <div className="flex items-center gap-2">
              <input
                id="primary-color"
                type="color"
                value={styling.color_primary}
                onChange={(e) => updateStyling({ color_primary: e.target.value })}
                className="h-10 w-20 rounded border cursor-pointer"
              />
              <input
                type="text"
                value={styling.color_primary}
                onChange={(e) => updateStyling({ color_primary: e.target.value })}
                className="flex-1 h-10 px-3 rounded-md border bg-background text-sm"
                placeholder="#8b5cf6"
              />
            </div>
          </div>

          {/* Text Color */}
          <div className="space-y-2">
            <Label htmlFor="text-color">Text Color</Label>
            <div className="flex items-center gap-2">
              <input
                id="text-color"
                type="color"
                value={styling.color_text}
                onChange={(e) => updateStyling({ color_text: e.target.value })}
                className="h-10 w-20 rounded border cursor-pointer"
              />
              <input
                type="text"
                value={styling.color_text}
                onChange={(e) => updateStyling({ color_text: e.target.value })}
                className="flex-1 h-10 px-3 rounded-md border bg-background text-sm"
                placeholder="#1f2937"
              />
            </div>
          </div>

          {/* Accent Color */}
          <div className="space-y-2">
            <Label htmlFor="accent-color">Accent Color</Label>
            <div className="flex items-center gap-2">
              <input
                id="accent-color"
                type="color"
                value={styling.color_accent}
                onChange={(e) => updateStyling({ color_accent: e.target.value })}
                className="h-10 w-20 rounded border cursor-pointer"
              />
              <input
                type="text"
                value={styling.color_accent}
                onChange={(e) => updateStyling({ color_accent: e.target.value })}
                className="flex-1 h-10 px-3 rounded-md border bg-background text-sm"
                placeholder="#6366f1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spacing Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-primary" />
            <CardTitle>Spacing & Margins</CardTitle>
          </div>
          <CardDescription>Adjust layout spacing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Top Margin */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="margin-top">Top Margin</Label>
              <span className="text-sm text-muted-foreground">{styling.margin_top}&rdquo;</span>
            </div>
            <Slider
              id="margin-top"
              min={0.5}
              max={1.5}
              step={0.25}
              value={[styling.margin_top]}
              onValueChange={([value]) => updateStyling({ margin_top: value })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.5&rdquo;</span>
              <span>1.5&rdquo;</span>
            </div>
          </div>

          {/* Bottom Margin */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="margin-bottom">Bottom Margin</Label>
              <span className="text-sm text-muted-foreground">{styling.margin_bottom}&rdquo;</span>
            </div>
            <Slider
              id="margin-bottom"
              min={0.5}
              max={1.5}
              step={0.25}
              value={[styling.margin_bottom]}
              onValueChange={([value]) => updateStyling({ margin_bottom: value })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.5&rdquo;</span>
              <span>1.5&rdquo;</span>
            </div>
          </div>

          {/* Left Margin */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="margin-left">Left Margin</Label>
              <span className="text-sm text-muted-foreground">{styling.margin_left}&rdquo;</span>
            </div>
            <Slider
              id="margin-left"
              min={0.5}
              max={1.5}
              step={0.25}
              value={[styling.margin_left]}
              onValueChange={([value]) => updateStyling({ margin_left: value })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.5&rdquo;</span>
              <span>1.5&rdquo;</span>
            </div>
          </div>

          {/* Right Margin */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="margin-right">Right Margin</Label>
              <span className="text-sm text-muted-foreground">{styling.margin_right}&rdquo;</span>
            </div>
            <Slider
              id="margin-right"
              min={0.5}
              max={1.5}
              step={0.25}
              value={[styling.margin_right]}
              onValueChange={([value]) => updateStyling({ margin_right: value })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.5&rdquo;</span>
              <span>1.5&rdquo;</span>
            </div>
          </div>

          <Separator />

          {/* Line Height */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="line-height">Line Height</Label>
              <span className="text-sm text-muted-foreground">{styling.line_height}</span>
            </div>
            <Slider
              id="line-height"
              min={1}
              max={2}
              step={0.1}
              value={[styling.line_height]}
              onValueChange={([value]) => updateStyling({ line_height: value })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1.0</span>
              <span>2.0</span>
            </div>
          </div>

          {/* Section Spacing */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="section-spacing">Section Spacing</Label>
              <span className="text-sm text-muted-foreground">{styling.section_spacing}rem</span>
            </div>
            <Slider
              id="section-spacing"
              min={0.5}
              max={3}
              step={0.25}
              value={[styling.section_spacing]}
              onValueChange={([value]) => updateStyling({ section_spacing: value })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.5rem</span>
              <span>3rem</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
