"use client";

import { motion } from "framer-motion";
import { Handshake } from "lucide-react";
import Image from "next/image";

const sponsors = [
  {
    name: "Webytes",
    title: "Community Engagement Partner",
    logo: "/images/sponsors/webytes.png",
    link: "https://www.webytes.club/"
  },
    {
        name: "GeeksforGeeks",
        title: "Knowledge & Learning Partner",
        logo: "/images/sponsors/geekforgeeks.png",
        link: "https://www.geeksforgeeks.org/"
    },
    {
        name: "GeeksforGeeks Student Chapter- Chandigarh University",
        title: "Community Engagement Partner",
        logo: "/images/sponsors/studentchaptercu.png",
        link: "https://www.linkedin.com/company/gfgstudentchaptercu/"
    },
    {
        name: "Alexa Developer Community- Chandigarh University",
        title: "Community Engagement Partner",
        logo: "/images/sponsors/alexadevcommunity.png",
        link: "https://www.linkedin.com/company/alexa-developer-community-cu/"
    },
    {
        name: "Rotaract - Chandigarh University",
        title: "Community Engagement Partner",
        logo: "/images/sponsors/rotaract.png",
        link: "https://www.instagram.com/rotaract.cu/"
    },
    {
        name: "Unstop",
        title: "Technology Partner",
        logo: "/images/sponsors/unstop.png",
        link: "https://unstop.com/"
    },
    {
        name: "Code Crafters",
        title: "Upskilling Partner",
        logo: "/images/sponsors/codecrafter.png",
        link: "https://codecrafters.io/"
    },
];

export function SponsorsSection() {
  return (
      <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.05),transparent_70%)]"></div>
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
                                  <span>Our Sponsors</span>
                                  <span>
                                      <Handshake className="w-3 h-3" />
                                  </span>
                              </div>
                              <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
                          </button>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-bold">
                          Proudly Supported by{" "}
                          <span className="gradient-text">
                              Industry Leaders
                          </span>
                      </h2>
                      <p className="text-xl text-muted-foreground">
                          We&apos;re grateful for the support of these amazing
                          companies who share our vision for accessible coding
                          education.
                      </p>
                  </motion.div>

                  <div className="relative w-full overflow-hidden">
                      <div className="flex animate-scroll gap-8 py-4">
                          {sponsors.map((sponsor, idx) => (
                              sponsor.link ? (
                                <a
                                  key={`first-${idx}`}
                                  href={sponsor.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="no-underline"
                                >
                                  <motion.div
                                    className="flex-shrink-0 w-[300px] h-[200px] rounded-xl border border-primary/10 bg-background/50 backdrop-blur-sm p-2 flex flex-col items-center justify-center gap-4 hover:border-primary/20 transition-all duration-300 hover:shadow-lg group"
                                    whileHover={{ y: -5 }}
                                  >
                                    <div
                                      className={
                                        "relative w-full h-48 flex items-center justify-center"
                                      }
                                    >
                                      <Image
                                        src={sponsor.logo}
                                        alt={sponsor.name}
                                        fill
                                        className={
                                          sponsor.name === "Unstop"
                                            ? "object-contain p-4"
                                            : sponsor.name === "Code Crafters"
                                              ? "object-contain w-32 h-16 mx-auto"
                                              : "object-cover"
                                        }
                                      />
                                    </div>
                                    <div className="text-center">
                                      <h3 className="font-semibold text-lg">
                                        {sponsor.name}
                                      </h3>
                                      <p className="text-sm text-muted-foreground">
                                        {sponsor.title}
                                      </p>
                                    </div>
                                  </motion.div>
                                </a>
                              ) : (
                                <motion.div
                                  key={`first-${idx}`}
                                  className="flex-shrink-0 w-[300px] h-[200px] rounded-xl border border-primary/10 bg-background/50 backdrop-blur-sm p-2 flex flex-col items-center justify-center gap-4 hover:border-primary/20 transition-all duration-300 hover:shadow-lg group"
                                  whileHover={{ y: -5 }}
                                >
                                  <div
                                    className={
                                      "relative w-full h-48 flex items-center justify-center"
                                    }
                                  >
                                    <Image
                                      src={sponsor.logo}
                                      alt={sponsor.name}
                                      fill
                                      className={
                                        sponsor.name === "Unstop"
                                          ? "object-contain p-4"
                                          : sponsor.name === "Code Crafters"
                                            ? "object-contain w-32 h-16 mx-auto"
                                            : "object-cover"
                                      }
                                    />
                                  </div>
                                  <div className="text-center">
                                    <h3 className="font-semibold text-lg">
                                      {sponsor.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                      {sponsor.title}
                                    </p>
                                  </div>
                                </motion.div>
                              )
                          ))}

                          {sponsors.map((sponsor, idx) => (
                              sponsor.link ? (
                                <a
                                  key={`second-${idx}`}
                                  href={sponsor.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="no-underline"
                                >
                                  <motion.div
                                    className="flex-shrink-0 w-[300px] h-[200px] rounded-xl border border-primary/10 bg-background/50 backdrop-blur-sm p-2 flex flex-col items-center justify-center gap-4 hover:border-primary/20 transition-all duration-300 hover:shadow-lg group"
                                    whileHover={{ y: -5 }}
                                  >
                                    <div
                                      className={
                                        "relative w-full h-48 flex items-center justify-center"
                                      }
                                    >
                                      <Image
                                        src={sponsor.logo}
                                        alt={sponsor.name}
                                        fill
                                        className={
                                          sponsor.name === "Unstop"
                                            ? "object-contain p-4"
                                            : sponsor.name === "Code Crafters"
                                              ? "object-contain w-32 h-16 mx-auto"
                                              : "object-cover"
                                        }
                                      />
                                    </div>
                                    <div className="text-center">
                                      <h3 className="font-semibold text-lg">
                                        {sponsor.name}
                                      </h3>
                                      <p className="text-sm text-muted-foreground">
                                        {sponsor.title}
                                      </p>
                                    </div>
                                  </motion.div>
                                </a>
                              ) : (
                                <motion.div
                                  key={`second-${idx}`}
                                  className="flex-shrink-0 w-[300px] h-[200px] rounded-xl border border-primary/10 bg-background/50 backdrop-blur-sm p-2 flex flex-col items-center justify-center gap-4 hover:border-primary/20 transition-all duration-300 hover:shadow-lg group"
                                  whileHover={{ y: -5 }}
                                >
                                  <div
                                    className={
                                      "relative w-full h-48 flex items-center justify-center"
                                    }
                                  >
                                    <Image
                                      src={sponsor.logo}
                                      alt={sponsor.name}
                                      fill
                                      className={
                                        sponsor.name === "Unstop"
                                          ? "object-contain p-4"
                                          : sponsor.name === "Code Crafters"
                                            ? "object-contain w-32 h-16 mx-auto"
                                            : "object-cover"
                                      }
                                    />
                                  </div>
                                  <div className="text-center">
                                    <h3 className="font-semibold text-lg">
                                      {sponsor.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                      {sponsor.title}
                                    </p>
                                  </div>
                                </motion.div>
                              )
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      </section>
  );
}