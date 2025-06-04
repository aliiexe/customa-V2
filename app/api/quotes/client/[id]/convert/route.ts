import { NextResponse } from "next/server"
import { query, transaction } from "@/lib/db"
import { QuoteStatus } from "@/types/quote-models"
import { InvoiceStatus } from "@/types/models"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const quoteId = params.id
    const body = await request.json()
    const { deliveryDate } = body

    // Validate that quote exists and is approved
    const quoteResult = await query(`SELECT * FROM client_quotes WHERE id = ? AND status = ?`, [
      quoteId,
      QuoteStatus.APPROVED,
    ])

    if ((quoteResult as any[]).length === 0) {
      return NextResponse.json({ error: "Quote not found or not approved" }, { status: 404 })
    }

    const quote = (quoteResult as any[])[0]

    // Get quote items
    const itemsResult = await query(`SELECT * FROM client_quote_items WHERE quoteId = ?`, [quoteId])

    const items = itemsResult as any[]

    const invoiceId = await transaction(async (connection) => {
      // Create the invoice
      const [invoiceResult] = await connection.execute(
        `INSERT INTO client_invoices 
         (clientId, quoteId, totalAmount, dateCreated, deliveryDate, status) 
         VALUES (?, ?, ?, NOW(), ?, ?)`,
        [quote.clientId, quoteId, quote.totalAmount, deliveryDate, InvoiceStatus.UNPAID],
      )

      const newInvoiceId = (invoiceResult as any).insertId

      // Create invoice items from quote items
      for (const item of items) {
        await connection.execute(
          `INSERT INTO client_invoice_items 
           (invoiceId, productId, quantity, unitPrice, totalPrice) 
           VALUES (?, ?, ?, ?, ?)`,
          [newInvoiceId, item.productId, item.quantity, item.unitPrice, item.totalPrice],
        )
      }

      // Update quote status to converted
      await connection.execute(
        `UPDATE client_quotes 
         SET status = ?, updatedAt = NOW() 
         WHERE id = ?`,
        [QuoteStatus.CONVERTED, quoteId],
      )

      return newInvoiceId
    })

    // Fetch the created invoice with client info
    const newInvoice = await query(
      `SELECT ci.*, c.name as clientName 
       FROM client_invoices ci 
       LEFT JOIN clients c ON ci.clientId = c.id 
       WHERE ci.id = ?`,
      [invoiceId],
    )

    return NextResponse.json({
      message: "Quote converted to invoice successfully",
      invoice: newInvoice[0],
      invoiceId: invoiceId,
    })
  } catch (error) {
    console.error("Error converting quote to invoice:", error)
    return NextResponse.json({ error: "Failed to convert quote to invoice" }, { status: 500 })
  }
}
