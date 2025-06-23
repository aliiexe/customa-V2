import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { QuoteStatus } from "@/types/quote-models"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: quoteId } = await params
    const body = await request.json()
    const { status } = body

    // Validate status
    if (!Object.values(QuoteStatus).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Check if quote exists
    const quoteResult = await query(`SELECT * FROM client_quotes WHERE id = ?`, [quoteId])
    
    if ((quoteResult as any[]).length === 0) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 })
    }

    // Update quote status
    await query(
      `UPDATE client_quotes 
       SET status = ?, updatedAt = NOW() 
       WHERE id = ?`,
      [status, quoteId]
    )

    // Fetch updated quote
    const updatedQuote = await query(
      `SELECT cq.*, c.name as clientName
       FROM client_quotes cq 
       LEFT JOIN clients c ON cq.clientId = c.id 
       WHERE cq.id = ?`,
      [quoteId]
    )

    return NextResponse.json((updatedQuote as any[])[0])
  } catch (error) {
    console.error("Error updating quote status:", error)
    return NextResponse.json({ error: "Failed to update quote status" }, { status: 500 })
  }
} 