"use client";

import { useState, useEffect } from "react";
import { MentorCard, Mentor } from "./components/MentorCard";
import { MentorshipFilters } from "./components/MentorshipFilters";
import { apiFetch } from "@/lib/api-fetch";
import { Loader2, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

export default function MentorshipPage() {
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [expertise, setExpertise] = useState("all");
    const [type, setType] = useState("all");

    useEffect(() => {
        const fetchMentors = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (search) params.append("search", search);
                if (expertise !== "all") params.append("expertise", expertise);
                if (type !== "all") params.append("type", type);

                const res = await apiFetch(`/api/mentors?${params.toString()}`);
                const data = await res.json();
                if (data.mentors) {
                    setMentors(data.mentors);
                }
            } catch (error) {
                console.error("Failed to fetch mentors:", error);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(fetchMentors, 300);
        return () => clearTimeout(debounce);
    }, [search, expertise, type]);

    return (
        <div className="min-h-screen bg-black p-6 md:p-8 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <GraduationCap className="h-8 w-8 text-primary" />
                    Find a Mentor
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                    Connect with experienced professionals who can guide you on your journey.
                    Filter by expertise or mentoring style to find the perfect match.
                </p>
            </div>

            <MentorshipFilters
                search={search}
                setSearch={setSearch}
                expertise={expertise}
                setExpertise={setExpertise}
                type={type}
                setType={setType}
            />

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : mentors.length === 0 ? (
                <div className="text-center py-20">
                    <div className="bg-muted/30 rounded-full p-6 inline-block mb-4">
                        <GraduationCap className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No mentors found</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        We couldn&apos;t find any mentors matching your criteria. Try adjusting your filters or search terms.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {mentors.map((mentor, index) => (
                        <motion.div
                            key={mentor.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <MentorCard mentor={mentor} />
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
