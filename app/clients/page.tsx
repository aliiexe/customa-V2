import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import ClientsTable from "@/components/clients/clients-table"
import Link from "next/link"

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
        <Button asChild>
          <Link href="/clients/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Client
          </Link>
        </Button>
      </div>

      <ClientsTable />
    </div>
  )
}
