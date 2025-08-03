"use client";

import { Code2, Trophy, BookOpen, MessageSquare, Users, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export function FeaturesSection() {
  const features = [
    {
      icon: Code2,
      title: "Real-world Projects",
      description: "Work on actual projects that matter. Build your portfolio with meaningful contributions that make a real impact.",
      gradient: "from-blue-500 to-indigo-600",
      bgImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      hoverGradient: "from-blue-400 to-indigo-500"
    },
    {
      icon: Trophy,
      title: "Hackathon Listings",
      description: "Discover and participate in hackathons worldwide. Compete, learn, and win amazing prizes while building innovative solutions.",
      gradient: "from-amber-500 to-orange-600",
      bgImage: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      hoverGradient: "from-amber-400 to-orange-500"
    },
    {
      icon: BookOpen,
      title: "Curated Learning Paths",
      description: "Follow structured learning paths designed by industry experts to master new technologies and advance your career.",
      gradient: "from-emerald-500 to-teal-600",
      bgImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      hoverGradient: "from-emerald-400 to-teal-500"
    },
    {
      icon: MessageSquare,
      title: "Blogs & Writeups",
      description: "Read and share technical articles, tutorials, and insights from the community. Learn from experienced developers.",
      gradient: "from-purple-500 to-pink-600",
      bgImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      hoverGradient: "from-purple-400 to-pink-500"
    },
    {
      icon: Users,
      title: "Mentorship & Forums",
      description: "Connect with mentors and peers. Get help, share knowledge, and grow together in a supportive environment.",
      gradient: "from-rose-500 to-red-600",
      bgImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      hoverGradient: "from-rose-400 to-red-500"
    },
    {
      icon: Star,
      title: "Community Recognition",
      description: "Earn badges, climb leaderboards, and get recognized for your contributions to the developer community.",
      gradient: "from-violet-500 to-purple-600",
      bgImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      hoverGradient: "from-violet-400 to-purple-500"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
      }
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
     
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08),transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(99,102,241,0.03)_0deg,transparent_60deg,rgba(147,51,234,0.03)_120deg,transparent_180deg,rgba(59,130,246,0.03)_240deg,transparent_300deg,rgba(99,102,241,0.03)_360deg)]"></div>
      
      
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>

      <div className="container px-4 mx-auto relative z-10">
        <motion.div 
          className="text-center space-y-6 mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <motion.button 
              className="bg-slate-800/90 backdrop-blur-sm no-underline group relative shadow-2xl shadow-zinc-900/50 rounded-full p-px text-sm font-semibold leading-6 text-white inline-block cursor-default border border-slate-700/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="absolute inset-0 overflow-hidden rounded-full">
                <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.8)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </span>
              <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950/90 py-0.5 px-4 ring-1 ring-white/20">
                <span className="text-white/90">Platform Features</span>
                <Star className="w-3 h-3 text-emerald-400" />
              </div>
              <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-60" />
            </motion.button>
          </div>
          <motion.h2 
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Why Choose{" "}
            <span className="gradient-text bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-pink-600">
              Codeunia
            </span>
            ?
          </motion.h2>
          <motion.p 
            className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Everything you need to grow as a developer in one comprehensive platform
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="max-w-sm w-full mx-auto group"
              whileHover={{ 
                y: -8,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
            >
              <div
                className={cn(
                  "relative w-full cursor-pointer overflow-hidden card h-[320px] rounded-2xl shadow-xl mx-auto flex flex-col border border-white/10",
                  "bg-cover bg-center backdrop-blur-sm",
                  "before:absolute before:inset-0 before:bg-gradient-to-t before:from-black/85 before:via-black/60 before:to-black/20 before:transition-all before:duration-500",
                  "after:absolute after:inset-0 after:bg-gradient-to-t after:from-black/70 after:via-black/30 after:to-transparent after:opacity-0 after:transition-all after:duration-500",
                  "hover:before:from-black/95 hover:before:via-black/75 hover:before:to-black/30 hover:after:opacity-100",
                  "hover:shadow-2xl hover:shadow-black/30 hover:border-white/20",
                  "transform transition-all duration-500"
                )}
                style={{
                  backgroundImage: `url(${feature.bgImage})`,
                }}
              >
                
                <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/90 via-black/70 to-transparent"></div>
                
               
                <div className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-15 transition-all duration-500 rounded-2xl",
                  `bg-gradient-to-br ${feature.gradient}`
                )}></div>
                
                
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>

                <div className="text relative z-50 p-8 mt-auto">
                  <motion.div 
                    className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-2xl backdrop-blur-sm border border-white/20",
                      `bg-gradient-to-br ${feature.gradient} group-hover:${feature.hoverGradient}`,
                      "transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                    )}
                    whileHover={{ 
                      rotate: [0, -10, 10, 0],
                      transition: { duration: 0.5 }
                    }}
                  >
                    <feature.icon className="h-7 w-7 text-white drop-shadow-lg" />
                  </motion.div>
                  
                  <h3 className="font-bold text-xl md:text-2xl text-white relative drop-shadow-2xl mb-3 group-hover:text-white transition-colors duration-300" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                    {feature.title}
                  </h3>
                  
                  <p className="font-normal text-base text-gray-50 relative drop-shadow-xl leading-relaxed group-hover:text-white transition-colors duration-300" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                    {feature.description}
                  </p>

                  {/* dots over images  */}
                  {/* <div className={cn(
                    "absolute top-6 right-6 w-3 h-3 rounded-full opacity-60 group-hover:opacity-100 transition-all duration-500",
                    `bg-gradient-to-br ${feature.gradient}`
                  )}></div> */}
                </div>

                
                <div className={cn(
                  "absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-all duration-500",
                  `bg-gradient-to-r ${feature.gradient}`
                )}></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}