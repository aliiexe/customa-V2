"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, Send, CheckCircle, FileText, Eye } from "lucide-react"
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
  clientId: number
  clientName: string
  totalAmount: number
  dateCreated: string
  validUntil: string
  status: QuoteStatus
  notes: string
  convertedInvoiceId?: number
  items: QuoteItem[]
}

export default function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: quoteId } = use(params)
  const router = useRouter()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await fetch(`/api/quotes/client/${quoteId}`)
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
      case QuoteStatus.CONFIRMED:
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Confirmed
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
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            Converted
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleSendToClient = async () => {
    if (!quote) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/quotes/client/${quote.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: QuoteStatus.PENDING }),
      })

      if (response.ok) {
        setQuote({ ...quote, status: QuoteStatus.PENDING })
      } else {
        alert("Failed to send quote to client")
      }
    } catch (error) {
      console.error("Error sending quote:", error)
      alert("Failed to send quote to client")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleConfirmQuote = async () => {
    if (!quote) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/quotes/client/${quote.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: QuoteStatus.CONFIRMED }),
      })

      if (response.ok) {
        setQuote({ ...quote, status: QuoteStatus.CONFIRMED })
      } else {
        alert("Failed to confirm quote")
      }
    } catch (error) {
      console.error("Error confirming quote:", error)
      alert("Failed to confirm quote")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleConvertToInvoice = async () => {
    if (!quote) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/quotes/client/${quote.id}/convert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deliveryDate: new Date().toISOString().split('T')[0] }),
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/invoices/client/${result.invoiceId}`)
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
    <div className="space-y-6 bg-white min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/quotes/client">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-green-600">
              Quote #{quote.id.toString().padStart(4, "0")}
            </h1>
            <p className="text-gray-600">{quote.clientName}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(quote.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quote Details */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Quote Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Client</label>
                <p className="text-lg">{quote.clientName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Created</label>
                <p>{format(new Date(quote.dateCreated), "MMM dd, yyyy")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Valid Until</label>
                <p>{format(new Date(quote.validUntil), "MMM dd, yyyy")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Total Amount</label>
                <p className="text-2xl font-bold text-green-600">${Number(quote.totalAmount).toFixed(2)}</p>
              </div>
              {quote.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Notes</label>
                  <p className="text-sm text-gray-700">{quote.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quote.status === QuoteStatus.DRAFT && (
                <>
                  <Button asChild className="w-full" variant="outline">
                    <Link href={`/quotes/client/${quote.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Quote
                    </Link>
                  </Button>
                  <Button 
                    onClick={handleSendToClient}
                    disabled={isUpdating}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send to Client
                  </Button>
                </>
              )}

              {quote.status === QuoteStatus.PENDING && (
                <Button 
                  onClick={handleConfirmQuote}
                  disabled={isUpdating}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm Quote
                </Button>
              )}

              {(quote.status === QuoteStatus.CONFIRMED || quote.status === QuoteStatus.APPROVED) && (
                <Button 
                  onClick={handleConvertToInvoice}
                  disabled={isUpdating}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Convert to Invoice
                </Button>
              )}

              {quote.status === QuoteStatus.CONVERTED && quote.convertedInvoiceId && (
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link href={`/invoices/client/${quote.convertedInvoiceId}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Invoice
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quote Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Quote Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quote.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell>{item.productReference}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">${Number(item.unitPrice).toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">
                        ${Number(item.totalPrice).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 