"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ClipboardList,
  FileText,
  Home,
  Package,
  Settings,
  Tag,
  Truck,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useUserRoles } from "@/hooks/use-user-roles";

const routes = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/dashboard",
  },
  {
    label: "Products",
    icon: Package,
    href: "/products",
  },
  {
    label: "Suppliers",
    icon: Truck,
    href: "/suppliers",
  },
  {
    label: "Clients",
    icon: Users,
    href: "/clients",
  },
  {
    label: "Client Quotes",
    icon: ClipboardList,
    href: "/quotes/client",
  },
  {
    label: "Supplier Quotes",
    icon: ClipboardList,
    href: "/quotes/supplier",
  },
  {
    label: "Client Invoices",
    icon: FileText,
    href: "/invoices/client",
  },
  {
    label: "Supplier Invoices",
    icon: FileText,
    href: "/invoices/supplier",
  },
  {
    label: "Categories",
    icon: Tag,
    href: "/categories",
  },
  {
    label: "Users",
    icon: Users,
    href: "/users",
  },
  {
    label: "Roles",
    icon: Users,
    href: "/roles",
  },
  {
    label: "Reports",
    icon: BarChart3,
    href: "/reports",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

const routeAccess: { [key: string]: string[] } = {
  // Only these roles can see these routes
  "/dashboard": ["admin", "manager"],
  "/products": ["admin", "manager", "sales"],
  "/suppliers": ["admin", "manager", "sales"],
  "/clients": ["admin", "manager", "sales"],
  "/quotes/client": ["admin", "manager", "sales"],
  "/quotes/supplier": ["admin", "manager", "sales"],
  "/invoices/client": ["admin", "manager", "sales"],
  "/invoices/supplier": ["admin", "manager", "sales"],
  "/categories": ["admin", "manager", "sales"],
  "/users": ["admin", "manager"],
  "/roles": ["admin", "manager"],
  "/reports": ["admin", "manager"],
  "/settings": ["admin", "manager", "sales"],
};

export default function Sidebar() {
  const pathname = usePathname();
  const { roles, loading, hasRole, hasAnyRole } = useUserRoles();

  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <span className="text-gray-400 text-sm">Loading...</span>
      </div>
    );
  }

  // Lowercase role names for easier comparison
  const userRoleNames = roles.map(r => r.roleName.toLowerCase());
  const isAdminOrManager = userRoleNames.includes("admin") || userRoleNames.includes("manager");

  const filteredRoutes = routes.filter(route => {
    const allowedRoles = routeAccess[route.href];
    if (!allowedRoles) return false; // Hide if not defined
    if (isAdminOrManager) return true; // Admin/manager see all
    // Otherwise, check if user has any allowed role
    return allowedRoles.some(role => userRoleNames.includes(role));
  });

  return (
    <div className="flex h-full flex-col space-y-2 border-r bg-white py-4 w-[80px] md:w-[200px] shadow-sm">
      <div className="px-4 py-3 flex items-center justify-center">
        <div className="text-primary">

          <img src="/company1logo.png" alt="Company Logo" className="h-[150px]" />
        </div>
      </div>
      <div className="space-y-1 px-3">
        {filteredRoutes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-gray-100",
              pathname === route.href
                ? "bg-gray-100 text-primary border-r-2 border-primary"
                : "text-foreground hover:text-primary"
            )}
          >
            <route.icon
              className={cn(
                "h-5 w-5 mr-3",
                pathname === route.href ? "text-primary" : "text-gray-500"
              )}
            />
            <span className="hidden md:block">{route.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
