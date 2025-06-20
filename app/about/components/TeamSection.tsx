"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Github, Linkedin, Users } from "lucide-react";

interface TeamMember {
  name: string;
  role: string;
  image: string;
  description: string;
  badge: string;
  socials: {
    github: string;
    linkedin: string;
  };
}

export function TeamSection() {
  const team: TeamMember[] = [
    {
      name: "Deepak Pandey",
      role: "Founder",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      description: "Leading the vision and direction of Codeunia, bringing innovation to coding education.",
      badge: "Leadership",
      socials: {
        github: "https://github.com/848deepak",
        linkedin: "https://www.linkedin.com/in/848deepak/"
      }
    },
    {
      name: "Parisha Rani",
      role: "Co-Founder and Operations Lead",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      description: "Driving operational excellence and strategic initiatives at Codeunia.",
      badge: "Leadership",
      socials: {
        github: "https://github.com/848Parisha",
        linkedin: "https://www.linkedin.com/in/parishasharma93/"
      }
    },
    {
      name: "Aayush Bhardwaj",
      role: "Strategy & Outreach Lead",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      description: "Developing strategic partnerships and expanding our reach in the coding education space.",
      badge: "Strategy",
      socials: {
        github: "https://github.com/AayuBhardwajj",
        linkedin: "https://www.linkedin.com/in/aayushbhardwaj0001"
      }
    },
    {
      name: "Keshav Datta",
      role: "Community Operations Lead",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      description: "Coordinating and managing community operations to foster engagement and growth.",
      badge: "Community",
      socials: {
        github: "https://github.com/Keshav-datta",
        linkedin: "https://www.linkedin.com/in/keshav-datta-3b3623289"
      }
    },
    {
      name: "Anurag Shekhawat",
      role: "Technical Lead",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      description: "Leading technical innovation and development at Codeunia.",
      badge: "Technology",
      socials: {
        github: "https://github.com/anuragshekhawat1234",
        linkedin: "https://www.linkedin.com/in/anurag-shekhawat-33214828b"
      }
    },
    {
      name: "Nidhi Gupta",
      role: "Resource and Finance Coordinator",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      description: "Managing resources and financial operations to ensure sustainable growth.",
      badge: "Operations",
      socials: {
        github: "https://github.com/NidhiiiGupta",
        linkedin: "https://www.linkedin.com/in/nidhi-gupta15/"
      }
    },
    {
      name: "Tanvi Sharma",
      role: "Marketing and Communications Lead",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      description: "Crafting our brand story and driving engagement through strategic communications.",
      badge: "Marketing",
      socials: {
        github: "https://github.com/tanvisharma154",
        linkedin: "https://www.linkedin.com/in/tanvi-sharma-8a686a28a/"
      }
    },
    {
      name: "Sahil",
      role: "Project Development Coordinator",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      description: "Coordinating project development and ensuring successful delivery of learning initiatives.",
      badge: "Development",
      socials: {
        github: "https://github.com/kaikon100x",
        linkedin: "https://www.linkedin.com/in/sahil4k00"
      }
    },
    {
      name: "Mehakpreet Kaur",
      role: "Design Lead",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      description: "Creating beautiful and intuitive user experiences through thoughtful design.",
      badge: "Design",
      socials: {
        github: "https://github.com/Cybexpmehakpreetkaur",
        linkedin: "https://www.linkedin.com/in/mehakpreet-kaur-769b08315?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
      }
    },
    {
      name: "Ayush Chauhan",
      role: "Video Editor",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      description: "Crafting engaging video content to enhance our learning experience.",
      badge: "Content",
      socials: {
        github: "https://github.com/ayushmgg",
        linkedin: "https://www.linkedin.com/in/ayush-chauh%C3%A0n-0065b1289?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
      }
    },
    {
      name: "Spandan Sarkar",
      role: "Video Editor",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      description: "Creating compelling visual stories to make learning more engaging.",
      badge: "Content",
      socials: {
        github: "https://github.com/spandan0002",
        linkedin: "https://www.linkedin.com/in/spandan-sarkar-ab346b28a/"
      }
    },
  ];

  return (
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.05),transparent_70%)]"></div>
          <div className="container px-4 mx-auto relative z-10">
              <div className="max-w-4xl mx-auto space-y-12">
                  <motion.div
                      className="text-center space-y-6"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      viewport={{ once: true }}
                  >
                      <div className="flex flex-col items-center justify-center gap-4">
                          <button className="bg-slate-800 no-underline group relative shadow-2xl shadow-zinc-900 rounded-full p-px text-sm font-semibold leading-6 text-white inline-block cursor-default">
                              <span className="absolute inset-0 overflow-hidden rounded-full">
                                  <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                              </span>
                              <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10">
                                  <span>Meet Our Team</span>
                                  <span>
                                      <Users className="w-3 h-3" />
                                  </span>
                              </div>
                              <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
                          </button>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-bold">
                          The <span className="gradient-text">People</span>{" "}
                          Behind Codeunia
                      </h2>
                      <p className="text-xl text-muted-foreground">
                          Passionate individuals dedicated to transforming
                          coding education.
                      </p>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {team.map((member, index) => (
                          <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 30 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.6, delay: index * 0.1 }}
                              viewport={{ once: true }}
                              whileHover={{
                                  y: -12,
                                  transition: { duration: 0.3 },
                              }}
                          >
                              <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden h-full group">
                                  <div className="relative h-64 overflow-hidden">
                                      <motion.img
                                          src={member.image}
                                          alt={member.name}
                                          className="w-full h-full object-cover"
                                          whileHover={{ scale: 1.1 }}
                                          transition={{ duration: 0.6 }}
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                                      <div className="absolute bottom-4 left-4 right-4">
                                          <h3 className="text-white font-bold text-lg">
                                              {member.name}
                                          </h3>
                                          <p className="text-primary-foreground/80 text-sm">
                                              {member.role}
                                          </p>
                                      </div>
                                  </div>
                                  <CardContent className="p-6">
                                      <div className="flex items-center justify-between mb-4">
                                          <Badge className="bg-primary/90 text-white border-0">
                                              {member.badge}
                                          </Badge>
                                          <div className="flex items-center space-x-2">
                                              <motion.a
                                                  href={member.socials.github}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                                                  whileHover={{ scale: 1.1 }}
                                                  whileTap={{ scale: 0.95 }}
                                              >
                                                  <Github className="w-4 h-4 text-primary" />
                                              </motion.a>
                                              <motion.a
                                                  href={member.socials.linkedin}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                                                  whileHover={{ scale: 1.1 }}
                                                  whileTap={{ scale: 0.95 }}
                                              >
                                                  <Linkedin className="w-4 h-4 text-primary" />
                                              </motion.a>
                                          </div>
                                      </div>
                                      <p className="text-muted-foreground leading-relaxed">
                                          {member.description}
                                      </p>
                                  </CardContent>
                              </Card>
                          </motion.div>
                      ))}
                  </div>
              </div>
          </div>
      </section>
  );
} 