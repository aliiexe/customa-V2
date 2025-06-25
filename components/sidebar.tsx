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
  ShoppingCart,
  Tag,
  Truck,
  Users,
  Roles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const routes = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/dashboard",
    color: "text-primary",
  },
  {
    label: "Products",
    icon: Package,
    href: "/products",
    color: "text-primary",
  },
  {
    label: "Suppliers",
    icon: Truck,
    href: "/suppliers",
    color: "text-primary",
  },
  {
    label: "Clients",
    icon: Users,
    href: "/clients",
    color: "text-primary",
  },
  {
    label: "Client Quotes",
    icon: ClipboardList,
    href: "/quotes/client",
    color: "text-primary",
  },
  {
    label: "Supplier Quotes",
    icon: ClipboardList,
    href: "/quotes/supplier",
    color: "text-primary",
  },
  {
    label: "Client Invoices",
    icon: FileText,
    href: "/invoices/client",
    color: "text-primary",
  },
  {
    label: "Supplier Invoices",
    icon: FileText,
    href: "/invoices/supplier",
    color: "text-primary",
  },
  {
    label: "Categories",
    icon: Tag,
    href: "/categories",
    color: "text-primary",
  },
  {
    label: "Users",
    icon: Users,
    href: "/users",
    color: "text-primary",
  },
  {
    label: "Roles",
    icon: Users,
    href: "/roles",
    color: "text-primary",
  },
  {
    label: "Reports",
    icon: BarChart3,
    href: "/reports",
    color: "text-primary",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
    color: "text-primary",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col space-y-2 border-r bg-white py-4 w-[80px] md:w-[200px] shadow-sm">
      <div className="px-3 py-2 flex-1">
        <Link href="/" className="flex items-center pl-3 mb-8">
          <ShoppingCart className="h-6 w-6 text-primary" />
          <h1 className="ml-2 text-lg font-bold hidden md:block text-primary">
            ProductDash
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-gray-100",
                pathname === route.href
                  ? "bg-gray-100 text-primary border-r-2 border-primary"
                  : "text-gray-600 hover:text-primary"
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
    </div>
  );
}
