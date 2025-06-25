import { Button } from "@/components/ui/button";
import { PlusCircle, Shield } from "lucide-react";
import Link from "next/link";
import RolesTable from "@/components/roles/roles-table";

export default function RolesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                <Shield className="h-8 w-8 text-primary" />
                Role Management
              </h1>
              <p className="mt-2 text-gray-600">
                Define user roles and their permissions in the system
              </p>
            </div>
            <Button
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
            >
              <Link href="/roles/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Role
              </Link>
            </Button>
          </div>
        </div>

        {/* Content */}
        <RolesTable />
      </div>
    </div>
  );
}