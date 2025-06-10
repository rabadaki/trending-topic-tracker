import { Suspense } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { TrendingTopics } from "@/components/trending-topics"
import { ContentGenerator } from "@/components/content-generator"
import { AnalyticsSummary } from "@/components/analytics-summary"
import { RecentActivity } from "@/components/recent-activity"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <Suspense fallback={<div>Loading trending topics...</div>}>
              <TrendingTopics />
            </Suspense>

            <ContentGenerator />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <AnalyticsSummary />
            <RecentActivity />
          </div>
        </div>
      </main>
    </div>
  )
}
