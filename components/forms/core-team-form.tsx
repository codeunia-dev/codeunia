"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, Send, Users, Code2, Camera, PenTool, Target, Zap } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { toast } from "sonner";
import { useAuth } from "@/lib/hooks/useAuth";

export function CoreTeamForm() {
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
        skills: "",
        portfolio: "",
        
        // Core Team Application
        preferredRole: "",
        availability: "",
        commitment: "",
        motivation: "",
        vision: "",
        previousExperience: "",
        
        // Additional Information
        socialMedia: "",
        referencesInfo: "",
        additionalInfo: "",
    });

    const coreTeamRoles = [
        { value: "media-team", label: "Media Team", icon: Camera, description: "Content creation, social media, video production" },
        { value: "content-team", label: "Content Team", icon: PenTool, description: "Blog writing, documentation, educational content" },
        { value: "technical-team", label: "Technical Team", icon: Code2, description: "Platform development, technical infrastructure" },
        { value: "community-team", label: "Community Team", icon: Users, description: "Community management, event coordination" },
        { value: "strategy-team", label: "Strategy Team", icon: Target, description: "Strategic planning, partnerships, vision" },
    ];

    const commitmentLevels = [
        { value: "5-10-hours", label: "5-10 hours per week" },
        { value: "10-15-hours", label: "10-15 hours per week" },
        { value: "15-20-hours", label: "15-20 hours per week" },
        { value: "20-plus-hours", label: "20+ hours per week" },
    ];

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
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
                .from('core_team_applications')
                .insert([{
                    user_id: user.id,
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    location: formData.location,
                    occupation: formData.occupation,
                    company: formData.company,
                    experience: formData.experience,
                    skills: formData.skills,
                    portfolio: formData.portfolio,
                    preferred_role: formData.preferredRole,
                    availability: formData.availability,
                    commitment: formData.commitment,
                    motivation: formData.motivation,
                    vision: formData.vision,
                    previous_experience: formData.previousExperience,
                    social_media: formData.socialMedia,
                    references_info: formData.referencesInfo,
                    additional_info: formData.additionalInfo,
                    created_at: new Date().toISOString(),
                }]);

            if (error) {
                console.error('Error submitting application:', error);
                toast.error('Failed to submit application. Please try again.');
                return;
            }

            toast.success('Application submitted successfully! We\'ll get back to you within 72 hours.');
            
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
                skills: "",
                portfolio: "",
                preferredRole: "",
                availability: "",
                commitment: "",
                motivation: "",
                vision: "",
                previousExperience: "",
                socialMedia: "",
                referencesInfo: "",
                additionalInfo: "",
            });

        } catch (error) {
            console.error('Error submitting application:', error);
            toast.error('An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Show loading state while checking authentication
    if (authLoading) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
            >
                <Card className="border-0 bg-background/60 backdrop-blur-xl shadow-2xl">
                    <CardContent className="p-8 text-center">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-muted-foreground">Loading...</p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }

    // Show sign-in prompt if not authenticated
    if (!user) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
            >
                <Card className="border-0 bg-background/60 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="text-center pb-6">
                        <div className="mx-auto p-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 mb-4">
                            <Crown className="h-8 w-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Authentication Required</CardTitle>
                        <p className="text-muted-foreground">
                            Please sign in to submit your core team application
                        </p>
                    </CardHeader>
                    <CardContent className="text-center">
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                You need to be signed in to submit an application. This helps us track your submissions and provide better support.
                            </p>
                            <Button 
                                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
                                onClick={() => window.location.href = '/auth/signin'}
                            >
                                Sign In to Continue
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
            <Card className="border-0 bg-background/60 backdrop-blur-xl shadow-2xl">
                <CardHeader className="text-center pb-6">
                    <div className="mx-auto p-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 mb-4">
                        <Crown className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Core Team Application</CardTitle>
                    <p className="text-muted-foreground">
                        Help us build the future of developer education and community
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Personal Information */}
                        <div className="space-y-6">
                            <div className="flex items-center space-x-2 mb-4">
                                <Users className="h-5 w-5 text-amber-500" />
                                <h3 className="text-lg font-semibold">Personal Information</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name *</Label>
                                    <Input
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                                        required
                                        placeholder="Enter your first name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name *</Label>
                                    <Input
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                                        required
                                        placeholder="Enter your last name"
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
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        required
                                        placeholder="Enter your email"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        placeholder="Enter your phone number"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Location *</Label>
                                <Input
                                    id="location"
                                    value={formData.location}
                                    onChange={(e) => handleInputChange('location', e.target.value)}
                                    required
                                    placeholder="City, Country"
                                />
                            </div>
                        </div>

                        {/* Professional Information */}
                        <div className="space-y-6">
                            <div className="flex items-center space-x-2 mb-4">
                                <Zap className="h-5 w-5 text-amber-500" />
                                <h3 className="text-lg font-semibold">Professional Information</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="occupation">Current Occupation *</Label>
                                    <Input
                                        id="occupation"
                                        value={formData.occupation}
                                        onChange={(e) => handleInputChange('occupation', e.target.value)}
                                        required
                                        placeholder="e.g., Software Developer, Designer"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="company">Company/Organization</Label>
                                    <Input
                                        id="company"
                                        value={formData.company}
                                        onChange={(e) => handleInputChange('company', e.target.value)}
                                        placeholder="Current company or organization"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="experience">Years of Experience *</Label>
                                <Select value={formData.experience} onValueChange={(value) => handleInputChange('experience', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your experience level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0-1">0-1 years</SelectItem>
                                        <SelectItem value="1-3">1-3 years</SelectItem>
                                        <SelectItem value="3-5">3-5 years</SelectItem>
                                        <SelectItem value="5-10">5-10 years</SelectItem>
                                        <SelectItem value="10-plus">10+ years</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="skills">Key Skills & Expertise *</Label>
                                <Textarea
                                    id="skills"
                                    value={formData.skills}
                                    onChange={(e) => handleInputChange('skills', e.target.value)}
                                    required
                                    placeholder="List your key skills, technologies, and areas of expertise"
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="portfolio">Portfolio/Work Samples</Label>
                                <Input
                                    id="portfolio"
                                    value={formData.portfolio}
                                    onChange={(e) => handleInputChange('portfolio', e.target.value)}
                                    placeholder="Link to your portfolio, GitHub, or work samples"
                                />
                            </div>
                        </div>

                        {/* Core Team Application */}
                        <div className="space-y-6">
                            <div className="flex items-center space-x-2 mb-4">
                                <Crown className="h-5 w-5 text-amber-500" />
                                <h3 className="text-lg font-semibold">Core Team Application</h3>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="preferredRole">Preferred Role *</Label>
                                <Select value={formData.preferredRole} onValueChange={(value) => handleInputChange('preferredRole', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your preferred role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {coreTeamRoles.map((role) => (
                                            <SelectItem key={role.value} value={role.value}>
                                                <div className="flex items-center space-x-2">
                                                    <role.icon className="h-4 w-4" />
                                                    <div>
                                                        <div className="font-medium">{role.label}</div>
                                                        <div className="text-xs text-muted-foreground">{role.description}</div>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="commitment">Time Commitment *</Label>
                                <Select value={formData.commitment} onValueChange={(value) => handleInputChange('commitment', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your availability" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {commitmentLevels.map((level) => (
                                            <SelectItem key={level.value} value={level.value}>
                                                {level.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="availability">Availability *</Label>
                                <Textarea
                                    id="availability"
                                    value={formData.availability}
                                    onChange={(e) => handleInputChange('availability', e.target.value)}
                                    required
                                    placeholder="Describe your availability (time zones, preferred working hours, etc.)"
                                    rows={2}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="motivation">Why do you want to join the Codeunia Core Team? *</Label>
                                <Textarea
                                    id="motivation"
                                    value={formData.motivation}
                                    onChange={(e) => handleInputChange('motivation', e.target.value)}
                                    required
                                    placeholder="Tell us about your motivation and what drives you"
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="vision">Your Vision for Codeunia *</Label>
                                <Textarea
                                    id="vision"
                                    value={formData.vision}
                                    onChange={(e) => handleInputChange('vision', e.target.value)}
                                    required
                                    placeholder="Share your ideas and vision for how you'd like to contribute to Codeunia's growth"
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="previousExperience">Previous Leadership/Team Experience</Label>
                                <Textarea
                                    id="previousExperience"
                                    value={formData.previousExperience}
                                    onChange={(e) => handleInputChange('previousExperience', e.target.value)}
                                    placeholder="Describe any previous experience leading teams, managing projects, or similar roles"
                                    rows={3}
                                />
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="space-y-6">
                            <div className="flex items-center space-x-2 mb-4">
                                <Users className="h-5 w-5 text-amber-500" />
                                <h3 className="text-lg font-semibold">Additional Information</h3>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="socialMedia">Social Media Profiles</Label>
                                <Input
                                    id="socialMedia"
                                    value={formData.socialMedia}
                                    onChange={(e) => handleInputChange('socialMedia', e.target.value)}
                                    placeholder="LinkedIn, Twitter, Instagram, etc."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="referencesInfo">References</Label>
                                <Textarea
                                    id="referencesInfo"
                                    value={formData.referencesInfo}
                                    onChange={(e) => handleInputChange('referencesInfo', e.target.value)}
                                    placeholder="Any references or people who can vouch for your work"
                                    rows={2}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="additionalInfo">Additional Information</Label>
                                <Textarea
                                    id="additionalInfo"
                                    value={formData.additionalInfo}
                                    onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                                    placeholder="Anything else you'd like us to know about you"
                                    rows={3}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Submitting Application...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <Send className="h-4 w-4" />
                                        <span>Submit Application</span>
                                    </div>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
}
