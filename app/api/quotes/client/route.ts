import { NextResponse } from "next/server"
import { query, transaction } from "@/lib/db"
import { QuoteStatus } from "@/types/quote-models"

export async function GET(request: Request) {
  try {
    console.log("GET /api/quotes/client called")
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const clientId = searchParams.get("clientId")
    const search = searchParams.get("search")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    console.log("Search params:", { status, clientId, search, dateFrom, dateTo })

    let sql = `
      SELECT cq.*, c.name as clientName, cq.convertedInvoiceId
      FROM client_quotes cq 
      LEFT JOIN clients c ON cq.clientId = c.id 
      WHERE 1=1
    `

    const params: any[] = []

    if (status && status !== "all") {
      sql += " AND cq.status = ?"
      params.push(status)
    }

    if (clientId && clientId !== "all") {
      sql += " AND cq.clientId = ?"
      params.push(clientId)
    }

    if (search) {
      sql += " AND (c.name LIKE ? OR cq.id LIKE ?)"
      params.push(`%${search}%`, `%${search}%`)
    }

    if (dateFrom) {
      sql += " AND cq.dateCreated >= ?"
      params.push(dateFrom)
    }

    if (dateTo) {
      sql += " AND cq.dateCreated <= ?"
      params.push(dateTo)
    }

    sql += " ORDER BY cq.dateCreated DESC"

    console.log("SQL query:", sql)
    console.log("SQL params:", params)

    const quotes = await query(sql, params)
    console.log("Quotes fetched:", quotes)

    return NextResponse.json(quotes)
  } catch (error) {
    console.error("Error fetching client quotes:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { clientId, validUntil, items, notes, status = QuoteStatus.DRAFT } = body

    // Validate required fields
    if (!clientId || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum: number, item: any) => sum + item.quantity * item.unitPrice, 0)

    const result = await transaction(async (connection) => {
      // Create the quote
      const [quoteResult] = await connection.execute(
        `INSERT INTO client_quotes 
         (clientId, totalAmount, dateCreated, validUntil, status, notes) 
         VALUES (?, ?, NOW(), ?, ?, ?)`,
        [clientId, totalAmount, validUntil, status, notes],
      )

      const quoteId = (quoteResult as any).insertId

      // Create quote items
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
          ],
        )
      }

      return quoteId
    })

    // Fetch the created quote with client info
    const newQuote = await query(
      `SELECT cq.*, c.name as clientName 
       FROM client_quotes cq 
       LEFT JOIN clients c ON cq.clientId = c.id 
       WHERE cq.id = ?`,
      [result],
    )

    return NextResponse.json((newQuote as any[])[0])
  } catch (error) {
    console.error("Error creating client quote:", error)
    return NextResponse.json({ error: "Failed to create client quote" }, { status: 500 })
  }
}
