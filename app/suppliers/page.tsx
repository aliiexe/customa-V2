import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import SuppliersTable from "@/components/suppliers/suppliers-table"
import Link from "next/link"

export default function SuppliersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
        <Button asChild>
          <Link href="/suppliers/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Supplier
          </Link>
        </Button>
      </div>

      <SuppliersTable />
    </div>
  )
}
