"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface MentorshipFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    expertise: string;
    setExpertise: (value: string) => void;
    type: string;
    setType: (value: string) => void;
}

const EXPERTISE_OPTIONS = [
    { value: "all", label: "All Expertise" },
    { value: "web-development", label: "Web Development" },
    { value: "mobile-development", label: "Mobile Development" },
    { value: "ai-ml", label: "AI & Machine Learning" },
    { value: "data-science", label: "Data Science" },
    { value: "cybersecurity", label: "Cybersecurity" },
    { value: "blockchain", label: "Blockchain" },
    { value: "ui-ux", label: "UI/UX Design" },
    { value: "devops", label: "DevOps" },
    { value: "game-development", label: "Game Development" },
    { value: "cloud-computing", label: "Cloud Computing" },
    { value: "system-design", label: "System Design" },
    { value: "algorithms", label: "Algorithms" },
];

const TYPE_OPTIONS = [
    { value: "all", label: "All Mentoring Types" },
    { value: "one-on-one", label: "One-on-One" },
    { value: "group-sessions", label: "Group Sessions" },
    { value: "code-reviews", label: "Code Reviews" },
    { value: "project-guidance", label: "Project Guidance" },
    { value: "career-advice", label: "Career Advice" },
    { value: "interview-prep", label: "Interview Prep" },
];

export function MentorshipFilters({
    search,
    setSearch,
    expertise,
    setExpertise,
    type,
    setType,
}: MentorshipFiltersProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-lg border shadow-sm">
            <div className="relative w-full md:w-1/3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search mentors..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
            </div>

            <div className="flex gap-4 w-full md:w-2/3">
                <div className="w-1/2">
                    <Select value={expertise} onValueChange={setExpertise}>
                        <SelectTrigger>
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <SelectValue placeholder="Expertise" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            {EXPERTISE_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-1/2">
                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger>
                            <SelectValue placeholder="Mentoring Type" />
                        </SelectTrigger>
                        <SelectContent>
                            {TYPE_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
