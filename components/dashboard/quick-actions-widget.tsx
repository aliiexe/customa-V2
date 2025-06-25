"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Plus, 
  FileText, 
  Package,
  Users,
  Building2,
  BarChart3
} from "lucide-react"
import Link from "next/link"

export function QuickActionsWidget() {
  const quickActions = [
    {
      label: "Add Product",
      href: "/products/new",
      icon: Package,
      description: "Create new product",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      label: "New Invoice",
      href: "/invoices/client/new",
      icon: FileText,
      description: "Create client invoice",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      label: "Add Client",
      href: "/clients/new",
      icon: Users,
      description: "Register new client",
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      label: "Add Supplier",
      href: "/suppliers/new",
      icon: Building2,
      description: "Add new supplier",
      color: "bg-orange-500 hover:bg-orange-600"
    },
    {
      label: "View Reports",
      href: "/reports",
      icon: BarChart3,
      description: "Business analytics",
      color: "bg-indigo-500 hover:bg-indigo-600"
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="w-full justify-start h-auto p-3"
            asChild
          >
            <Link href={action.href}>
              <div className={`p-2 rounded-md ${action.color} mr-3`}>
                <action.icon className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <div className="font-medium">{action.label}</div>
                <div className="text-xs text-gray-500">{action.description}</div>
              </div>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}