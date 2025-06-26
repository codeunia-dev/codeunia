import { AnimatedTestimonials } from "@/components/ui/animated-testimonials"
import { Megaphone } from "lucide-react"

export function CommunitySpotlight() {
  const testimonials = [
    {
      quote: "Codeunia is not just another platform — it’s a movement. A new-age community that's bringing hackathons and innovation culture right down to the grassroots. It’s inspiring to see this kind of impact in real time!",
      name: "Ankul Kumar",
      designation: "President at Rotaract Club of Chandigarh University",
      src: "/images/testimonials/anshul.jpeg"
    },
    {
        quote: "Participated into my first hackathon through Codeunia! The community support was amazing throughout the event.",
        name: "Simran",
        designation: "Student at Chitkara",
       src: "/images/testimonials/simran.jpeg"
    }
  ];

  return (
      <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10"></div>
          <div className="container px-4 relative z-10 mx-auto">
              <div className="text-center space-y-4 mb-12">
                  <div className="flex flex-col items-center justify-center gap-2">
                      <button className="bg-slate-800 no-underline group relative shadow-2xl shadow-zinc-900 rounded-full p-px text-sm font-semibold leading-6 text-white inline-block">
                          <span className="absolute inset-0 overflow-hidden rounded-full">
                              <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                          </span>

                          {/* 👇 This part disables cursor */}
                          <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10 cursor-default">
                              <span>Community Voices</span>
                              <Megaphone className="w-3 h-3" />
                          </div>

                          <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
                      </button>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold animate-fade-in">
                      What Our{" "}
                      <span className="gradient-text bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                          Community
                      </span>{" "}
                      Says
                  </h2>
                  <p className="text-xl text-muted-foreground animate-fade-in-up">
                      Hear from developers who&apos;ve transformed their careers
                      with Codeunia
                  </p>
              </div>

              <AnimatedTestimonials
                  testimonials={testimonials}
                  autoplay={true}
              />
          </div>
      </section>
  );
} 