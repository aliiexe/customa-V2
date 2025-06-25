"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  AlertTriangle, 
  Package, 
  DollarSign, 
  Clock,
  Building2,
  X,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

interface CriticalAlert {
  id: string
  type: 'stock' | 'payment' | 'order' | 'supplier'
  severity: 'high' | 'medium' | 'low'
  title: string
  description: string
  count?: number
  value?: number
  action?: {
    label: string
    href: string
  }
}

interface CriticalAlertsWidgetProps {
  alerts: CriticalAlert[]
  onRefresh: () => void
}

export function CriticalAlertsWidget({ alerts, onRefresh }: CriticalAlertsWidgetProps) {
  // Add state to track visibility
  const [visible, setVisible] = useState(true)
  
  // Handle dismiss
  const handleDismiss = () => {
    setVisible(false)
  }
  
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'stock': return <Package className="h-4 w-4" />
      case 'payment': return <DollarSign className="h-4 w-4" />
      case 'order': return <Clock className="h-4 w-4" />
      case 'supplier': return <Building2 className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-500 bg-red-50'
      case 'medium': return 'border-orange-500 bg-orange-50'
      case 'low': return 'border-yellow-500 bg-yellow-50'
      default: return 'border-gray-500 bg-gray-50'
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high': return <Badge variant="destructive">High</Badge>
      case 'medium': return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Medium</Badge>
      case 'low': return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Low</Badge>
      default: return <Badge variant="secondary">Info</Badge>
    }
  }

  if (alerts.length === 0 || !visible) return null

  return (
    <Card className="border-red-200 bg-red-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-900">Critical Alerts</CardTitle>
            <Badge variant="destructive">{alerts.length}</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.slice(0, 5).map((alert) => (
          <div 
            key={alert.id}
            className={`p-3 rounded-lg border-l-4 ${getSeverityColor(alert.severity)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-0.5 text-gray-600">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{alert.title}</h4>
                    {getSeverityBadge(alert.severity)}
                  </div>
                  <p className="text-sm text-gray-700">{alert.description}</p>
                  {(alert.count || alert.value) && (
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                      {alert.count && <span>Count: {alert.count}</span>}
                      {alert.value !== undefined && (
                        <span>Value: ${Number(alert.value).toFixed(2)}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {alert.action && (
                <Button variant="ghost" size="sm" asChild className="flex-shrink-0">
                  <Link href={alert.action.href}>
                    {alert.action.label}
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        ))}
        
        {alerts.length > 5 && (
          <div className="text-center pt-2">
            <Button variant="outline" size="sm">
              View All {alerts.length} Alerts
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}