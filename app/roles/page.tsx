import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import RolesTable from "@/components/roles/roles-table";

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Roles</h1>
        <Button asChild>
          <Link href="/roles/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Role
          </Link>
        </Button>
      </div>
      <RolesTable />
    </div>
  );
}