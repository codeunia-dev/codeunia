"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Trophy, Send, Building2 } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { toast } from "sonner";

export function SponsorshipForm() {
    const getSupabaseClient = () => {
        return createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
    };
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        // Company Information
        companyName: "",
        companySize: "",
        contactName: "",
        designation: "",
        email: "",
        phone: "",
        website: "",
        industry: "",
        
        // Sponsorship Preferences
        preferredEvents: [] as string[],
        marketingGoals: "",
        targetAudience: "",
        specificRequirements: "",
        
        // Agreements
        agreeToContact: false,
        agreeToTerms: false,
    });

    const eventOptions = [
        "Hackathons",
        "Workshops",
        "Conferences",
        "Webinars",
        "Mentorship Programs",
        "Career Fairs",
        "Tech Talks",
        "All Events"
    ];

    const companySizes = [
        "1-10 employees",
        "11-50 employees", 
        "51-200 employees",
        "201-500 employees",
        "500+ employees"
    ];

    const industries = [
        "Technology",
        "Finance",
        "Healthcare",
        "Education",
        "E-commerce",
        "Consulting",
        "Manufacturing",
        "Other"
    ];

    const handleInputChange = (field: string, value: string | boolean | string[]) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCheckboxChange = (value: string, checked: boolean) => {
        const current = formData.preferredEvents as string[];
        if (checked) {
            handleInputChange("preferredEvents", [...current, value]);
        } else {
            handleInputChange("preferredEvents", current.filter(item => item !== value));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.agreeToContact || !formData.agreeToTerms) {
            toast.error("Please accept all required agreements");
            return;
        }

        setIsSubmitting(true);

        try {
            const supabase = getSupabaseClient();
            const { error } = await supabase
                .from('sponsorship_applications')
                .insert([{
                    company_name: formData.companyName,
                    company_size: formData.companySize,
                    contact_name: formData.contactName,
                    designation: formData.designation,
                    email: formData.email,
                    phone: formData.phone,
                    website: formData.website,
                    industry: formData.industry,
                    preferred_events: formData.preferredEvents,
                    marketing_goals: formData.marketingGoals,
                    target_audience: formData.targetAudience,
                    specific_requirements: formData.specificRequirements,
                    status: 'pending',
                    created_at: new Date().toISOString(),
                }]);

            if (error) {
                throw error;
            }

            toast.success("Sponsorship application submitted successfully! We'll get back to you within 48 hours.");
            
            // Reset form
            setFormData({
                companyName: "",
                companySize: "",
                contactName: "",
                designation: "",
                email: "",
                phone: "",
                website: "",
                industry: "",
                preferredEvents: [],
                marketingGoals: "",
                targetAudience: "",
                specificRequirements: "",
                agreeToContact: false,
                agreeToTerms: false,
            });

        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error("Failed to submit application. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Company Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Company Information
                    </CardTitle>
                    <CardDescription>
                        Tell us about your organization and how we can reach you.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="companyName">Company Name *</Label>
                            <Input
                                id="companyName"
                                value={formData.companyName}
                                onChange={(e) => handleInputChange("companyName", e.target.value)}
                                placeholder="Your company name"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="industry">Industry *</Label>
                            <Select value={formData.industry} onValueChange={(value) => handleInputChange("industry", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your industry" />
                                </SelectTrigger>
                                <SelectContent>
                                    {industries.map((industry) => (
                                        <SelectItem key={industry} value={industry}>
                                            {industry}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="companySize">Company Size *</Label>
                            <Select value={formData.companySize} onValueChange={(value) => handleInputChange("companySize", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select company size" />
                                </SelectTrigger>
                                <SelectContent>
                                    {companySizes.map((size) => (
                                        <SelectItem key={size} value={size}>
                                            {size}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactName">Contact Person *</Label>
                            <Input
                                id="contactName"
                                value={formData.contactName}
                                onChange={(e) => handleInputChange("contactName", e.target.value)}
                                placeholder="Full name"
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="designation">Designation *</Label>
                            <Input
                                id="designation"
                                value={formData.designation}
                                onChange={(e) => handleInputChange("designation", e.target.value)}
                                placeholder="Your job title"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                placeholder="contact@company.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleInputChange("phone", e.target.value)}
                                placeholder="+1 (555) 123-4567"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            <Input
                                id="website"
                                type="url"
                                value={formData.website}
                                onChange={(e) => handleInputChange("website", e.target.value)}
                                placeholder="www.company.com"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Sponsorship Preferences */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5" />
                        Sponsorship Preferences
                    </CardTitle>
                    <CardDescription>
                        Let us know about your sponsorship goals and preferences.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Preferred Events *</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {eventOptions.map((event) => (
                                <div key={event} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={event}
                                        checked={formData.preferredEvents.includes(event)}
                                        onCheckedChange={(checked) => handleCheckboxChange(event, checked as boolean)}
                                    />
                                    <Label htmlFor={event} className="text-sm font-normal">
                                        {event}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="marketingGoals">Marketing Goals *</Label>
                        <Textarea
                            id="marketingGoals"
                            value={formData.marketingGoals}
                            onChange={(e) => handleInputChange("marketingGoals", e.target.value)}
                            placeholder="What are your primary marketing objectives? (e.g., brand awareness, lead generation, talent acquisition)"
                            rows={3}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="targetAudience">Target Audience *</Label>
                        <Textarea
                            id="targetAudience"
                            value={formData.targetAudience}
                            onChange={(e) => handleInputChange("targetAudience", e.target.value)}
                            placeholder="Describe your target audience (e.g., students, professionals, specific tech skills)"
                            rows={3}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="specificRequirements">Specific Requirements</Label>
                        <Textarea
                            id="specificRequirements"
                            value={formData.specificRequirements}
                            onChange={(e) => handleInputChange("specificRequirements", e.target.value)}
                            placeholder="Any specific requirements or expectations for the sponsorship? (e.g., logo placement, speaking opportunities, booth space)"
                            rows={3}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Agreements */}
            <Card>
                <CardHeader>
                    <CardTitle>Agreements</CardTitle>
                    <CardDescription>
                        Please review and accept the following terms.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start space-x-2">
                        <Checkbox
                            id="agreeToContact"
                            checked={formData.agreeToContact}
                            onCheckedChange={(checked) => handleInputChange("agreeToContact", checked as boolean)}
                        />
                        <Label htmlFor="agreeToContact" className="text-sm leading-relaxed">
                            I agree to be contacted by Codeunia regarding sponsorship opportunities and related communications. *
                        </Label>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                        <Checkbox
                            id="agreeToTerms"
                            checked={formData.agreeToTerms}
                            onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                        />
                        <Label htmlFor="agreeToTerms" className="text-sm leading-relaxed">
                            I have read and agree to the terms and conditions for sponsorship applications. *
                        </Label>
                    </div>
                </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-center">
                <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="px-8 py-3 text-lg"
                >
                    {isSubmitting ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Send className="mr-2 h-4 w-4" />
                            Submit Sponsorship Application
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
} 