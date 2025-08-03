import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserActivityLog } from "@/components/global-leaderboard/UserActivityLog";

export default async function ActivityLogPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-6 max-w-4xl mx-auto">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full mb-4">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-green-600 to-blue-600 dark:from-white dark:via-green-200 dark:to-blue-200 bg-clip-text text-transparent">
              Activity Log
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 font-medium">
              Track your engagement and points earned
            </p>
          </div>
        </div>

        {/* Activity Log Component */}
        <div className="relative">
          <UserActivityLog userId={data.user.id} />
        </div>
      </div>
    </div>
  );
} 