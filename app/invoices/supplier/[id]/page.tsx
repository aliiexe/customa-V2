"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ArrowLeft, DollarSign, Calendar, Truck, Hash, FileText, CheckCircle2, Send } from "lucide-react"
import Link from "next/link"

interface InvoiceItem {
  id: number
  productName: string
  productReference: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface Invoice {
  id: number
  supplierId: number
  supplierName: string
  totalAmount: number
  dateCreated: string
  deliveryDate: string
  payment_status: "PAID" | "UNPAID"
  delivery_status: "IN_PROCESS" | "SENDING" | "DELIVERED"
  items: InvoiceItem[]
}

export default function SupplierInvoicePage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInvoice()
  }, [])

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/supplier/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setInvoice(data)
      }
    } catch (error) {
      console.error("Error fetching invoice:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/invoices/supplier/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const updatedInvoice = await response.json()
        setInvoice(updatedInvoice)
      }
    } catch (error) {
      console.error("Error updating invoice status:", error)
    }
  }

  const getPaymentStatusBadge = (status: "PAID" | "UNPAID") => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium"
    return status === "PAID" 
      ? <Badge className={`${baseClasses} bg-green-100 text-green-800 border border-green-200`}>Paid</Badge>
      : <Badge className={`${baseClasses} bg-red-100 text-red-800 border border-red-200`}>Unpaid</Badge>
  }
  
  const getDeliveryStatusBadge = (status: "IN_PROCESS" | "SENDING" | "DELIVERED") => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium"
    switch (status) {
      case "IN_PROCESS": 
        return <Badge className={`${baseClasses} bg-amber-100 text-amber-800 border border-amber-200`}>In Process</Badge>
      case "SENDING": 
        return <Badge className={`${baseClasses} bg-blue-100 text-blue-800 border border-blue-200`}>Sending</Badge>
      case "DELIVERED": 
        return <Badge className={`${baseClasses} bg-green-100 text-green-800 border border-green-200`}>Delivered</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading invoice...</div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-red-600">Invoice not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              size="icon" 
              asChild
              className="shadow-sm border-gray-200 hover:bg-gray-50"
            >
              <Link href="/invoices/supplier">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Hash className="h-6 w-6 text-primary" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Supplier Invoice #{invoice.id.toString().padStart(4, "0")}
                </h1>
                <div className="flex gap-2">
                  {getPaymentStatusBadge(invoice.payment_status)}
                  {getDeliveryStatusBadge(invoice.delivery_status)}
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Truck className="h-4 w-4" />
                <span className="font-medium">{invoice.supplierName}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Invoice Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Invoice Information */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="bg-primary/5 border-b border-gray-100">
                <CardTitle className="text-primary flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Invoice Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Supplier</label>
                    <p className="font-semibold text-gray-900">{invoice.supplierName}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Created
                    </label>
                    <p className="font-medium text-gray-900">
                      {format(new Date(invoice.dateCreated), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                      <Truck className="h-4 w-4" />
                      Delivery
                    </label>
                    <p className="font-medium text-gray-900">
                      {format(new Date(invoice.deliveryDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Payment Status</label>
                    <div className="mt-1">{getPaymentStatusBadge(invoice.payment_status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Delivery Status</label>
                    <div className="mt-1">{getDeliveryStatusBadge(invoice.delivery_status)}</div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Total Amount</label>
                  <p className="text-2xl font-bold text-primary">
                    ${Number(invoice.totalAmount).toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="bg-gray-50 border-b border-gray-100">
                <CardTitle className="text-gray-700">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                {invoice.payment_status === "UNPAID" && (
                  <Button 
                    onClick={() => handleStatusUpdate("PAID")}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark as Paid
                  </Button>
                )}

                {invoice.delivery_status === "IN_PROCESS" && (
                  <Button 
                    onClick={() => handleStatusUpdate("SENDING")}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Mark as Sending
                  </Button>
                )}

                {invoice.delivery_status === "SENDING" && (
                  <Button 
                    onClick={() => handleStatusUpdate("DELIVERED")}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark as Delivered
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Invoice Items */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="bg-primary/5 border-b border-gray-100">
                <CardTitle className="text-primary flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Invoice Items ({invoice.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 border-b border-gray-200">
                        <TableHead className="font-semibold text-gray-700">Product</TableHead>
                        <TableHead className="font-semibold text-gray-700">Reference</TableHead>
                        <TableHead className="text-right font-semibold text-gray-700">Quantity</TableHead>
                        <TableHead className="text-right font-semibold text-gray-700">Unit Price</TableHead>
                        <TableHead className="text-right font-semibold text-gray-700">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoice.items.map((item) => (
                        <TableRow key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                          <TableCell className="font-medium text-gray-900">{item.productName}</TableCell>
                          <TableCell className="text-gray-600">{item.productReference}</TableCell>
                          <TableCell className="text-right text-gray-900">{item.quantity}</TableCell>
                          <TableCell className="text-right text-gray-900">
                            ${Number(item.unitPrice || 0).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-gray-900">
                            ${Number(item.totalPrice || 0).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {/* Total Row */}
                      <TableRow className="bg-primary/5 border-t-2 border-primary/20">
                        <TableCell colSpan={4} className="text-right font-bold text-gray-900">
                          Total Amount:
                        </TableCell>
                        <TableCell className="text-right font-bold text-xl text-primary">
                          ${Number(invoice.totalAmount || 0).toFixed(2)}
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