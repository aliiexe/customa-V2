import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import ClientInvoicesTable from "@/components/invoices/client-invoices-table"
import InvoiceFilters from "@/components/invoices/invoice-filters"
import Link from "next/link"

export default function ClientInvoicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Client Invoices</h1>
        <Button asChild>
          <Link href="/invoices/client/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Invoice
          </Link>
        </Button>
      </div>

      <InvoiceFilters type="client" />
      <ClientInvoicesTable />
    </div>
  )
}
