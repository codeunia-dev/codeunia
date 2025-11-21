"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  FileText,
  CheckCircle2,
  Upload,
  X,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Globe,
  Mail,
  Phone,
  Linkedin,
  Twitter,
  Facebook,
  Instagram
} from "lucide-react";
import { CompanyRegistrationData } from "@/types/company";
import { toast } from "sonner";
import { HelpTooltip, CompanyHelpTooltips } from "@/components/help/HelpTooltip";

interface CompanyRegistrationFormProps {
  onSuccess?: (company: unknown) => void;
  onError?: (error: Error) => void;
  initialData?: CompanyData;
  companyId?: string;
}

interface CompanyData {
  name: string;
  legal_name?: string;
  email: string;
  phone?: string;
  website: string;
  industry: string;
  company_size: string;
  description: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zip: string;
  };
  socials?: {
    linkedin: string;
    twitter: string;
    facebook: string;
    instagram: string;
  };
}

interface FormData extends CompanyRegistrationData {
  verification_documents: File[];
}

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "E-commerce",
  "Manufacturing",
  "Consulting",
  "Media & Entertainment",
  "Real Estate",
  "Other"
];

const COMPANY_SIZES = [
  { value: "startup", label: "Startup (1-10 employees)" },
  { value: "small", label: "Small (11-50 employees)" },
  { value: "medium", label: "Medium (51-200 employees)" },
  { value: "large", label: "Large (201-1000 employees)" },
  { value: "enterprise", label: "Enterprise (1000+ employees)" }
];

export function CompanyRegistrationForm({ onSuccess, onError, initialData, companyId }: CompanyRegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name || "",
    legal_name: initialData?.legal_name || "",
    email: initialData?.email || "",
    website: initialData?.website || "",
    industry: initialData?.industry || "",
    company_size: initialData?.company_size || "",
    description: initialData?.description || "",
    phone: initialData?.phone || "",
    address: initialData?.address || {
      street: "",
      city: "",
      state: "",
      country: "",
      zip: ""
    },
    socials: initialData?.socials || {
      linkedin: "",
      twitter: "",
      facebook: "",
      instagram: ""
    },
    verification_documents: []
  });

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleInputChange = (field: string, value: string | File[]) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof FormData] as Record<string, unknown>),
          [child]: value
        }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate file types
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      toast.error("Only PDF, JPEG, and PNG files are allowed");
      return;
    }

    // Validate file sizes (max 5MB each)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);

    if (oversizedFiles.length > 0) {
      toast.error("Each file must be less than 5MB");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      verification_documents: [...prev.verification_documents, ...files]
    }));
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      verification_documents: prev.verification_documents.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.name || !formData.email || !formData.website || !formData.industry || !formData.company_size) {
          toast.error("Please fill in all required fields");
          return false;
        }
        if (!formData.email.includes("@")) {
          toast.error("Please enter a valid email address");
          return false;
        }
        if (!formData.website.startsWith("http")) {
          toast.error("Please enter a valid website URL starting with http:// or https://");
          return false;
        }
        return true;

      case 2:
        if (!formData.description || formData.description.length < 50) {
          toast.error("Description must be at least 50 characters");
          return false;
        }
        return true;

      case 3:
        return true; // Verification documents are optional

      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Only allow submission on the final step
    if (currentStep !== totalSteps) {
      console.log('Not on final step, preventing submission');
      return;
    }

    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare FormData for file upload
      const submitData = new FormData();

      // Add company data
      submitData.append("name", formData.name);
      submitData.append("email", formData.email);
      submitData.append("website", formData.website);
      submitData.append("industry", formData.industry);
      submitData.append("company_size", formData.company_size);
      submitData.append("description", formData.description);

      // Add companyId if resubmitting
      if (companyId) {
        submitData.append("companyId", companyId);
      }

      if (formData.legal_name) submitData.append("legal_name", formData.legal_name);
      if (formData.phone) submitData.append("phone", formData.phone);

      // Add address if any field is filled
      if (formData.address && Object.values(formData.address).some(v => v)) {
        submitData.append("address", JSON.stringify(formData.address));
      }

      // Add socials if any field is filled
      if (formData.socials && Object.values(formData.socials).some(v => v)) {
        submitData.append("socials", JSON.stringify(formData.socials));
      }

      // Add verification documents
      formData.verification_documents.forEach((file, index) => {
        submitData.append(`verification_document_${index} `, file);
      });

      const response = await fetch("/api/companies/register", {
        method: "POST",
        body: submitData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to register company");
      }

      toast.success(
        companyId
          ? "Company information updated successfully! We'll review your resubmission within 48 hours."
          : "Company registered successfully! We'll review your application within 48 hours."
      );

      if (onSuccess) {
        onSuccess(result.company);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to register company";
      toast.error(errorMessage);

      if (onError) {
        onError(error instanceof Error ? error : new Error(errorMessage));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
        onKeyDown={(e) => {
          // Prevent Enter key from submitting the form unless on final step
          if (e.key === 'Enter' && currentStep !== totalSteps) {
            e.preventDefault();
            console.log('Enter key pressed, but not on final step - preventing submission');
          }
        }}
      >
        {/* Step 1: Company Information */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-2xl bg-background/60 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle>Company Information</CardTitle>
                    <CardDescription>
                      Tell us about your company and how we can reach you.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="name">Company Name *</Label>
                      <HelpTooltip content={CompanyHelpTooltips.companyName.description} />
                    </div>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter your company name"
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="legal_name">Legal Name</Label>
                      <HelpTooltip content={CompanyHelpTooltips.legalName.description} />
                    </div>
                    <Input
                      id="legal_name"
                      value={formData.legal_name}
                      onChange={(e) => handleInputChange("legal_name", e.target.value)}
                      placeholder="Legal company name (if different)"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Company Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="contact@company.com"
                        required
                        className="h-11 pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="h-11 pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website *</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="website"
                        type="url"
                        value={formData.website}
                        onChange={(e) => handleInputChange("website", e.target.value)}
                        placeholder="https://yourcompany.com"
                        required
                        className="h-11 pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="industry">Industry *</Label>
                      <HelpTooltip content={CompanyHelpTooltips.industry.description} />
                    </div>
                    <Select
                      value={formData.industry}
                      onValueChange={(value) => handleInputChange("industry", value)}
                      required
                    >
                      <SelectTrigger className="h-11 w-full">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="company_size">Company Size *</Label>
                      <HelpTooltip content={CompanyHelpTooltips.companySize.description} />
                    </div>
                    <Select
                      value={formData.company_size}
                      onValueChange={(value) => handleInputChange("company_size", value)}
                      required
                    >
                      <SelectTrigger className="h-11 w-full">
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPANY_SIZES.map((size) => (
                          <SelectItem key={size.value} value={size.value}>
                            {size.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Company Details */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-2xl bg-background/60 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle>Company Details</CardTitle>
                    <CardDescription>
                      Provide more information about your company.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="description">Company Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Tell us about your company, what you do, and why you want to host events on CodeUnia... (minimum 50 characters)"
                    rows={6}
                    required
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.description.length} / 50 characters minimum
                  </p>
                </div>

                <div className="space-y-4">
                  <Label>Address (Optional)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Input
                        placeholder="Street Address"
                        value={formData.address?.street || ""}
                        onChange={(e) => handleInputChange("address.street", e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Input
                        placeholder="City"
                        value={formData.address?.city || ""}
                        onChange={(e) => handleInputChange("address.city", e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Input
                        placeholder="State/Province"
                        value={formData.address?.state || ""}
                        onChange={(e) => handleInputChange("address.state", e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Input
                        placeholder="Country"
                        value={formData.address?.country || ""}
                        onChange={(e) => handleInputChange("address.country", e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Input
                        placeholder="ZIP/Postal Code"
                        value={formData.address?.zip || ""}
                        onChange={(e) => handleInputChange("address.zip", e.target.value)}
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Social Media (Optional)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="LinkedIn URL"
                          value={formData.socials?.linkedin || ""}
                          onChange={(e) => handleInputChange("socials.linkedin", e.target.value)}
                          className="h-11 pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="relative">
                        <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Twitter/X URL"
                          value={formData.socials?.twitter || ""}
                          onChange={(e) => handleInputChange("socials.twitter", e.target.value)}
                          className="h-11 pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="relative">
                        <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Facebook URL"
                          value={formData.socials?.facebook || ""}
                          onChange={(e) => handleInputChange("socials.facebook", e.target.value)}
                          className="h-11 pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="relative">
                        <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Instagram URL"
                          value={formData.socials?.instagram || ""}
                          onChange={(e) => handleInputChange("socials.instagram", e.target.value)}
                          className="h-11 pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Verification Documents */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-2xl bg-background/60 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <Upload className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle>Verification Documents</CardTitle>
                    <CardDescription>
                      Upload documents to verify your company (optional but recommended for faster approval).
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Label htmlFor="documents" className="cursor-pointer">
                        <span className="text-sm font-medium text-primary hover:underline">
                          Click to upload
                        </span>
                        <span className="text-sm text-muted-foreground"> or drag and drop</span>
                      </Label>
                      <HelpTooltip content={CompanyHelpTooltips.verificationDocuments.description} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      PDF, PNG, or JPEG (max 5MB each)
                    </p>
                    <Input
                      id="documents"
                      type="file"
                      multiple
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  {formData.verification_documents.length > 0 && (
                    <div className="space-y-2">
                      <Label>Uploaded Documents ({formData.verification_documents.length})</Label>
                      <div className="space-y-2">
                        {formData.verification_documents.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFile(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>Recommended documents:</strong> Business registration certificate,
                      tax ID, or other official documents that verify your company&apos;s legitimacy.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          )}

          {currentStep < totalSteps ? (
            <Button
              type="button"
              onClick={nextStep}
              disabled={isSubmitting}
              className="ml-auto"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="ml-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Submit Registration
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
