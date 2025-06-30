"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ArrowLeft, Edit, Send, CheckCircle, FileText, Eye, Calendar, DollarSign, User, Hash, XCircle } from "lucide-react"
import Link from "next/link"
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
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium"
    switch (status) {
      case QuoteStatus.DRAFT:
        return <Badge className={`${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`}>Draft</Badge>
      case QuoteStatus.PENDING:
        return <Badge className={`${baseClasses} bg-amber-100 text-amber-800 border border-amber-200`}>Pending</Badge>
      case QuoteStatus.CONFIRMED:
        return <Badge className={`${baseClasses} bg-blue-100 text-blue-800 border border-blue-200`}>Confirmed</Badge>
      case QuoteStatus.APPROVED:
        return <Badge className={`${baseClasses} bg-green-100 text-green-800 border border-green-200`}>Approved</Badge>
      case QuoteStatus.REJECTED:
        return <Badge className={`${baseClasses} bg-red-100 text-red-800 border border-red-200`}>Rejected</Badge>
      case QuoteStatus.CONVERTED:
        return <Badge className={`${baseClasses} bg-purple-100 text-purple-800 border border-purple-200`}>Converted</Badge>
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

  const handleRejectQuote = async () => {
    if (!quote) return
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/quotes/client/${quote.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: QuoteStatus.REJECTED }),
      })
      if (response.ok) {
        setQuote({ ...quote, status: QuoteStatus.REJECTED })
      } else {
        alert("Failed to reject quote")
      }
    } catch (error) {
      console.error("Error rejecting quote:", error)
      alert("Failed to reject quote")
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-xl text-slate-600">Loading quote...</div>
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-xl text-red-600">Quote not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              size="icon" 
              asChild
              className="shadow-sm border-slate-200 hover:bg-slate-50"
            >
              <Link href="/quotes/client">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Hash className="h-6 w-6 text-primary" />
                <h1 className="text-3xl font-bold text-slate-900">
                  Quote #{quote.id.toString().padStart(4, "0")}
                </h1>
                {getStatusBadge(quote.status)}
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <User className="h-4 w-4" />
                <span className="font-medium">{quote.clientName}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quote Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quote Information */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-slate-200">
                <CardTitle className="text-primary flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Quote Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Client</label>
                    <p className="font-semibold text-slate-900">{quote.clientName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Status</label>
                    <div className="mt-1">{getStatusBadge(quote.status)}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Created
                    </label>
                    <p className="font-medium text-slate-900">
                      {format(new Date(quote.dateCreated), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Valid Until
                    </label>
                    <p className="font-medium text-slate-900">
                      {format(new Date(quote.validUntil), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">Total Amount</label>
                  <p className="text-2xl font-bold text-primary">
                    ${Number(quote.totalAmount).toFixed(2)}
                  </p>
                </div>

                {quote.notes && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Notes</label>
                    <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      {quote.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <CardTitle className="text-slate-700">Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                {quote.status === QuoteStatus.DRAFT && (
                  <>
                    <Button 
                      asChild 
                      variant="outline" 
                      className="w-full border-slate-300 hover:bg-slate-50"
                    >
                      <Link href={`/quotes/client/${quote.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Quote
                      </Link>
                    </Button>
                    <Button 
                      onClick={handleSendToClient}
                      disabled={isUpdating}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Send to Client
                    </Button>
                  </>
                )}

                {quote.status === QuoteStatus.PENDING && (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleConfirmQuote}
                      disabled={isUpdating}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Confirm Quote
                    </Button>
                    <Button
                      onClick={handleRejectQuote}
                      disabled={isUpdating}
                      variant="destructive"
                      className="w-full"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject Quote
                    </Button>
                  </div>
                )}

                {(quote.status === QuoteStatus.CONFIRMED || quote.status === QuoteStatus.APPROVED) && (
                  <Button 
                    onClick={handleConvertToInvoice}
                    disabled={isUpdating}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Convert to Invoice
                  </Button>
                )}

                {quote.status === QuoteStatus.CONVERTED && quote.convertedInvoiceId && (
                  <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
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
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-slate-200">
                <CardTitle className="text-primary flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Quote Items ({quote.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 border-b border-slate-200">
                        <TableHead className="font-semibold text-slate-700">Product</TableHead>
                        <TableHead className="font-semibold text-slate-700">Reference</TableHead>
                        <TableHead className="text-right font-semibold text-slate-700">Quantity</TableHead>
                        <TableHead className="text-right font-semibold text-slate-700">Unit Price</TableHead>
                        <TableHead className="text-right font-semibold text-slate-700">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quote.items.map((item) => (
                        <TableRow key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <TableCell className="font-medium text-slate-900">{item.productName}</TableCell>
                          <TableCell className="text-slate-600">{item.productReference}</TableCell>
                          <TableCell className="text-right text-slate-900">{item.quantity}</TableCell>
                          <TableCell className="text-right text-slate-900">
                            ${Number(item.unitPrice).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-slate-900">
                            ${Number(item.totalPrice).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {/* Total Row */}
                      <TableRow className="bg-primary/5 border-t-2 border-primary/20">
                        <TableCell colSpan={4} className="text-right font-bold text-slate-900">
                          Total Amount:
                        </TableCell>
                        <TableCell className="text-right font-bold text-xl text-primary">
                          ${Number(quote.totalAmount).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}