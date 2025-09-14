"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Award, Send, Code2, Users, Globe } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { toast } from "sonner";
import { useAuth } from "@/lib/hooks/useAuth";

export function JudgesForm() {
    const { user, loading: authLoading } = useAuth();
    
    const getSupabaseClient = () => {
        return createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
    };

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        // Personal Information
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        location: "",
        
        // Professional Information
        occupation: "",
        company: "",
        experience: "",
        expertise: "",
        linkedin: "",
        
        // Judging Preferences
        expertiseAreas: [] as string[],
        eventTypes: [] as string[],
        
        // Additional Information
        motivation: "",
        previousJudging: "",
    });

    const expertiseAreas = [
        { value: "web-development", label: "Web Development", icon: Code2 },
        { value: "mobile-development", label: "Mobile Development", icon: Code2 },
        { value: "ai-ml", label: "AI & Machine Learning", icon: Code2 },
        { value: "data-science", label: "Data Science", icon: Code2 },
        { value: "cybersecurity", label: "Cybersecurity", icon: Code2 },
        { value: "blockchain", label: "Blockchain", icon: Code2 },
        { value: "ui-ux", label: "UI/UX Design", icon: Users },
        { value: "devops", label: "DevOps", icon: Code2 },
        { value: "game-development", label: "Game Development", icon: Code2 },
        { value: "cloud-computing", label: "Cloud Computing", icon: Globe },
    ];

    const eventTypes = [
        { value: "hackathons", label: "Hackathons" },
        { value: "coding-competitions", label: "Coding Competitions" },
        { value: "project-showcases", label: "Project Showcases" },
        { value: "innovation-challenges", label: "Innovation Challenges" },
        { value: "startup-pitch", label: "Startup Pitch Events" },
    ];

    const handleInputChange = (field: string, value: string | string[]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleExpertiseToggle = (expertise: string) => {
        setFormData((prev) => ({
            ...prev,
            expertiseAreas: prev.expertiseAreas.includes(expertise)
                ? prev.expertiseAreas.filter((e) => e !== expertise)
                : [...prev.expertiseAreas, expertise],
        }));
    };

    const handleEventTypeToggle = (eventType: string) => {
        setFormData((prev) => ({
            ...prev,
            eventTypes: prev.eventTypes.includes(eventType)
                ? prev.eventTypes.filter((e) => e !== eventType)
                : [...prev.eventTypes, eventType],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user) {
            toast.error('Please sign in to submit your application.');
            return;
        }
        
        setIsSubmitting(true);

        try {
            const supabase = getSupabaseClient();
            const { error } = await supabase
                .from('judges_applications')
                .insert([
                    {
                        user_id: user.id,
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        email: formData.email,
                        phone: formData.phone,
                        location: formData.location,
                        occupation: formData.occupation,
                        company: formData.company,
                        experience: formData.experience,
                        expertise: formData.expertise,
                        linkedin: formData.linkedin,
                        expertise_areas: formData.expertiseAreas,
                        event_types: formData.eventTypes,
                        motivation: formData.motivation,
                        previous_judging: formData.previousJudging,
                        status: 'pending',
                        created_at: new Date().toISOString(),
                    }
                ]);

            if (error) throw error;

            toast.success('Application submitted successfully! We will get back to you within 48 hours.');
            
            // Reset form
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                location: "",
                occupation: "",
                company: "",
                experience: "",
                expertise: "",
                linkedin: "",
                expertiseAreas: [],
                eventTypes: [],
                motivation: "",
                previousJudging: "",
            });
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('Failed to submit application. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Show loading state while checking authentication
    if (authLoading) {
        return (
            <div className="text-center p-8">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Show sign-in prompt if not authenticated
    if (!user) {
        return (
            <div className="text-center p-8 space-y-4">
                <div className="mx-auto p-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 mb-4 w-fit">
                    <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold">Authentication Required</h3>
                <p className="text-muted-foreground">
                    Please sign in to submit your judges application
                </p>
                <p className="text-sm text-muted-foreground">
                    You need to be signed in to submit an application. This helps us track your submissions and provide better support.
                </p>
                <Button 
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                    onClick={() => window.location.href = '/auth/signin'}
                >
                    Sign In to Continue
                </Button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
        >
            <Card className="border-0 shadow-2xl bg-background/60 backdrop-blur-xl">
                <CardHeader className="text-center pb-6">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                            <Award className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-2xl">Judges Registration</CardTitle>
                    </div>
                    <p className="text-muted-foreground">
                        Share your expertise and help evaluate innovative projects
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Personal Information */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name *</Label>
                                    <Input
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                                        required
                                        className="h-11 focus:ring-2 focus:ring-primary/20 bg-background/30 backdrop-blur-sm border-white/10 hover:border-primary/20 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                                        className="h-11 focus:ring-2 focus:ring-primary/20 bg-background/30 backdrop-blur-sm border-white/10 hover:border-primary/20 transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                        required
                                        className="h-11 focus:ring-2 focus:ring-primary/20 bg-background/30 backdrop-blur-sm border-white/10 hover:border-primary/20 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number *</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange("phone", e.target.value)}
                                        required
                                        className="h-11 focus:ring-2 focus:ring-primary/20 bg-background/30 backdrop-blur-sm border-white/10 hover:border-primary/20 transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location">Location/City *</Label>
                                <Input
                                    id="location"
                                    value={formData.location}
                                    onChange={(e) => handleInputChange("location", e.target.value)}
                                    required
                                    className="h-11 focus:ring-2 focus:ring-primary/20 bg-background/30 backdrop-blur-sm border-white/10 hover:border-primary/20 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Professional Information */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold border-b pb-2">Professional Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="occupation">Current Position *</Label>
                                    <Input
                                        id="occupation"
                                        value={formData.occupation}
                                        onChange={(e) => handleInputChange("occupation", e.target.value)}
                                        required
                                        className="h-11 focus:ring-2 focus:ring-primary/20 bg-background/30 backdrop-blur-sm border-white/10 hover:border-primary/20 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="company">Company/Organization *</Label>
                                    <Input
                                        id="company"
                                        value={formData.company}
                                        onChange={(e) => handleInputChange("company", e.target.value)}
                                        required
                                        className="h-11 focus:ring-2 focus:ring-primary/20 bg-background/30 backdrop-blur-sm border-white/10 hover:border-primary/20 transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="experience">Years of Experience *</Label>
                                    <Input
                                        id="experience"
                                        value={formData.experience}
                                        onChange={(e) => handleInputChange("experience", e.target.value)}
                                        placeholder="e.g., 5+ years in software development"
                                        required
                                        className="h-11 focus:ring-2 focus:ring-primary/20 bg-background/30 backdrop-blur-sm border-white/10 hover:border-primary/20 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="linkedin">LinkedIn Profile *</Label>
                                    <Input
                                        id="linkedin"
                                        type="url"
                                        value={formData.linkedin}
                                        onChange={(e) => handleInputChange("linkedin", e.target.value)}
                                        placeholder="https://linkedin.com/in/yourprofile"
                                        required
                                        className="h-11 focus:ring-2 focus:ring-primary/20 bg-background/30 backdrop-blur-sm border-white/10 hover:border-primary/20 transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="expertise">Areas of Expertise *</Label>
                                <Textarea
                                    id="expertise"
                                    value={formData.expertise}
                                    onChange={(e) => handleInputChange("expertise", e.target.value)}
                                    placeholder="Describe your technical expertise, specializations, and key skills..."
                                    rows={3}
                                    required
                                    className="focus:ring-2 focus:ring-primary/20 bg-background/30 backdrop-blur-sm border-white/10 hover:border-primary/20 transition-colors resize-none"
                                />
                            </div>
                        </div>

                        {/* Judging Preferences */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold border-b pb-2">Judging Preferences</h3>
                            
                            <div className="space-y-4">
                                <Label>Areas of Expertise (Select all that apply) *</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {expertiseAreas.map((area) => (
                                        <div key={area.value} className="flex items-center space-x-3">
                                            <Checkbox
                                                id={area.value}
                                                checked={formData.expertiseAreas.includes(area.value)}
                                                onCheckedChange={() => handleExpertiseToggle(area.value)}
                                                className="border-white/10 focus:ring-primary/20 bg-background/30"
                                            />
                                            <Label htmlFor={area.value} className="flex items-center space-x-2 cursor-pointer">
                                                <area.icon className="h-4 w-4" />
                                                <span>{area.label}</span>
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label>Event Types You&apos;d Like to Judge (Select all that apply) *</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {eventTypes.map((eventType) => (
                                        <div key={eventType.value} className="flex items-center space-x-3">
                                            <Checkbox
                                                id={eventType.value}
                                                checked={formData.eventTypes.includes(eventType.value)}
                                                onCheckedChange={() => handleEventTypeToggle(eventType.value)}
                                                className="border-white/10 focus:ring-primary/20 bg-background/30"
                                            />
                                            <Label htmlFor={eventType.value} className="cursor-pointer">
                                                {eventType.label}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold border-b pb-2">Additional Information</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="motivation">Why do you want to be a judge? *</Label>
                                    <Textarea
                                        id="motivation"
                                        value={formData.motivation}
                                        onChange={(e) => handleInputChange("motivation", e.target.value)}
                                        placeholder="Tell us about your motivation and what you hope to contribute as a judge..."
                                        rows={4}
                                        required
                                        className="focus:ring-2 focus:ring-primary/20 bg-background/30 backdrop-blur-sm border-white/10 hover:border-primary/20 transition-colors resize-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="previousJudging">Previous Judging Experience</Label>
                                    <Textarea
                                        id="previousJudging"
                                        value={formData.previousJudging}
                                        onChange={(e) => handleInputChange("previousJudging", e.target.value)}
                                        placeholder="Describe any previous experience as a judge, evaluator, or mentor..."
                                        rows={3}
                                        className="focus:ring-2 focus:ring-primary/20 bg-background/30 backdrop-blur-sm border-white/10 hover:border-primary/20 transition-colors resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <Button 
                            type="submit"
                            className="w-full h-12 text-base font-medium hover:opacity-90 transition-opacity bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 relative overflow-hidden group"
                            disabled={isSubmitting}
                        >
                            <span className="relative z-10 flex items-center justify-center">
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                        Submitting Application...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Submit Application
                                    </>
                                )}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-white/10 to-orange-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
}
