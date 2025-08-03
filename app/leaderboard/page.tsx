import { GlobalLeaderboard } from "@/components/global-leaderboard/GlobalLeaderboard";

export default async function LeaderboardPage() {

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-6 max-w-7xl mx-auto">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full mb-4">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-yellow-600 to-orange-600 dark:from-white dark:via-yellow-200 dark:to-orange-200 bg-clip-text text-transparent">
              Global Leaderboard
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 font-medium">
              Compete with developers worldwide and climb the ranks
            </p>
          </div>
        </div>

        {/* Leaderboard Component */}
        <div className="relative">
          <GlobalLeaderboard />
        </div>

        {/* How It Works Section */}
        <div className="mt-12 space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              How to Earn Points
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Engage with the Codeunia community to climb the leaderboard
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg">
              <div className="text-3xl mb-4">📚</div>
              <h3 className="font-semibold text-lg mb-2">Daily Activities</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Daily login: +5 points<br />
                Profile updates: +2 points<br />
                Reading blogs: +2 points
              </p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg">
              <div className="text-3xl mb-4">🧪</div>
              <h3 className="font-semibold text-lg mb-2">Tests & Assessments</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Test registration: +5 points<br />
                Test completion: +10 points<br />
                Top 3 ranking: +15 points
              </p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg">
              <div className="text-3xl mb-4">🏆</div>
              <h3 className="font-semibold text-lg mb-2">Events & Hackathons</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Event registration: +5 points<br />
                Event participation: +10 points<br />
                Certificates earned: +15 points
              </p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-lg">
              <div className="text-3xl mb-4">🌟</div>
              <h3 className="font-semibold text-lg mb-2">Community Engagement</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Blog likes: +1 point<br />
                Social sharing: +5 points<br />
                User referrals: +10 points
              </p>
            </div>
          </div>
        </div>

        {/* Badge System Section */}
        <div className="mt-12 space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Badge System
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Unlock badges as you progress through the ranks
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg">
              <div className="text-4xl mb-2">🥉</div>
              <h3 className="font-semibold">Bronze</h3>
              <p className="text-sm text-gray-600">0+ points</p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-gray-100 to-slate-100 dark:from-gray-900/20 dark:to-slate-900/20 rounded-lg">
              <div className="text-4xl mb-2">🥈</div>
              <h3 className="font-semibold">Silver</h3>
              <p className="text-sm text-gray-600">100+ points</p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg">
              <div className="text-4xl mb-2">🥇</div>
              <h3 className="font-semibold">Gold</h3>
              <p className="text-sm text-gray-600">500+ points</p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-gray-100 to-white dark:from-gray-900/20 dark:to-gray-800/20 rounded-lg">
              <div className="text-4xl mb-2">💎</div>
              <h3 className="font-semibold">Platinum</h3>
              <p className="text-sm text-gray-600">1000+ points</p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
              <div className="text-4xl mb-2">💎</div>
              <h3 className="font-semibold">Diamond</h3>
              <p className="text-sm text-gray-600">2500+ points</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 