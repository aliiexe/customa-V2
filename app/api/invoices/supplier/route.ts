import { NextResponse } from "next/server"
import { query, transaction } from "@/lib/db"

export async function GET(request: Request) {
  try {
    console.log("GET /api/invoices/supplier called")
    const { searchParams } = new URL(request.url)
    const supplierId = searchParams.get("supplierId")
    const payment_status = searchParams.get("payment_status")
    const delivery_status = searchParams.get("delivery_status")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    console.log("Search params:", { supplierId, payment_status, delivery_status, startDate, endDate })

    let sql = `
      SELECT 
        i.*,
        s.name as supplierName,
        COUNT(ii.id) as itemCount
      FROM 
        supplier_invoices i
      JOIN 
        suppliers s ON i.supplierId = s.id
      LEFT JOIN 
        supplier_invoice_items ii ON i.id = ii.invoiceId
      WHERE 1=1
    `

    const params: any[] = []

    if (supplierId && supplierId !== "all") {
      sql += " AND i.supplierId = ?"
      params.push(supplierId)
    }

    if (payment_status && payment_status !== "all") {
      sql += " AND i.payment_status = ?"
      params.push(payment_status)
    }

    if (delivery_status && delivery_status !== "all") {
      sql += " AND i.delivery_status = ?"
      params.push(delivery_status)
    }

    if (startDate) {
      sql += " AND i.dateCreated >= ?"
      params.push(startDate)
    }

    if (endDate) {
      sql += " AND i.dateCreated <= ?"
      params.push(endDate)
    }

    sql += " GROUP BY i.id, s.name, i.supplierId, i.quoteId, i.totalAmount, i.dateCreated, i.deliveryDate, i.payment_status, i.delivery_status, i.createdAt, i.updatedAt"
    sql += " ORDER BY i.dateCreated DESC"

    console.log("SQL query:", sql)
    console.log("SQL params:", params)

    const invoices = await query(sql, params)
    console.log("Invoices fetched:", invoices)

    return NextResponse.json(invoices)
  } catch (error) {
    console.error("Error fetching supplier invoices:", error)
    return NextResponse.json({ error: "Failed to fetch supplier invoices" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const invoice = await request.json()

    const result = await transaction(async (connection) => {
      // Insert invoice header
      const [invoiceResult] = await connection.execute(
        `INSERT INTO supplier_invoices (
          supplierId, quoteId, totalAmount, dateCreated, deliveryDate, payment_status, delivery_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          invoice.supplierId,
          invoice.quoteId || null,
          invoice.totalAmount,
          invoice.dateCreated || new Date(),
          invoice.deliveryDate,
          invoice.payment_status || "UNPAID",
          invoice.delivery_status || "IN_PROCESS",
        ],
      )

      const invoiceId = (invoiceResult as any).insertId

      // Insert invoice items and update provisional stock
      if (invoice.items && Array.isArray(invoice.items)) {
        for (const item of invoice.items) {
          await connection.execute(
            `INSERT INTO supplier_invoice_items (
              invoiceId, productId, quantity, unitPrice, totalPrice
            ) VALUES (?, ?, ?, ?, ?)`,
            [invoiceId, item.productId, item.quantity, item.unitPrice, item.totalPrice],
          )

          // Update product provisional stock
          if (invoice.updateStock) {
            await connection.execute(
              `UPDATE products 
               SET provisionalStock = provisionalStock + ?, 
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
          `UPDATE supplier_quotes 
           SET status = 'CONVERTED', 
               convertedInvoiceId = ?,
               updatedAt = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [invoiceId, invoice.quoteId],
        )
      }

      return invoiceId
    })

    return NextResponse.json(
      {
        message: "Invoice created successfully",
        id: result,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating supplier invoice:", error)
    return NextResponse.json({ error: "Failed to create supplier invoice" }, { status: 500 })
  }
}