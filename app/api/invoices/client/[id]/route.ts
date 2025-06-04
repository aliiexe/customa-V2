import { NextResponse } from "next/server"
import { query, transaction } from "@/lib/db"
import { InvoiceStatus } from "@/types/models"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const invoiceId = params.id

    // Get invoice with client info
    const invoiceResult = await query(
      `SELECT ci.*, c.name as clientName, c.email as clientEmail, c.address as clientAddress
       FROM client_invoices ci 
       LEFT JOIN clients c ON ci.clientId = c.id 
       WHERE ci.id = ?`,
      [invoiceId],
    )

    if ((invoiceResult as any[]).length === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const invoice = (invoiceResult as any[])[0]

    // Get invoice items with product info
    const itemsResult = await query(
      `SELECT cii.*, p.name as productName, p.reference as productReference
       FROM client_invoice_items cii 
       LEFT JOIN products p ON cii.productId = p.id 
       WHERE cii.invoiceId = ?`,
      [invoiceId],
    )

    invoice.items = itemsResult

    return NextResponse.json(invoice)
  } catch (error) {
    console.error("Error fetching client invoice:", error)
    return NextResponse.json({ error: "Failed to fetch client invoice" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const invoiceId = params.id
    const body = await request.json()
    const { status } = body

    if (status === InvoiceStatus.PAID) {
      // Mark invoice as paid
      await query(
        `UPDATE client_invoices 
         SET status = ?, updatedAt = NOW() 
         WHERE id = ?`,
        [InvoiceStatus.PAID, invoiceId],
      )

      // If marking as paid and delivery date is in the future, update stock
      const invoiceResult = await query(`SELECT deliveryDate FROM client_invoices WHERE id = ?`, [invoiceId])

      const invoice = (invoiceResult as any[])[0]

      if (new Date(invoice.deliveryDate) > new Date()) {
        // Update stock for all items in this invoice
        await transaction(async (connection) => {
          const itemsResult = await connection.execute(
            `SELECT productId, quantity FROM client_invoice_items WHERE invoiceId = ?`,
            [invoiceId],
          )

          const items = (itemsResult as any[])[0]

          for (const item of items) {
            await connection.execute(
              `UPDATE products 
               SET stockQuantity = stockQuantity - ?, updatedAt = NOW() 
               WHERE id = ? AND stockQuantity >= ?`,
              [item.quantity, item.productId, item.quantity],
            )
          }
        })
      }
    }

    const updatedInvoice = await query(
      `SELECT ci.*, c.name as clientName 
       FROM client_invoices ci 
       LEFT JOIN clients c ON ci.clientId = c.id 
       WHERE ci.id = ?`,
      [invoiceId],
    )

    return NextResponse.json(updatedInvoice[0])
  } catch (error) {
    console.error("Error updating client invoice:", error)
    return NextResponse.json({ error: "Failed to update client invoice" }, { status: 500 })
  }
}
