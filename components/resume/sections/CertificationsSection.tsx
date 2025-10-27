'use client';

import { Certification } from '@/types/resume';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { Award, Plus, Trash2, ExternalLink } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface CertificationsSectionProps {
  content: Certification[];
  onChange: (content: Certification[]) => void;
}

export function CertificationsSection({ content, onChange }: CertificationsSectionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(content.map((cert) => cert.id))
  );

  const handleAddCertification = () => {
    const newCertification: Certification = {
      id: uuidv4(),
      name: '',
      issuer: '',
      date: '',
      expiry_date: '',
      credential_id: '',
      url: '',
    };
    onChange([...content, newCertification]);
    setExpandedIds((prev) => new Set([...prev, newCertification.id]));
  };

  const handleRemoveCertification = (id: string) => {
    onChange(content.filter((cert) => cert.id !== id));
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleUpdateCertification = (id: string, updates: Partial<Certification>) => {
    onChange(
      content.map((cert) =>
        cert.id === id ? { ...cert, ...updates } : cert
      )
    );
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Certifications
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddCertification}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Certification
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {content.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No certifications yet</p>
            <p className="text-xs mt-1">Click "Add Certification" to get started</p>
          </div>
        ) : (
          content.map((certification, index) => (
            <div key={certification.id} className="space-y-4">
              {index > 0 && <Separator />}
              
              {/* Certification Entry Header */}
              <div className="flex items-start justify-between">
                <button
                  type="button"
                  onClick={() => toggleExpanded(certification.id)}
                  className="flex-1 text-left"
                >
                  <div className="font-medium">
                    {certification.name || 'Untitled Certification'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {certification.issuer
                      ? `${certification.issuer}${certification.date ? ` • ${new Date(certification.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}` : ''}`
                      : 'No issuer specified'}
                  </div>
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCertification(certification.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Certification Entry Form */}
              {expandedIds.has(certification.id) && (
                <div className="space-y-4 pl-4 border-l-2 border-muted">
                  {/* Certification Name */}
                  <div className="space-y-2">
                    <Label htmlFor={`name-${certification.id}`} className="text-sm font-medium">
                      Certification Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`name-${certification.id}`}
                      value={certification.name}
                      onChange={(e) =>
                        handleUpdateCertification(certification.id, {
                          name: e.target.value,
                        })
                      }
                      placeholder="AWS Certified Solutions Architect"
                      required
                    />
                  </div>

                  {/* Issuer */}
                  <div className="space-y-2">
                    <Label htmlFor={`issuer-${certification.id}`} className="text-sm font-medium">
                      Issuing Organization <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`issuer-${certification.id}`}
                      value={certification.issuer}
                      onChange={(e) =>
                        handleUpdateCertification(certification.id, {
                          issuer: e.target.value,
                        })
                      }
                      placeholder="Amazon Web Services"
                      required
                    />
                  </div>

                  {/* Issue Date and Expiry Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`date-${certification.id}`} className="text-sm font-medium">
                        Issue Date <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`date-${certification.id}`}
                        type="month"
                        value={certification.date}
                        onChange={(e) =>
                          handleUpdateCertification(certification.id, {
                            date: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`expiry-date-${certification.id}`} className="text-sm font-medium">
                        Expiry Date (Optional)
                      </Label>
                      <Input
                        id={`expiry-date-${certification.id}`}
                        type="month"
                        value={certification.expiry_date || ''}
                        onChange={(e) =>
                          handleUpdateCertification(certification.id, {
                            expiry_date: e.target.value,
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Leave blank if certification doesn&apos;t expire
                      </p>
                    </div>
                  </div>

                  {/* Credential ID */}
                  <div className="space-y-2">
                    <Label htmlFor={`credential-id-${certification.id}`} className="text-sm font-medium">
                      Credential ID (Optional)
                    </Label>
                    <Input
                      id={`credential-id-${certification.id}`}
                      value={certification.credential_id || ''}
                      onChange={(e) =>
                        handleUpdateCertification(certification.id, {
                          credential_id: e.target.value,
                        })
                      }
                      placeholder="ABC123XYZ789"
                    />
                  </div>

                  {/* Credential URL */}
                  <div className="space-y-2">
                    <Label htmlFor={`url-${certification.id}`} className="text-sm font-medium">
                      Credential URL (Optional)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id={`url-${certification.id}`}
                        type="url"
                        value={certification.url || ''}
                        onChange={(e) =>
                          handleUpdateCertification(certification.id, {
                            url: e.target.value,
                          })
                        }
                        placeholder="https://www.credly.com/badges/..."
                        className="flex-1"
                      />
                      {certification.url && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(certification.url, '_blank')}
                          className="gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Link to verify your certification online
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
