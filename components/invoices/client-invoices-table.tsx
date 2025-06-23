"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Eye, Download, CheckCircle, MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"

interface Invoice {
  id: number
  clientName: string
  totalAmount: number
  dateCreated: string
  deliveryDate: string
  payment_status: "PAID" | "UNPAID"
  delivery_status: "IN_PROCESS" | "SENDING" | "DELIVERED"
}

export default function ClientInvoicesTable({ invoices: initialInvoices }: { invoices: Invoice[] }) {
  const [invoices, setInvoices] = useState(initialInvoices)
  const router = useRouter()

  const getPaymentStatusBadge = (status: "PAID" | "UNPAID") => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case "UNPAID":
        return <Badge className="bg-red-100 text-red-800">Unpaid</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }
  
  const getDeliveryStatusBadge = (status: "IN_PROCESS" | "SENDING" | "DELIVERED") => {
    switch (status) {
      case "IN_PROCESS":
        return <Badge className="bg-yellow-100 text-yellow-800">In Process</Badge>
      case "SENDING":
        return <Badge className="bg-blue-100 text-blue-800">Sending</Badge>
      case "DELIVERED":
        return <Badge className="bg-purple-100 text-purple-800">Delivered</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice ID</TableHead>
              <TableHead>Client</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Date Created</TableHead>
              <TableHead>Delivery Date</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Delivery Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id} className="cursor-pointer" onClick={() => router.push(`/invoices/client/${invoice.id}`)}>
                <TableCell className="font-medium">#{invoice.id.toString().padStart(5, "0")}</TableCell>
                <TableCell>{invoice.clientName}</TableCell>
                <TableCell className="text-right">${parseFloat(invoice.totalAmount.toString()).toFixed(2)}</TableCell>
                <TableCell>{format(new Date(invoice.dateCreated), "MMM dd, yyyy")}</TableCell>
                <TableCell>{format(new Date(invoice.deliveryDate), "MMM dd, yyyy")}</TableCell>
                <TableCell>{getPaymentStatusBadge(invoice.payment_status)}</TableCell>
                <TableCell>{getDeliveryStatusBadge(invoice.delivery_status)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
