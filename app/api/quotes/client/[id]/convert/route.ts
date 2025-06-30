import { NextResponse } from "next/server"
import { query, transaction } from "@/lib/db"
import { QuoteStatus } from "@/types/quote-models"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quoteId } = await params
    const body = await request.json()
    const { deliveryDate } = body

    // Fetch the quote with all its data
    const quotes = await query(
      `SELECT cq.*, c.name as clientName 
       FROM client_quotes cq 
       LEFT JOIN clients c ON cq.clientId = c.id 
       WHERE cq.id = ?`,
      [quoteId]
    )

    if (!quotes || (quotes as any[]).length === 0) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 })
    }

    const quote = (quotes as any[])[0]

    // Check if quote is in a convertible status
    if (quote.status !== QuoteStatus.CONFIRMED && quote.status !== QuoteStatus.APPROVED) {
      return NextResponse.json(
        { error: "Only confirmed or approved quotes can be converted to invoices" },
        { status: 400 }
      )
    }

    // Fetch quote items
    const items = await query(
      `SELECT cqi.*, p.name as productName, p.reference as productReference
       FROM client_quote_items cqi
       LEFT JOIN products p ON cqi.productId = p.id
       WHERE cqi.quoteId = ?`,
      [quoteId]
    )

    const result = await transaction(async (connection) => {
      // Create the invoice
      const [invoiceResult] = await connection.execute(
        `INSERT INTO client_invoices 
         (clientId, quoteId, totalAmount, dateCreated, deliveryDate, payment_status, delivery_status) 
         VALUES (?, ?, ?, NOW(), ?, 'UNPAID', 'IN_PROCESS')`,
        [quote.clientId, quoteId, quote.totalAmount, deliveryDate],
      )

      const invoiceId = (invoiceResult as any).insertId

      // Create invoice items
      for (const item of items as any[]) {
        await connection.execute(
          `INSERT INTO client_invoice_items 
           (invoiceId, productId, quantity, unitPrice, totalPrice) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            invoiceId,
            item.productId,
            item.quantity,
            item.unitPrice,
            item.totalPrice
          ],
        )
        
        // Update provisional stock - decrease it for client quotes
        await connection.execute(
          `UPDATE products 
           SET provisionalStock = GREATEST(0, provisionalStock - ?) 
           WHERE id = ?`,
          [item.quantity, item.productId]
        )
      }

      // Update quote status to CONVERTED and link to invoice
      await connection.execute(
        `UPDATE client_quotes 
         SET status = ?, convertedInvoiceId = ? 
         WHERE id = ?`,
        [QuoteStatus.CONVERTED, invoiceId, quoteId]
      )

      return invoiceId
    })

    return NextResponse.json({ 
      success: true, 
      invoiceId: result,
      message: "Quote successfully converted to invoice"
    })
  } catch (error) {
    console.error("Error converting client quote to invoice:", error)
    return NextResponse.json(
      { error: "Failed to convert quote to invoice" },
      { status: 500 }
    )
  }
}
