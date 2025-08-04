import { GlobalLeaderboard } from "@/components/global-leaderboard/GlobalLeaderboard";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default async function LeaderboardPage() {

  return (
    <>
      <Header />
      <main className="flex-1 w-full flex flex-col gap-8 p-6 max-w-7xl mx-auto pt-20">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center mb-4">
              {/* Codeunia Logo - No background circle */}
              <svg className="h-16 w-16" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="rainbowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#007AFF" />
                    <stop offset="30%" stopColor="#6C63FF" />
                    <stop offset="60%" stopColor="#FF6EC7" />
                    <stop offset="100%" stopColor="#FF9F45" />
                  </linearGradient>
                </defs>
                <rect x="0" y="0" width="200" height="200" rx="40" ry="40" fill="#007AFF" />
                <path d="M165,100 A65,65 0 1 1 100,35" fill="none" stroke="#000000" strokeWidth="30" strokeLinecap="round" />
                <circle cx="100" cy="165" r="15" fill="url(#rainbowGradient)" />
              </svg>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-yellow-600 to-orange-600 dark:from-white dark:via-yellow-200 dark:to-orange-200 bg-clip-text text-transparent">
                TopUnia
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 font-medium">
                Simple, punchy — top Codeunians.
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
                Engage with the Codeunia community to climb the ranks
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
      </main>
      <Footer />
    </>
  );
} 