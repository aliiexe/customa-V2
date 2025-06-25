"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Clock,
  Package,
  Users,
  FileText,
  DollarSign,
  ArrowRight
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface Activity {
  id: string
  type: 'product' | 'client' | 'invoice' | 'order'
  title: string
  description: string
  timestamp: string
  value?: number
  status?: string
  href?: string
}

export function RecentActivityWidget() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentActivity()
  }, [])

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch('/api/dashboard/recent-activity?limit=10')
      if (response.ok) {
        const data = await response.json()
        setActivities(data)
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'product': return <Package className="h-4 w-4 text-blue-600" />
      case 'client': return <Users className="h-4 w-4 text-green-600" />
      case 'invoice': return <FileText className="h-4 w-4 text-purple-600" />
      case 'order': return <DollarSign className="h-4 w-4 text-orange-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
              <div className="mt-1">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </h4>
                  {activity.status && (
                    <Badge variant="secondary" className="text-xs">
                      {activity.status}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-1">{activity.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </span>
                  {activity.value && (
                    <span className="text-xs font-medium text-green-600">
                      ${activity.value.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
              {activity.href && (
                <Link href={activity.href} className="text-gray-400 hover:text-gray-600">
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}