import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get("clientId")
    const paymentStatus = searchParams.get("payment_status")
    const deliveryStatus = searchParams.get("delivery_status")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let sql = `
      SELECT 
        i.*,
        c.name as clientName,
        COUNT(ii.id) as itemCount
      FROM 
        client_invoices i
      JOIN 
        clients c ON i.clientId = c.id
      LEFT JOIN 
        client_invoice_items ii ON i.id = ii.invoiceId
      WHERE 1=1
    `

    const params: any[] = []

    if (clientId) {
      sql += " AND i.clientId = ?"
      params.push(clientId)
    }

    if (paymentStatus) {
      sql += " AND i.payment_status = ?"
      params.push(paymentStatus)
    }

    if (deliveryStatus) {
      sql += " AND i.delivery_status = ?"
      params.push(deliveryStatus)
    }

    if (startDate) {
      sql += " AND i.dateCreated >= ?"
      params.push(startDate)
    }

    if (endDate) {
      sql += " AND i.dateCreated <= ?"
      params.push(endDate)
    }

    sql +=
      " GROUP BY i.id, c.name, i.clientId, i.quoteId, i.totalAmount, i.dateCreated, i.deliveryDate, i.payment_status, i.delivery_status, i.createdAt, i.updatedAt"
    sql += " ORDER BY i.dateCreated DESC"

    const invoices = await query(sql, params)

    return NextResponse.json(invoices)
  } catch (error) {
    console.error("Error fetching client invoices:", error)
    return NextResponse.json({ error: "Failed to fetch client invoices" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const invoice = await request.json()

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
      // Insert invoice header
      const [invoiceResult] = await connection.execute(
        `INSERT INTO client_invoices (
          clientId, quoteId, totalAmount, dateCreated, deliveryDate, payment_status, delivery_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          invoice.clientId,
          invoice.quoteId || null,
          invoice.totalAmount,
          invoice.dateCreated || new Date(),
          invoice.deliveryDate,
          invoice.payment_status || "UNPAID",
          invoice.delivery_status || "IN_PROCESS",
        ],
      )

      const invoiceId = (invoiceResult as any).insertId

      // Insert invoice items
      if (invoice.items && Array.isArray(invoice.items)) {
        for (const item of invoice.items) {
          await connection.execute(
            `INSERT INTO client_invoice_items (
              invoiceId, productId, quantity, unitPrice, totalPrice
            ) VALUES (?, ?, ?, ?, ?)`,
            [invoiceId, item.productId, item.quantity, item.unitPrice, item.totalPrice],
          )

          // Update product stock if needed
          if (invoice.updateStock) {
            await connection.execute(
              `UPDATE products 
               SET stockQuantity = stockQuantity - ?, 
                   updatedAt = CURRENT_TIMESTAMP
               WHERE id = ?`,
              [item.quantity, item.productId],
            )
          }
        }
      }

      // If this invoice was created from a quote, update the quote status
      if (invoice.quoteId) {
        await connection.execute(
          `UPDATE client_quotes 
           SET status = 'CONVERTED', 
               updatedAt = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [invoice.quoteId],
        )
      }

      await connection.commit()

      return NextResponse.json(
        {
          message: "Invoice created successfully",
          id: invoiceId,
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
    console.error("Error creating client invoice:", error)
    return NextResponse.json({ error: "Failed to create client invoice" }, { status: 500 })
  }
}
