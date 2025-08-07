'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { toast } from 'sonner';
import { 
  Award, 
  Upload, 
  Eye, 
  Send, 
  Download, 
  Settings, 
  FileText, 
  Calendar,
  Trophy,
  Loader2,
  Save
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export interface CertificateUserData {
  name: string;
  email: string;
  score?: number;
  rank?: number;
  testName?: string;
  eventName?: string;
  hackathonName?: string;
  cert_id: string;
  issued_date?: string;
  category?: string;
  duration?: string;
  organization?: string;
  institution?: string;
  department?: string;
  experience_level?: string;
  total_registrations?: number;
  organizer?: string;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  template_url: string;
  placeholders: string[];
  is_active: boolean;
  created_at: string;
}

interface PlaceholderConfig {
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  maxWidth?: number;
  textAlign?: 'left' | 'center' | 'right';
}

interface CertificateGeneratorProps {
  context: 'test' | 'event' | 'hackathon';
  userData: CertificateUserData;
  templateId?: string;
  onComplete?: (certificateUrl: string) => void;
  onError?: (error: string) => void;
  showPreview?: boolean;
  autoGenerate?: boolean;
  isBulkMode?: boolean;
  selectedParticipants?: CertificateUserData[];
}

export function CertificateGenerator({
  context,
  userData,
  templateId,
  onComplete,
  onError,
  showPreview = true,
  autoGenerate = false,
  isBulkMode = false,
  selectedParticipants = []
}: CertificateGeneratorProps) {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);
  // const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showPlaceholderConfig, setShowPlaceholderConfig] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: '',
    description: '',
    placeholders: ['{name}', '{email}', '{event_name}', '{score}', '{date}', '{cert_id}', '{qr_code}', '{organizer}', '{total_registrations}', '{duration}', '{institution}', '{department}', '{experience_level}', '{rank}']
  });
  const [placeholderConfigs, setPlaceholderConfigs] = useState<Record<string, PlaceholderConfig>>({});
  const [customMessage, setCustomMessage] = useState('');
  // const [generatedCertificates, setGeneratedCertificates] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Default placeholder configurations
  const defaultPlaceholderConfigs: Record<string, PlaceholderConfig> = useMemo(() => ({
    '{name}': { x: 400, y: 300, fontSize: 48, fontFamily: 'Arial', color: '#000000', textAlign: 'center' },
    '{email}': { x: 400, y: 350, fontSize: 24, fontFamily: 'Arial', color: '#666666', textAlign: 'center' },
    '{event_name}': { x: 400, y: 400, fontSize: 36, fontFamily: 'Arial', color: '#000000', textAlign: 'center' },
    '{score}': { x: 400, y: 450, fontSize: 36, fontFamily: 'Arial', color: '#000000', textAlign: 'center' },
    '{date}': { x: 400, y: 500, fontSize: 24, fontFamily: 'Arial', color: '#666666', textAlign: 'center' },
    '{cert_id}': { x: 400, y: 550, fontSize: 18, fontFamily: 'Courier', color: '#999999', textAlign: 'center' },
    '{qr_code}': { x: 700, y: 500, fontSize: 0, fontFamily: 'Arial', color: '#000000' },
    '{organizer}': { x: 400, y: 600, fontSize: 20, fontFamily: 'Arial', color: '#666666', textAlign: 'center' },
    '{total_registrations}': { x: 400, y: 650, fontSize: 20, fontFamily: 'Arial', color: '#666666', textAlign: 'center' },
    '{duration}': { x: 400, y: 700, fontSize: 20, fontFamily: 'Arial', color: '#666666', textAlign: 'center' },
    '{institution}': { x: 400, y: 750, fontSize: 20, fontFamily: 'Arial', color: '#666666', textAlign: 'center' },
    '{department}': { x: 400, y: 800, fontSize: 20, fontFamily: 'Arial', color: '#666666', textAlign: 'center' },
    '{experience_level}': { x: 400, y: 850, fontSize: 20, fontFamily: 'Arial', color: '#666666', textAlign: 'center' },
    '{rank}': { x: 400, y: 900, fontSize: 20, fontFamily: 'Arial', color: '#666666', textAlign: 'center' }
  }), []);

  const fetchTemplates = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('certificate_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to fetch templates');
    }
  }, [supabase]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    if (templateId && templates.length > 0) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setSelectedTemplate(template);
      }
    }
  }, [templateId, templates]);

  const generateQRCode = useCallback(async (certId: string): Promise<string> => {
    try {
      const verificationUrl = `${window.location.origin}/verify/cert/${certId}`;
      
      // Generate QR code using a QR code library or service
      // For now, we'll use a placeholder
      const qrCodeDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verificationUrl)}`;
      
      // Upload QR code via API route
      const response = await fetch('/api/certificates/upload-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certId,
          qrCodeUrl: qrCodeDataUrl
        })
      });

      if (!response.ok) {
        throw new Error('Failed to upload QR code');
      }

      const { qrCodeUrl } = await response.json();
      return qrCodeUrl;
    } catch (error) {
      console.error('QR code generation error:', error);
      return '';
    }
  }, []);

  const generateCertificate = useCallback(async (participantData: CertificateUserData = userData): Promise<{ certificateUrl: string; qrCodeUrl: string }> => {
    if (!selectedTemplate) {
      throw new Error('No template selected');
    }

    // Generate QR code
    const qrCodeUrl = await generateQRCode(participantData.cert_id);

    // Create certificate with placeholders replaced
    const certificateData = {
      templateUrl: selectedTemplate.template_url,
      placeholders: {
        '{name}': participantData.name,
        '{email}': participantData.email,
        '{event_name}': participantData.eventName || participantData.testName || participantData.hackathonName || '',
        '{score}': participantData.score?.toString() || 'N/A',
        '{date}': participantData.issued_date || new Date().toLocaleDateString(),
        '{cert_id}': participantData.cert_id,
        '{qr_code}': qrCodeUrl,
        '{organizer}': participantData.organizer || 'CodeUnia',
        '{total_registrations}': participantData.total_registrations?.toString() || '100+',
        '{duration}': participantData.duration || '60 minutes',
        '{institution}': participantData.institution || 'N/A',
        '{department}': participantData.department || 'N/A',
        '{experience_level}': participantData.experience_level || 'N/A',
        '{rank}': participantData.rank?.toString() || 'N/A'
      },
      configs: { ...defaultPlaceholderConfigs, ...placeholderConfigs }
    };

    // Call API to generate certificate
    const response = await fetch('/api/certificates/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(certificateData)
    });

    if (!response.ok) {
      throw new Error('Failed to generate certificate');
    }

    const { certificateUrl } = await response.json();
    return { certificateUrl, qrCodeUrl };
  }, [selectedTemplate, userData, defaultPlaceholderConfigs, placeholderConfigs, generateQRCode]);

  const handleGenerateCertificate = useCallback(async () => {
    if (!selectedTemplate) {
      toast.error('Please select a certificate template');
      return;
    }

    setIsGenerating(true);
    try {
      if (isBulkMode && selectedParticipants.length > 0) {
        const certificateUrls: string[] = [];
        
        for (const participant of selectedParticipants) {
          const { certificateUrl } = await generateCertificate(participant);
          certificateUrls.push(certificateUrl);
          
          // Save certificate record to database
          const { error: saveError } = await supabase
            .from('certificates')
            .insert({
              cert_id: participant.cert_id,
              template_id: selectedTemplate.id,
              certificate_url: certificateUrl,
              issued_at: new Date().toISOString(),
              is_valid: true,
              sent_via_email: false
            });

          if (saveError) {
            console.error('Error saving certificate:', saveError);
          }
          
          // Small delay to avoid overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // setGeneratedCertificates(certificateUrls);
        toast.success(`Generated ${certificateUrls.length} certificates successfully!`);
        onComplete?.(certificateUrls[0]); // Return first certificate URL
      } else {
        const { certificateUrl, qrCodeUrl } = await generateCertificate();
        
        setCertificateUrl(certificateUrl);
        // setQrCodeUrl(qrCodeUrl);
        setPreviewUrl(certificateUrl);

        // Save certificate record to database
        const { error: saveError } = await supabase
          .from('certificates')
          .insert({
            cert_id: userData.cert_id,
            template_id: selectedTemplate.id,
            certificate_url: certificateUrl,
            qr_code_url: qrCodeUrl,
            issued_at: new Date().toISOString(),
            is_valid: true,
            sent_via_email: false
          });

        if (saveError) {
          console.error('Error saving certificate:', saveError);
        }

        toast.success('Certificate generated successfully!');
        onComplete?.(certificateUrl);
      }
    } catch (error) {
      console.error('Certificate generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate certificate';
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedTemplate, isBulkMode, selectedParticipants, generateCertificate, supabase, userData, onComplete, onError]);

  useEffect(() => {
    if (autoGenerate && selectedTemplate && userData) {
      handleGenerateCertificate();
    }
  }, [autoGenerate, selectedTemplate, userData, handleGenerateCertificate]);


  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', uploadForm.name);
      formData.append('placeholders', JSON.stringify(uploadForm.placeholders));

      const response = await fetch('/api/certificates/upload-template', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const { template } = await response.json();

      toast.success('Template uploaded successfully!');
      setShowUploadDialog(false);
      setUploadForm({ name: '', description: '', placeholders: ['{name}', '{email}', '{event_name}', '{score}', '{date}', '{cert_id}', '{qr_code}', '{organizer}', '{total_registrations}', '{duration}', '{institution}', '{department}', '{experience_level}', '{rank}'] });
      fetchTemplates();
      setSelectedTemplate(template);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload template');
    } finally {
      setIsUploading(false);
    }
  };




  const handleSendEmail = async () => {
    if (!certificateUrl) {
      toast.error('No certificate to send');
      return;
    }

    try {
      const response = await fetch('/api/certificates/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          name: userData.name,
          certificateUrl,
          certId: userData.cert_id,
          context
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      toast.success('Certificate email sent successfully!');
    } catch (error) {
      console.error('Email sending error:', error);
      toast.error('Failed to send certificate email');
    }
  };

  const getContextIcon = () => {
    switch (context) {
      case 'test': return <FileText className="w-5 h-5" />;
      case 'event': return <Calendar className="w-5 h-5" />;
      case 'hackathon': return <Trophy className="w-5 h-5" />;
      default: return <Award className="w-5 h-5" />;
    }
  };

  const getContextColor = () => {
    switch (context) {
      case 'test': return 'text-blue-600';
      case 'event': return 'text-green-600';
      case 'hackathon': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${getContextColor()}`}>
            {getContextIcon()}
          </div>
          <div>
            <h2 className="text-xl font-semibold">Certificate Generator</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Generate certificates for {context} participants
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowUploadDialog(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Template
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowPlaceholderConfig(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Template Selection */}
            <div>
              <Label>Certificate Template</Label>
              <Select
                value={selectedTemplate?.id || ''}
                onValueChange={(value) => {
                  const template = templates.find(t => t.id === value);
                  setSelectedTemplate(template || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Participant Information */}
            <div>
              <Label>Participant Information</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label className="text-xs">Name</Label>
                  <Input value={userData.name} readOnly />
                </div>
                <div>
                  <Label className="text-xs">Email</Label>
                  <Input value={userData.email} readOnly />
                </div>
                <div>
                  <Label className="text-xs">Score</Label>
                  <Input value={userData.score?.toString() || 'N/A'} readOnly />
                </div>
                <div>
                  <Label className="text-xs">Event</Label>
                  <Input value={userData.eventName || userData.testName || userData.hackathonName || 'N/A'} readOnly />
                </div>
              </div>
            </div>

            {/* Custom Message */}
            <div>
              <Label>Custom Certificate Message</Label>
              <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="This certifies that {name} participated in the {event_name} with {total_registrations}, organised by {organizer} in collaboration with Codeunia, reflecting excellent technical skills and learning spirit."
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use placeholders like {'{name}'}, {'{event_name}'}, {'{score}'}, etc.
              </p>
            </div>

            {/* Available Placeholders */}
            <div>
              <Label>Available Placeholders</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {uploadForm.placeholders.map(placeholder => (
                  <Badge key={placeholder} variant="outline" className="text-xs">
                    {placeholder}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleGenerateCertificate}
                disabled={!selectedTemplate || isGenerating}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4 mr-2" />
                    Generate Certificate
                  </>
                )}
              </Button>
              {certificateUrl && (
                <Button variant="outline" onClick={handleSendEmail}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preview Panel */}
        {showPreview && (
          <Card>
            <CardHeader>
              <CardTitle>Certificate Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {previewUrl ? (
                <div className="space-y-4">
                  <div className="aspect-[3/2] bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <iframe
                      src={previewUrl}
                      className="w-full h-full rounded-lg"
                      title="Certificate Preview"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" asChild className="flex-1">
                      <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                        <Eye className="w-4 h-4 mr-2" />
                        View Full
                      </a>
                    </Button>
                    <Button variant="outline" asChild className="flex-1">
                      <a href={previewUrl} download>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="aspect-[3/2] bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Certificate preview will appear here</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Template Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Certificate Template</DialogTitle>
            <DialogDescription>
              Upload a new certificate template (PNG, JPG, or PDF)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={uploadForm.name}
                onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Test Certificate Template"
              />
            </div>
            <div>
              <Label htmlFor="template-file">Template File</Label>
              <Input
                id="template-file"
                type="file"
                accept=".png,.jpg,.jpeg,.pdf"
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(file);
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Template
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Placeholder Configuration Dialog */}
      <Dialog open={showPlaceholderConfig} onOpenChange={setShowPlaceholderConfig}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Placeholder Configuration</DialogTitle>
            <DialogDescription>
              Configure the position and styling of placeholders on your certificate template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Tabs defaultValue="positioning" className="w-full">
              <TabsList>
                <TabsTrigger value="positioning">Positioning</TabsTrigger>
                <TabsTrigger value="styling">Styling</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              
              <TabsContent value="positioning" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {uploadForm.placeholders.map(placeholder => {
                    const config = placeholderConfigs[placeholder] || defaultPlaceholderConfigs[placeholder];
                    return (
                      <Card key={placeholder}>
                        <CardHeader>
                          <CardTitle className="text-sm">{placeholder}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">X Position</Label>
                              <Input
                                type="number"
                                value={config?.x || 0}
                                onChange={(e) => setPlaceholderConfigs(prev => ({
                                  ...prev,
                                  [placeholder]: { ...config, x: parseInt(e.target.value) || 0 }
                                }))}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Y Position</Label>
                              <Input
                                type="number"
                                value={config?.y || 0}
                                onChange={(e) => setPlaceholderConfigs(prev => ({
                                  ...prev,
                                  [placeholder]: { ...config, y: parseInt(e.target.value) || 0 }
                                }))}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="styling" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {uploadForm.placeholders.map(placeholder => {
                    const config = placeholderConfigs[placeholder] || defaultPlaceholderConfigs[placeholder];
                    return (
                      <Card key={placeholder}>
                        <CardHeader>
                          <CardTitle className="text-sm">{placeholder}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div>
                            <Label className="text-xs">Font Size</Label>
                            <Input
                              type="number"
                              value={config?.fontSize || 12}
                              onChange={(e) => setPlaceholderConfigs(prev => ({
                                ...prev,
                                [placeholder]: { ...config, fontSize: parseInt(e.target.value) || 12 }
                              }))}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Font Family</Label>
                            <Select
                              value={config?.fontFamily || 'Arial'}
                              onValueChange={(value) => setPlaceholderConfigs(prev => ({
                                ...prev,
                                [placeholder]: { ...config, fontFamily: value }
                              }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Arial">Arial</SelectItem>
                                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                                <SelectItem value="Courier">Courier</SelectItem>
                                <SelectItem value="Georgia">Georgia</SelectItem>
                                <SelectItem value="Verdana">Verdana</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Color</Label>
                            <Input
                              type="color"
                              value={config?.color || '#000000'}
                              onChange={(e) => setPlaceholderConfigs(prev => ({
                                ...prev,
                                [placeholder]: { ...config, color: e.target.value }
                              }))}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="preview" className="space-y-4">
                <div className="aspect-[3/2] bg-gray-100 dark:bg-gray-800 rounded-lg relative">
                  {/* Preview canvas would go here */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-gray-500">Preview will be available when template is selected</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlaceholderConfig(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowPlaceholderConfig(false)}>
              <Save className="w-4 h-4 mr-2" />
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 

export default CertificateGenerator; 