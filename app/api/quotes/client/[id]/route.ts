import { NextResponse } from "next/server"
import { query, transaction } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: quoteId } = await params

    // Fetch quote details
    const quoteResult = await query(
      `SELECT cq.*, c.name as clientName, cq.convertedInvoiceId
       FROM client_quotes cq 
       LEFT JOIN clients c ON cq.clientId = c.id 
       WHERE cq.id = ?`,
      [quoteId]
    )

    if ((quoteResult as any[]).length === 0) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 })
    }

    const quote = (quoteResult as any[])[0]

    // Fetch quote items with product details
    const itemsResult = await query(
      `SELECT cqi.*, p.name as productName, p.reference as productReference, p.sellingPrice as originalPrice
       FROM client_quote_items cqi
       LEFT JOIN products p ON cqi.productId = p.id
       WHERE cqi.quoteId = ?`,
      [quoteId]
    )

    const items = itemsResult as any[]

    // Combine quote and items
    const quoteWithItems = {
      ...quote,
      items: items
    }

    return NextResponse.json(quoteWithItems)
  } catch (error) {
    console.error("Error fetching quote:", error)
    return NextResponse.json({ error: "Failed to fetch quote" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: quoteId } = await params
    const body = await request.json()
    const { validUntil, notes, items } = body

    // Check if quote exists and is in draft status
    const quoteResult = await query(
      `SELECT * FROM client_quotes WHERE id = ? AND status = 'DRAFT'`,
      [quoteId]
    )

    if ((quoteResult as any[]).length === 0) {
      return NextResponse.json({ error: "Quote not found or not in draft status" }, { status: 404 })
    }

    // Calculate new total amount
    const totalAmount = items.reduce((sum: number, item: any) => sum + item.quantity * item.unitPrice, 0)

    const result = await transaction(async (connection) => {
      // Update the quote
      await connection.execute(
        `UPDATE client_quotes 
         SET totalAmount = ?, validUntil = ?, notes = ?, updatedAt = NOW() 
         WHERE id = ?`,
        [totalAmount, validUntil, notes, quoteId]
      )

      // Delete existing items
      await connection.execute(
        `DELETE FROM client_quote_items WHERE quoteId = ?`,
        [quoteId]
      )

      // Create new quote items
      for (const item of items) {
        await connection.execute(
          `INSERT INTO client_quote_items 
           (quoteId, productId, quantity, unitPrice, totalPrice) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            quoteId, 
            item.productId, 
            item.quantity, 
            item.unitPrice, 
            item.quantity * item.unitPrice
          ]
        )
      }

      return quoteId
    })

    // Fetch the updated quote with client info
    const updatedQuote = await query(
      `SELECT cq.*, c.name as clientName 
       FROM client_quotes cq 
       LEFT JOIN clients c ON cq.clientId = c.id 
       WHERE cq.id = ?`,
      [result]
    )

    return NextResponse.json((updatedQuote as any[])[0])
  } catch (error) {
    console.error("Error updating quote:", error)
    return NextResponse.json({ error: "Failed to update quote" }, { status: 500 })
  }
} 