import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    console.log("GET /api/quotes/supplier called")
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const supplierId = searchParams.get("supplierId")
    const search = searchParams.get("search")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    console.log("Search params:", { status, supplierId, search, startDate, endDate })

    let sql = `
      SELECT 
        q.*,
        s.name as supplierName,
        COUNT(qi.id) as itemsCount
      FROM 
        supplier_quotes q
      JOIN 
        suppliers s ON q.supplierId = s.id
      LEFT JOIN 
        supplier_quote_items qi ON q.id = qi.quoteId
      WHERE 1=1
    `

    const params: any[] = []

    if (status && status !== "all") {
      sql += " AND q.status = ?"
      params.push(status)
    }

    if (supplierId && supplierId !== "all") {
      sql += " AND q.supplierId = ?"
      params.push(supplierId)
    }

    if (search) {
      sql += " AND (s.name LIKE ? OR q.id LIKE ?)"
      params.push(`%${search}%`, `%${search}%`)
    }

    if (startDate) {
      sql += " AND q.dateCreated >= ?"
      params.push(startDate)
    }

    if (endDate) {
      sql += " AND q.dateCreated <= ?"
      params.push(endDate)
    }

    sql += " GROUP BY q.id, s.name, q.supplierId, q.totalAmount, q.dateCreated, q.validUntil, q.status, q.notes, q.convertedInvoiceId, q.createdAt, q.updatedAt"
    sql += " ORDER BY q.dateCreated DESC"

    console.log("SQL query:", sql)
    console.log("SQL params:", params)

    const quotes = await query(sql, params)
    console.log("Quotes fetched:", quotes)

    return NextResponse.json(quotes)
  } catch (error) {
    console.error("Error fetching supplier quotes:", error)
    return NextResponse.json({ error: "Failed to fetch supplier quotes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const quote = await request.json()

    // Start a transaction
    const connection = await (await import("mysql2/promise")).createConnection({
      host: process.env.TIDB_HOST || "gateway01.us-west-2.prod.aws.tidbcloud.com",
      port: Number.parseInt(process.env.TIDB_PORT || "4000"),
      user: process.env.TIDB_USER || "3cCV8A7jGy25fjk.root",
      password: process.env.TIDB_PASSWORD || "S9SQ3wgf8ntySRRc",
      database: process.env.TIDB_DATABASE || "test",
      ssl: { rejectUnauthorized: true },
    })

    await connection.beginTransaction()

    try {
      // Insert quote header
      const [quoteResult] = await connection.execute(
        `INSERT INTO supplier_quotes (
          supplierId, dateCreated, validUntil, totalAmount, status, notes
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          quote.supplierId,
          quote.dateCreated,
          quote.validUntil,
          quote.totalAmount,
          quote.status,
          quote.notes || null,
        ],
      )

      const quoteId = (quoteResult as any).insertId

      // Insert quote items
      for (const item of quote.items) {
        await connection.execute(
          `INSERT INTO supplier_quote_items (
            quoteId, productId, quantity, unitPrice, totalPrice
          ) VALUES (?, ?, ?, ?, ?)`,
          [
            quoteId,
            item.productId,
            item.quantity,
            item.unitPrice,
            item.quantity * item.unitPrice,
          ],
        )
      }

      await connection.commit()

      return NextResponse.json(
        {
          message: "Quote created successfully",
          id: quoteId,
        },
        { status: 201 },
      )
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.end()
    }
  } catch (error) {
    console.error("Error creating supplier quote:", error)
    return NextResponse.json({ error: "Failed to create supplier quote" }, { status: 500 })
  }
}