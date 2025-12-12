import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

// Capitalization helper
function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

// Staff content wrapper - Client Component would be better but keeping it simple for now
import StaffDashboardPage from "../staff/dashboard/page";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/signin");
  }

  // Fetch user profile from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, role')
    .eq('id', data.user.id)
    .single();

  // Role check logic
  const isStaff = profile?.role === 'staff';

  if (isStaff) {
    redirect("/staff/dashboard");
  }

  // Use first_name from profiles table, with fallback
  const displayName = profile?.first_name ? capitalize(profile.first_name) : "there";

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-6 max-w-6xl mx-auto">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-2xl"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent rounded-2xl"></div>
      </div>

      <DashboardContent userId={data.user.id} displayName={displayName} />
    </div>
  );
}