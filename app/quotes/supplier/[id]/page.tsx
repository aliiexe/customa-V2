"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, Send, CheckCircle, FileText } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { QuoteStatus } from "@/types/quote-models"

interface QuoteItem {
  id: number
  productId: number
  productName: string
  productReference: string
  quantity: number
  unitPrice: number
  totalPrice: number
  originalPrice: number
}

interface Quote {
  id: number
  supplierId: number
  supplierName: string
  totalAmount: number
  dateCreated: string
  validUntil: string
  status: QuoteStatus
  notes: string
  convertedInvoiceId?: number
  items: QuoteItem[]
}

export default function SupplierQuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: quoteId } = use(params)
  const router = useRouter()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await fetch(`/api/quotes/supplier/${quoteId}`)
        if (response.ok) {
          const data = await response.json()
          setQuote(data)
        } else {
          console.error("Failed to fetch quote")
        }
      } catch (error) {
        console.error("Error fetching quote:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchQuote()
  }, [quoteId])

  const getStatusBadge = (status: QuoteStatus) => {
    switch (status) {
      case QuoteStatus.DRAFT:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            Draft
          </Badge>
        )
      case QuoteStatus.PENDING:
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        )
      case QuoteStatus.APPROVED:
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Approved
          </Badge>
        )
      case QuoteStatus.REJECTED:
        return <Badge variant="destructive">Rejected</Badge>
      case QuoteStatus.CONVERTED:
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Converted
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleSendToSupplier = async () => {
    if (!quote) return
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/quotes/supplier/${quote.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: QuoteStatus.PENDING }),
      })
      if (response.ok) {
        setQuote({ ...quote, status: QuoteStatus.PENDING })
      } else {
        alert("Failed to send quote to supplier")
      }
    } catch (error) {
      console.error("Error sending quote:", error)
      alert("Failed to send quote to supplier")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleApproveQuote = async () => {
    if (!quote) return
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/quotes/supplier/${quote.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: QuoteStatus.APPROVED }),
      })
      if (response.ok) {
        setQuote({ ...quote, status: QuoteStatus.APPROVED })
      } else {
        alert("Failed to approve quote")
      }
    } catch (error) {
      console.error("Error approving quote:", error)
      alert("Failed to approve quote")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleConvertToInvoice = async () => {
    if (!quote) return
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/quotes/supplier/${quote.id}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryDate: new Date().toISOString().split('T')[0] }),
      })
      if (response.ok) {
        const result = await response.json()
        router.push(`/invoices/supplier/${result.invoiceId}`)
      } else {
        const errorData = await response.json().catch(() => ({ error: "Could not parse error response." }))
        alert(`Failed to convert quote: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error("Error converting quote:", error)
      alert(`An unexpected error occurred while converting the quote.`)
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading quote...</div>
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Quote not found</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Supplier Quote Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="font-semibold text-green-700">{quote.supplierName}</div>
              <div className="text-sm text-gray-500">Quote #{quote.id}</div>
              <div className="mt-1">Status: {getStatusBadge(quote.status)}</div>
            </div>
            <Button asChild variant="outline">
              <Link href="/quotes/supplier">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Link>
            </Button>
          </div>

          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-gray-600">Valid Until</div>
              <div className="font-medium">{quote.validUntil ? format(new Date(quote.validUntil), "MMM dd, yyyy") : "-"}</div>
            </div>
            <div>
              <div className="text-gray-600">Date Created</div>
              <div className="font-medium">{quote.dateCreated ? format(new Date(quote.dateCreated), "MMM dd, yyyy") : "-"}</div>
            </div>
            <div>
              <div className="text-gray-600">Total Amount</div>
              <div className="font-medium">${Number(quote.totalAmount).toFixed(2)}</div>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-gray-600 mb-1">Notes</div>
            <div className="bg-gray-50 rounded p-2 min-h-[40px]">{quote.notes || <span className="text-gray-400">No notes</span>}</div>
          </div>

          <div className="mb-6">
            <div className="font-semibold mb-2">Items</div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quote.items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>{item.productReference}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>${Number(item.unitPrice).toFixed(2)}</TableCell>
                    <TableCell>${Number(item.totalPrice).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex space-x-2">
            <Button asChild variant="outline">
              <Link href={`/quotes/supplier/${quote.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Link>
            </Button>
            {quote.status === QuoteStatus.DRAFT && (
              <Button onClick={handleSendToSupplier} disabled={isUpdating}>
                <Send className="mr-2 h-4 w-4" /> Send to Supplier
              </Button>
            )}
            {quote.status === QuoteStatus.PENDING && (
              <Button onClick={handleApproveQuote} disabled={isUpdating}>
                <CheckCircle className="mr-2 h-4 w-4" /> Approve
              </Button>
            )}
            {(quote.status === QuoteStatus.APPROVED) && (
              <Button onClick={handleConvertToInvoice} disabled={isUpdating}>
                <FileText className="mr-2 h-4 w-4" /> Convert to Invoice
              </Button>
            )}
            {quote.status === QuoteStatus.CONVERTED && quote.convertedInvoiceId && (
              <Button asChild variant="outline">
                <Link href={`/invoices/supplier/${quote.convertedInvoiceId}`}>
                  <FileText className="mr-2 h-4 w-4" /> View Invoice
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 