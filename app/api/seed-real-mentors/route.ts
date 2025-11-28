import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = 'nodejs';

function getSupabaseClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

const REAL_MENTORS = [
    {
        first_name: "Deepak",
        last_name: "Pandey",
        email: "deepak@codeunia.com",
        phone: "",
        location: "India",
        occupation: "Founder & Tech Lead",
        company: "Codeunia",
        experience: "Full-stack engineer turned founder. Built Codeunia's platform from the ground up. Deep experience in scaling ed-tech products and engineering teams.",
        expertise: "Full Stack Development, System Architecture, Startup Engineering, Product Strategy",
        linkedin: "https://www.linkedin.com/in/848deepak/",
        expertise_areas: ["system-design", "web-development", "cloud-computing"],
        mentoring_types: ["career-advice", "project-guidance", "system-design"],
        availability: "flexible",
        commitment: "occasional",
        motivation: "Helping developers bridge the gap between coding tutorials and building production-ready software.",
        previous_mentoring: "Guided 100+ students in their transition to professional software engineering roles.",
        teaching_style: "Focus on first principles and architectural thinking.",
        status: "approved"
    },
    {
        first_name: "Parisha",
        last_name: "Sharma",
        email: "parisha@codeunia.com",
        phone: "",
        location: "India",
        occupation: "Co-Founder & Operations Lead",
        company: "Codeunia",
        experience: "Specialist in tech operations and team dynamics. Expert in helping developers navigate their career paths, negotiate offers, and build leadership skills.",
        expertise: "Tech Management, Career Strategy, Soft Skills, Agile Methodologies",
        linkedin: "https://www.linkedin.com/in/parishasharma93/",
        expertise_areas: ["ui-ux", "project-management"], // Mapped to closest available or generic
        mentoring_types: ["career-advice", "interview-prep", "one-on-one"],
        availability: "weekends",
        commitment: "regular",
        motivation: "Ensuring developers have the soft skills and strategic mindset needed to succeed in the industry.",
        previous_mentoring: "Career coach for early-stage professionals.",
        teaching_style: "Empathetic, structured, and goal-oriented coaching.",
        status: "approved"
    },
    {
        first_name: "Akshay",
        last_name: "Kumar",
        email: "akshay.allen26200@gmail.com",
        phone: "",
        location: "India",
        occupation: "Web Development Lead",
        company: "Codeunia",
        experience: "Senior Frontend Engineer with a focus on performance and user experience. Architected the core learning platform using Next.js and React Server Components.",
        expertise: "Advanced React, Next.js, Frontend Architecture, Web Performance",
        linkedin: "https://www.linkedin.com/in/akshaykumar0611/",
        expertise_areas: ["web-development", "ui-ux", "system-design"],
        mentoring_types: ["code-reviews", "project-guidance", "one-on-one"],
        availability: "evenings",
        commitment: "intensive",
        motivation: "Passionate about writing clean, maintainable code and teaching modern web standards.",
        previous_mentoring: "Lead code reviewer and technical mentor for Codeunia interns.",
        teaching_style: "Hands-on pair programming and detailed code reviews.",
        status: "approved"
    }
];

export async function GET() {
    const supabase = getSupabaseClient();

    // 1. Delete existing mentors to reset data
    const { error: deleteError } = await supabase
        .from("mentor_applications")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

    if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // 2. Insert refined mentors
    const { data, error } = await supabase
        .from("mentor_applications")
        .insert(REAL_MENTORS)
        .select();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: data.length, data });
}
