"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Github, Linkedin, Users } from "lucide-react";
import Image from "next/image";

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
      name: "Deepak",
      role: "Founder",
      image: "/images/team/deepak.jpeg",
      description: "Leading the vision and direction of Codeunia, bringing innovation to coding education.",
      badge: "Leadership",
      socials: {
        github: "https://github.com/848deepak",
        linkedin: "https://www.linkedin.com/in/848deepak/"
      }
    },
    {
      name: "Parisha",
      role: "Co-Founder and Operations Lead",
      image: "/images/team/parisha.jpeg",
      description: "Driving operational excellence and strategic initiatives at Codeunia.",
      badge: "Leadership",
      socials: {
        github: "https://github.com/848Parisha",
        linkedin: "https://www.linkedin.com/in/parishasharma93/"
      }
    },
    {
      name: "Akshay Kumar",
      role: "Web Development Lead",
      image: "/images/team/akshay.jpg",
      description: "Leading the development of our web platform, ensuring scalable architecture and seamless user experience through modern technologies.",
      badge: "Web Dev",
      socials: {
        github: "https://github.com/akshay0611",
        linkedin: "https://www.linkedin.com/in/akshaykumar0611/"
      }
    },
    {
      name: "Sahil",
      role: "Project Development Lead",
       image: "/images/team/sahil.jpeg",
      description: "Coordinating project development and ensuring successful delivery of learning initiatives.",
      badge: "Development",
      socials: {
        github: "https://github.com/kaikon100x",
        linkedin: "https://www.linkedin.com/in/sahil4k00"
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
                                  <div className="relative h-64 overflow-hidden bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                                      <motion.div
                                          className="relative w-full h-full"
                                          whileHover={{ scale: 1.1 }}
                                          transition={{ duration: 0.6 }}
                                      >
                                          <Image
                                              src={member.image}
                                              alt={member.name}
                                              fill
                                              className="object-cover object-top"
                                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                          />
                                      </motion.div>
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                                      <div className="absolute bottom-4 left-4 right-4">
                                          <h3 className="text-white font-bold text-lg">
                                              {member.name}
                                          </h3>
                                          <p className="text-white text-sm">
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