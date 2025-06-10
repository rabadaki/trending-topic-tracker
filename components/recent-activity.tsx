import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, TrendingUp, Sparkles, Download } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "trend",
    title: "New trending topic detected",
    description: "AI Tools for Content Creation",
    time: "2 minutes ago",
    icon: TrendingUp,
    color: "text-green-600",
  },
  {
    id: 2,
    type: "generation",
    title: "Content ideas generated",
    description: "5 ideas for Remote Work topic",
    time: "15 minutes ago",
    icon: Sparkles,
    color: "text-blue-600",
  },
  {
    id: 3,
    type: "export",
    title: "Ideas exported to Notion",
    description: "Sustainable Living content pack",
    time: "1 hour ago",
    icon: Download,
    color: "text-purple-600",
  },
  {
    id: 4,
    type: "trend",
    title: "Trend alert triggered",
    description: "#CreatorEconomy reaching viral status",
    time: "2 hours ago",
    icon: TrendingUp,
    color: "text-orange-600",
  },
]

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className={`p-2 rounded-lg bg-gray-100 ${activity.color}`}>
              <activity.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{activity.title}</p>
              <p className="text-sm text-gray-600 truncate">{activity.description}</p>
              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
