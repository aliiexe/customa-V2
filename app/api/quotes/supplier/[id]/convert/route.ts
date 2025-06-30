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

    // Fetch the supplier quote with all its data
    const quotes = await query(
      `SELECT sq.*, s.name as supplierName 
       FROM supplier_quotes sq 
       LEFT JOIN suppliers s ON sq.supplierId = s.id 
       WHERE sq.id = ?`,
      [quoteId]
    )

    if (!quotes || (quotes as any[]).length === 0) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 })
    }

    const quote = (quotes as any[])[0]

    // Only allow conversion if status is APPROVED
    if (quote.status !== QuoteStatus.APPROVED) {
      return NextResponse.json(
        { error: "Only approved quotes can be converted to invoices" },
        { status: 400 }
      )
    }

    // Fetch quote items
    const items = await query(
      `SELECT sqi.*, p.name as productName, p.reference as productReference
       FROM supplier_quote_items sqi
       LEFT JOIN products p ON sqi.productId = p.id
       WHERE sqi.quoteId = ?`,
      [quoteId]
    )

    const result = await transaction(async (connection) => {
      // Create the supplier invoice
      const [invoiceResult] = await connection.execute(
        `INSERT INTO supplier_invoices 
         (supplierId, quoteId, totalAmount, dateCreated, deliveryDate, payment_status, delivery_status) 
         VALUES (?, ?, ?, NOW(), ?, 'UNPAID', 'IN_PROCESS')`,
        [quote.supplierId, quoteId, quote.totalAmount, deliveryDate],
      )

      const invoiceId = (invoiceResult as any).insertId

      // Create invoice items
      for (const item of items as any[]) {
        // Insert the invoice item
        await connection.execute(
          `INSERT INTO supplier_invoice_items 
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
        
        // Update provisional stock - increment it for the products in this invoice
        await connection.execute(
          `UPDATE products 
           SET provisionalStock = provisionalStock + ? 
           WHERE id = ?`,
          [item.quantity, item.productId]
        )
      }

      // Update quote status to CONVERTED and link to invoice
      await connection.execute(
        `UPDATE supplier_quotes 
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
    console.error("Error converting supplier quote to invoice:", error)
    return NextResponse.json(
      { error: "Failed to convert quote to invoice" },
      { status: 500 }
    )
  }
}