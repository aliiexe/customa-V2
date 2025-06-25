import { Button } from "@/components/ui/button";
import { PlusCircle, Users } from "lucide-react";
import Link from "next/link";
import UsersTable from "@/components/users/users-table";

export default function UsersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                User Management
              </h1>
              <p className="mt-2 text-gray-600">
                Manage user accounts, roles, and permissions
              </p>
            </div>
            <Button
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
            >
              <Link href="/users/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create User
              </Link>
            </Button>
          </div>
        </div>

        {/* Content */}
        <UsersTable />
      </div>
    </div>
  );
}
