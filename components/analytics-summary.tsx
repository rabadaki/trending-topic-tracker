import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, Zap, Target } from "lucide-react"

const stats = [
  {
    title: "Ideas Generated",
    value: "247",
    change: "+23%",
    icon: Zap,
    color: "text-blue-600",
  },
  {
    title: "Trending Topics",
    value: "89",
    change: "+12%",
    icon: TrendingUp,
    color: "text-green-600",
  },
  {
    title: "Content Published",
    value: "156",
    change: "+18%",
    icon: Target,
    color: "text-purple-600",
  },
  {
    title: "Engagement Rate",
    value: "8.4%",
    change: "+2.1%",
    icon: Users,
    color: "text-orange-600",
  },
]

export function AnalyticsSummary() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.map((stat) => (
          <div key={stat.title} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gray-100 ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="font-semibold">{stat.value}</p>
              </div>
            </div>
            <div className="text-sm text-green-600 font-medium">{stat.change}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
