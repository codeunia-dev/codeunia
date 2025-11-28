"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Briefcase, Linkedin, MessageCircle, Loader2 } from "lucide-react";
import { RequestDialog } from "./RequestDialog";
import { conversationService } from "@/lib/services/conversationService";
import { toast } from "sonner";

export interface Mentor {
    id: string;
    user_id?: string | null;
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

const IMAGE_MAP: Record<string, string> = {
    "Deepak Pandey": "/images/team/deepak.jpeg",
    "Parisha Sharma": "/images/team/parisha.jpeg",
    "Akshay Kumar": "/images/team/akshay.jpg",
};

export function MentorCard({ mentor }: MentorCardProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const initials = `${mentor.first_name[0]}${mentor.last_name[0]}`;
    const fullName = `${mentor.first_name} ${mentor.last_name}`;
    const imageSrc = IMAGE_MAP[fullName] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.id}`;

    const handleMessage = async () => {
        if (!mentor.user_id) return;

        setLoading(true);
        try {
            const conversation = await conversationService.getOrCreateMentorshipConversation(mentor.user_id);
            router.push(`/protected/messages?conversation=${conversation.id}`);
        } catch (error) {
            console.error("Failed to start conversation:", error);
            toast.error("Failed to start conversation. Please try again.");
        } finally {
            setLoading(false);
        }
    };

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
                            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 group-hover:text-primary transition-colors">
                                {mentor.first_name} {mentor.last_name}
                            </h3>
                            <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                                {mentor.occupation} at {mentor.company}
                            </div>
                        </div>
                    </div>
                    {mentor.linkedin && (
                        <a
                            href={mentor.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-400 hover:text-[#0077b5] transition-colors"
                        >
                            <Linkedin className="w-5 h-5" />
                        </a>
                    )}
                </div>
            </CardHeader>

            <CardContent className="px-6 py-2 flex-grow space-y-4">
                <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 line-clamp-2 mb-3">
                        {mentor.expertise}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {mentor.expertise_areas.slice(0, 3).map((area) => (
                            <Badge
                                key={area}
                                variant="secondary"
                                className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            >
                                {area.replace("-", " ")}
                            </Badge>
                        ))}
                        {mentor.expertise_areas?.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                                +{mentor.expertise_areas.length - 3} more
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
                        {mentor.mentoring_types.map((type) => (
                            <span key={type} className="flex items-center">
                                • {type.replace("-", " ")}
                            </span>
                        ))}
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-6 pt-2">
                {mentor.user_id ? (
                    <Button
                        className="w-full bg-primary/10 hover:bg-primary/20 text-primary border-0 shadow-none"
                        onClick={handleMessage}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Connecting...
                            </>
                        ) : (
                            <>
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Message Mentor
                            </>
                        )}
                    </Button>
                ) : (
                    <RequestDialog
                        mentorName={fullName}
                        mentorId={mentor.id}
                        trigger={
                            <Button className="w-full bg-primary/10 text-primary hover:bg-primary/20 shadow-none border-0">
                                Request Mentorship
                            </Button>
                        }
                    />
                )}
            </CardFooter>
        </Card>
    );
}
