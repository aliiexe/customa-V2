import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import UsersTable from "@/components/users/users-table";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <Button asChild>
          <Link href="/users/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add User
          </Link>
        </Button>
      </div>
      <UsersTable />
    </div>
  );
}
