import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

// Capitalization helper
function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/signin");
  }

  const firstNameRaw = data.user.user_metadata?.first_name || "";
  const lastNameRaw = data.user.user_metadata?.last_name || "";

  const firstName = capitalize(firstNameRaw);
  const lastName = capitalize(lastNameRaw);

  const displayName = firstName || lastName ? `${firstName} ${lastName}`.trim() : "there";

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