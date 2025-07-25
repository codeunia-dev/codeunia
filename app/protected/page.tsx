import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sparkles, Rocket, Shield, User, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MembershipCard from "@/components/MembershipCard";
export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/signin");
  }

  const firstName = data.user.user_metadata?.first_name || "";
  const lastName = data.user.user_metadata?.last_name || "";
  const displayName = firstName || lastName ? `${firstName} ${lastName}`.trim() : "there";

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-6 max-w-4xl mx-auto">
     <div>
        <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow">
          ← Go Back
        </Link>
      </div>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-2xl"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent rounded-2xl"></div>
        
        {/* <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-200">Protected Area</h3>
              <p className="text-sm text-green-600 dark:text-green-400">Authentication verified</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <InfoIcon size="16" strokeWidth={2} className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-700 dark:text-green-300">
              This is a protected page that you can only see as an authenticated user. Your session is secure and verified.
            </p>
          </div>
        </div> */}
      </div>

      
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
              Welcome back, {displayName}!
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 font-medium">
              Ready to explore Codeunia
            </p>
          </div>
        </div>

        {/* Membership Card Section */}
        <div className="flex justify-center my-8">
          <MembershipCard uid={data.user.id} />
        </div>

       
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-red-900/20 border border-yellow-200 dark:border-yellow-700/50 p-6 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded-xl">
                <Rocket className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-200">
                    Something Big is Coming
                  </h3>
                  <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
                </div>
                <p className="text-yellow-700 dark:text-yellow-300 leading-relaxed">
                  Our user panel is under active development. We&apos;re crafting an amazing experience just for you. 
                  <span className="font-semibold"> Stay tuned for exciting updates!</span>
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                    Development in progress
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

       
        {/* Profile Settings Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Customize Your Profile
            </CardTitle>
            <CardDescription>
              Add your information, social links, and customize how others see you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/protected/profile" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Manage Profile
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="group p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Secure Dashboard</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Advanced security features and personalized dashboard coming soon.</p>
          </div>

          <div className="group p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Smart Features</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered tools and intelligent recommendations tailored for you.</p>
          </div>

          <div className="group p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-green-300 dark:hover:border-green-600 transition-all duration-300">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Rocket className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Performance</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Lightning-fast performance with real-time updates and analytics.</p>
          </div>
        </div>
      </div>
    </div>
  );
}