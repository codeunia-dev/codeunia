"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Rocket, Users, Sparkles, Code, Globe } from "lucide-react"
import { Vortex } from "@/components/ui/vortex"

export function HeroSection() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
    
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/10"></div>
      
     
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-500/15 to-primary/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/3 left-1/4 w-40 h-40 bg-gradient-to-r from-purple-500/10 to-primary/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

    
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(120, 119, 198, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(120, 119, 198, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* main content starts from ghere*/}
      <div className="container px-4 relative z-10 mx-auto">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          
          <div className="animate-fade-in">
            <Badge 
              variant="secondary" 
              className="mb-4 px-4 py-2 text-sm font-medium shadow-xl bg-background/95 backdrop-blur-md border border-primary/20 relative overflow-hidden group hover:scale-105 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="mr-2 text-lg">🚀</span>
              <span className="relative z-10 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent font-semibold">
                Next-Gen Coding Community
              </span>
            </Badge>
          </div>

         
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight relative group">
              <span className="bg-gradient-to-r from-foreground via-primary to-purple-600 bg-clip-text text-transparent">
                Empowering the Next Generation of{" "}
              </span>
              <span className="relative inline-block bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent animate-pulse">
                Coders
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-primary/60 animate-spin" style={{ animationDuration: '3s' }} />
                <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-lg blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
              </span>
            </h1>
          </div>

         
          <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto relative">
              <span className="bg-gradient-to-r from-muted-foreground to-muted-foreground/80 bg-clip-text text-transparent">
                Real-world projects, curated challenges, a vibrant dev community. Join thousands of developers building
                the future together across the globe.
              </span>
            </p>
          </div>

         
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-in relative z-20" style={{ animationDelay: '0.6s' }}>
            <Button
              size="lg"
              className="px-8 py-6 text-lg font-semibold shadow-2xl hover:shadow-3xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-purple-600/90 backdrop-blur-sm relative overflow-hidden group transition-all duration-300 hover:scale-105 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Rocket className="mr-3 h-6 w-6 relative z-10 group-hover:animate-pulse" />
              <span className="relative z-10">Explore Projects</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-full group-hover:translate-x-[-100%] transition-transform duration-700" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="px-8 py-6 text-lg font-semibold hover:bg-primary/10 bg-background/95 backdrop-blur-md border border-primary/30 hover:border-primary/50 relative overflow-hidden group shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Users className="mr-3 h-6 w-6 relative z-10 group-hover:animate-pulse" />
              <span className="relative z-10 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent group-hover:from-primary group-hover:to-purple-600">
                Join Community
              </span>
            </Button>
          </div>

         
          <div className="relative z-10">
            <Vortex
              className="absolute inset-0 pointer-events-none"
              particleCount={500}
              baseHue={280}
              baseSpeed={0.3}
              rangeSpeed={1}
              baseRadius={1}
              rangeRadius={2}
              rangeY={200}
              backgroundColor="transparent"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 max-w-4xl mx-auto animate-fade-in relative z-10" style={{ animationDelay: '0.8s' }}>
              {[
                { value: "50K+", label: "Active Developers", icon: Users, gradient: "from-blue-500 to-purple-600" },
                { value: "1.2K+", label: "Projects Built", icon: Code, gradient: "from-green-500 to-blue-500" },
                { value: "200+", label: "Events Hosted", icon: Sparkles, gradient: "from-purple-500 to-pink-500" },
                { value: "95%", label: "Success Rate", icon: Globe, gradient: "from-orange-500 to-red-500" }
              ].map((stat, index) => (
                <div 
                  key={index}
                  className="text-center space-y-3 p-6 rounded-2xl bg-background/80 backdrop-blur-md border border-primary/20 hover:border-primary/40 transition-all duration-500 group relative overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105 hover:-translate-y-2"
                  style={{ animationDelay: `${0.9 + index * 0.1}s` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10">
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r ${stat.gradient} p-3 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <div className={`text-2xl md:text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent relative z-10 group-hover:scale-110 transition-transform duration-300`}>
                    {stat.value}
                  </div>
                  
                  <div className="text-sm text-muted-foreground relative z-10 group-hover:text-foreground/80 transition-colors duration-300">
                    {stat.label}
                  </div>
                  
                  
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-full group-hover:translate-x-[-100%] transition-transform duration-1000" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  )
}