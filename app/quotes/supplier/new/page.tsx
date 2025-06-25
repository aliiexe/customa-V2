import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import SupplierQuoteForm from "@/components/quotes/supplier-quote-form"

export default function NewSupplierQuotePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/quotes/supplier">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-primary">
                Request Supplier Quote
              </h1>
              <p className="text-gray-600 mt-1">
                Create a new quote request for your supplier
              </p>
            </div>
          </div>
        </div>

        <SupplierQuoteForm />
      </div>
    </div>
  )
}