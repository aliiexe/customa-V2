import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import SupplierQuoteForm from "@/components/quotes/supplier-quote-form"

export default function NewSupplierQuotePage() {
  return (
    <div className="space-y-6 p-6 bg-white min-h-screen">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/quotes/supplier">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-blue-600">Request Supplier Quote</h1>
      </div>

      <SupplierQuoteForm />
    </div>
  )
} 