"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, CheckCircle, Truck, PackageCheck, Save } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

// Types
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
  clientName: string
  clientEmail: string
  clientAddress: string
  totalAmount: number
  dateCreated: string
  deliveryDate: string
  payment_status: "PAID" | "UNPAID"
  delivery_status: "IN_PROCESS" | "SENDING" | "DELIVERED"
  items: InvoiceItem[]
}

export default function ClientInvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: invoiceId } = use(params)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [deliveryStatus, setDeliveryStatus] = useState<Invoice["delivery_status"] | "">("")

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`/api/invoices/client/${invoiceId}`)
        if (response.ok) {
          const data = await response.json()
          setInvoice(data)
          setDeliveryStatus(data.delivery_status)
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchInvoice()
  }, [invoiceId])

  const getPaymentStatusBadge = (status: Invoice["payment_status"]) => {
    return status === "PAID" ? 
      <Badge className="bg-green-100 text-green-800">Paid</Badge> : 
      <Badge className="bg-red-100 text-red-800">Unpaid</Badge>
  }
  
  const getDeliveryStatusBadge = (status: Invoice["delivery_status"]) => {
    switch (status) {
      case "IN_PROCESS": return <Badge className="bg-yellow-100 text-yellow-800">In Process</Badge>
      case "SENDING": return <Badge className="bg-blue-100 text-blue-800">Sending</Badge>
      case "DELIVERED": return <Badge className="bg-purple-100 text-purple-800">Delivered</Badge>
    }
  }

  const handleUpdateStatus = async (newStatus: Partial<Pick<Invoice, 'payment_status' | 'delivery_status'>>) => {
    if (!invoice) return
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/invoices/client/${invoice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStatus),
      });
      if (response.ok) {
        const updatedInvoice = await response.json()
        setInvoice(updatedInvoice)
        setDeliveryStatus(updatedInvoice.delivery_status)
      } else {
        alert('Failed to update status.')
      }
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) return <div className="p-6">Loading...</div>
  if (!invoice) return <div className="p-6 text-red-500">Invoice not found.</div>

  return (
    <div className="space-y-6 bg-white min-h-screen p-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" asChild>
          <Link href="/invoices/client"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-gray-800">
          Invoice #{invoice.id.toString().padStart(5, "0")}
        </h1>
        <div>{getPaymentStatusBadge(invoice.payment_status)} {getDeliveryStatusBadge(invoice.delivery_status)}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader><CardTitle>Client Details</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p><strong>{invoice.clientName}</strong></p>
            <p>{invoice.clientEmail}</p>
            <p>{invoice.clientAddress}</p>
          </CardContent>
        </Card>
        <Card className="md:col-span-1">
          <CardHeader><CardTitle>Invoice Details</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Date Created:</strong> {format(new Date(invoice.dateCreated), "MMM dd, yyyy")}</p>
            <p><strong>Delivery Date:</strong> {format(new Date(invoice.deliveryDate), "MMM dd, yyyy")}</p>
            <p className="text-xl"><strong>Total:</strong> ${parseFloat(invoice.totalAmount.toString()).toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="md:col-span-1">
          <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {invoice.payment_status === "UNPAID" && (
              <Button onClick={() => handleUpdateStatus({ payment_status: "PAID" })} disabled={isUpdating} className="w-full">
                <CheckCircle className="mr-2 h-4 w-4" /> Mark as Paid
              </Button>
            )}
            <div className="flex items-center space-x-2">
              <Select value={deliveryStatus} onValueChange={(val) => setDeliveryStatus(val as Invoice["delivery_status"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN_PROCESS">In Process</SelectItem>
                  <SelectItem value="SENDING">Sending</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => handleUpdateStatus({ delivery_status: deliveryStatus as Invoice["delivery_status"] })} disabled={isUpdating || deliveryStatus === invoice.delivery_status}>
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Invoice Items</CardTitle></CardHeader>
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
              {invoice.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{item.productReference}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">${parseFloat(item.unitPrice.toString()).toFixed(2)}</TableCell>
                  <TableCell className="text-right font-medium">${parseFloat(item.totalPrice.toString()).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 