import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Construction, ArrowLeft, Clock } from "lucide-react";

export default function ProtectedFallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-2xl mx-auto">
        {/* Animated icon container */}
        <div className="relative mx-auto mb-8">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 blur-lg opacity-20 animate-pulse"></div>
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-600 dark:text-yellow-400 shadow-lg">
            <Construction className="w-10 h-10 animate-bounce" />
          </div>
        </div>

        {/* Main heading with gradient text */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 dark:from-slate-100 dark:via-white dark:to-slate-100 bg-clip-text text-transparent">
          Under Construction
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-6 font-medium">
          We&apos;re crafting something amazing
        </p>

        {/* Description with better spacing */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-8 mb-8 shadow-xl border border-white/20 dark:border-slate-700/50">
          <div className="flex items-center justify-center mb-4">
            <Clock className="w-5 h-5 text-blue-500 mr-2" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Coming Soon
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
            This section is under active development. Our team is working hard to bring you 
            new features and improvements. Check back soon for updates!
          </p>
        </div>

        {/* Enhanced button */}
        <div className="flex items-center justify-center">
          <Button 
            asChild 
            size="lg"
            className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <Link href="/protected" className="flex items-center px-6 py-3">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full opacity-20 animate-ping"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-indigo-400 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-25 animate-bounce"></div>
      </div>
    </div>
  );
}