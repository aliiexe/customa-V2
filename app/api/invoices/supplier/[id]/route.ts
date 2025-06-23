import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const invoiceId = params.id

    const invoiceResult = await query(
      `SELECT si.*, s.name as supplierName, s.email as supplierEmail, s.address as supplierAddress
       FROM supplier_invoices si 
       LEFT JOIN suppliers s ON si.supplierId = s.id 
       WHERE si.id = ?`,
      [invoiceId],
    )

    if ((invoiceResult as any[]).length === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const invoice = (invoiceResult as any[])[0]

    const itemsResult = await query(
      `SELECT sii.*, p.name as productName, p.reference as productReference
       FROM supplier_invoice_items sii 
       LEFT JOIN products p ON sii.productId = p.id 
       WHERE sii.invoiceId = ?`,
      [invoiceId],
    )

    invoice.items = itemsResult

    return NextResponse.json(invoice)
  } catch (error) {
    console.error("Error fetching supplier invoice:", error)
    return NextResponse.json({ error: "Failed to fetch supplier invoice" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const invoiceId = params.id
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: "No status provided to update." }, { status: 400 })
    }

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
      // Get current invoice status and items
      const [currentInvoice] = await connection.execute(
        "SELECT status FROM supplier_invoices WHERE id = ?",
        [invoiceId]
      )
      
      const [items] = await connection.execute(
        "SELECT productId, quantity FROM supplier_invoice_items WHERE invoiceId = ?",
        [invoiceId]
      )

      // Update invoice status
      await connection.execute(
        "UPDATE supplier_invoices SET status = ?, updatedAt = NOW() WHERE id = ?",
        [status, invoiceId]
      )

      // Handle stock updates based on status change
      if (status === "received" && (currentInvoice as any[])[0].status !== "received") {
        // When status changes to received, move provisional stock to actual stock
        for (const item of items as any[]) {
          await connection.execute(
            `UPDATE products 
             SET stockQuantity = stockQuantity + ?,
                 provisionalStock = provisionalStock - ?,
                 updatedAt = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [item.quantity, item.quantity, item.productId]
          )
        }
      }

      await connection.commit()

      // Fetch updated invoice with items
      const [updatedInvoiceResult] = await connection.execute(
        `SELECT si.*, s.name as supplierName, s.email as supplierEmail, s.address as supplierAddress
         FROM supplier_invoices si 
         LEFT JOIN suppliers s ON si.supplierId = s.id 
         WHERE si.id = ?`,
        [invoiceId]
      )

      if ((updatedInvoiceResult as any[]).length === 0) {
        return NextResponse.json({ error: "Invoice not found after update" }, { status: 404 })
      }

      const updatedInvoice = (updatedInvoiceResult as any[])[0]

      const [itemsResult] = await connection.execute(
        `SELECT sii.*, p.name as productName, p.reference as productReference
         FROM supplier_invoice_items sii 
         LEFT JOIN products p ON sii.productId = p.id 
         WHERE sii.invoiceId = ?`,
        [invoiceId]
      )

      updatedInvoice.items = itemsResult

      return NextResponse.json(updatedInvoice)
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.end()
    }
  } catch (error) {
    console.error("Error updating supplier invoice:", error)
    return NextResponse.json({ error: "Failed to update supplier invoice" }, { status: 500 })
  }
} 