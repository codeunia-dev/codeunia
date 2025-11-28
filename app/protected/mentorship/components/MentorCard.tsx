"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Briefcase, Linkedin, Clock, GraduationCap } from "lucide-react";
import { RequestDialog } from "./RequestDialog";

export interface Mentor {
    id: string;
    first_name: string;
    last_name: string;
    company: string;
    occupation: string;
    expertise: string;
    expertise_areas: string[];
    mentoring_types: string[];
    linkedin: string;
    availability: string;
    created_at: string;
}

interface MentorCardProps {
    mentor: Mentor;
}

const EXPERTISE_LABELS: Record<string, string> = {
    "web-development": "Web Dev",
    "mobile-development": "Mobile Dev",
    "ai-ml": "AI & ML",
    "data-science": "Data Science",
    "cybersecurity": "Cybersecurity",
    "blockchain": "Blockchain",
    "ui-ux": "UI/UX",
    "devops": "DevOps",
    "game-development": "Game Dev",
    "cloud-computing": "Cloud",
    "system-design": "System Design",
    "algorithms": "Algorithms",
};

const IMAGE_MAP: Record<string, string> = {
    "Deepak Pandey": "/images/team/deepak.jpeg",
    "Parisha Sharma": "/images/team/parisha.jpeg",
    "Akshay Kumar": "/images/team/akshay.jpg",
};

export function MentorCard({ mentor }: MentorCardProps) {
    const initials = `${mentor.first_name[0]}${mentor.last_name[0]}`;
    const fullName = `${mentor.first_name} ${mentor.last_name}`;
    const imageSrc = IMAGE_MAP[fullName] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.id}`;

    return (
        <Card className="flex flex-col h-full overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="p-6 pb-4 space-y-4">
                <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary/10">
                            <AvatarImage src={imageSrc} className="object-cover" />
                            <AvatarFallback className="bg-primary/5 text-primary text-lg font-semibold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-bold text-lg leading-none mb-1 group-hover:text-primary transition-colors">
                                {fullName}
                            </h3>
                            <div className="flex items-center text-sm text-muted-foreground mb-1">
                                <Briefcase className="h-3.5 w-3.5 mr-1.5" />
                                {mentor.occupation} at {mentor.company}
                            </div>
                            {mentor.linkedin && (
                                <a
                                    href={mentor.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-xs text-blue-500 hover:underline"
                                >
                                    <Linkedin className="h-3 w-3 mr-1" />
                                    LinkedIn Profile
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6 pt-0 flex-grow space-y-4">
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                        {mentor.expertise}
                    </p>
                </div>

                <div className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                        {mentor.expertise_areas?.slice(0, 4).map((area) => (
                            <Badge
                                key={area}
                                variant="secondary"
                                className="text-xs bg-primary/5 text-primary hover:bg-primary/10 border-transparent"
                            >
                                {EXPERTISE_LABELS[area] || area}
                            </Badge>
                        ))}
                        {mentor.expertise_areas?.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                                +{mentor.expertise_areas.length - 4} more
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/50">
                    <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1.5" />
                        {mentor.availability}
                    </div>
                    <div className="flex items-center">
                        <GraduationCap className="h-3.5 w-3.5 mr-1.5" />
                        {mentor.mentoring_types?.length || 0} Types
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-6 pt-0 mt-auto">
                <RequestDialog
                    mentorName={fullName}
                    mentorId={mentor.id}
                    trigger={
                        <Button className="w-full bg-primary/10 text-primary hover:bg-primary/20 shadow-none border-0">
                            Request Mentorship
                        </Button>
                    }
                />
            </CardFooter>
        </Card>
    );
}
