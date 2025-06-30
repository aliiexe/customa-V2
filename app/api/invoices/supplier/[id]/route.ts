import { NextResponse } from "next/server"
import { query, transaction } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: invoiceId } = await params;

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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: invoiceId } = await params
    console.log("Updating invoice with ID:", invoiceId)
    
    const body = await request.json()
    console.log("Update data:", body)
    
    // Perform update within a transaction
    const result = await transaction(async (connection) => {
      // First, get the current invoice data
      const [currentInvoice] = await connection.execute(
        "SELECT * FROM supplier_invoices WHERE id = ?",
        [invoiceId]
      )

      if ((currentInvoice as any[]).length === 0) {
        throw new Error("Invoice not found")
      }

      const current = (currentInvoice as any[])[0]
      console.log("Found invoice:", current)

      // Payment or delivery status updates
      if (body.payment_status || body.delivery_status) {
        const updateFields = []
        const updateValues = []
        
        if (body.payment_status) {
          updateFields.push("payment_status = ?")
          updateValues.push(body.payment_status)
        }
        
        if (body.delivery_status) {
          updateFields.push("delivery_status = ?")
          updateValues.push(body.delivery_status)
        }
        
        updateFields.push("updatedAt = NOW()")
        
        // Update just the status fields that were provided
        await connection.execute(
          `UPDATE supplier_invoices 
           SET ${updateFields.join(', ')} 
           WHERE id = ?`,
          [...updateValues, invoiceId]
        )

        // Handle stock updates when delivery status changes to DELIVERED
        if (body.delivery_status === "DELIVERED" && current.delivery_status !== "DELIVERED") {
          const [items] = await connection.execute(
            "SELECT productId, quantity FROM supplier_invoice_items WHERE invoiceId = ?",
            [invoiceId]
          )
          
          for (const item of items as any[]) {
            await connection.execute(
              `UPDATE products 
               SET stockQuantity = stockQuantity + ?,
                   provisionalStock = provisionalStock - ?,
                   updatedAt = NOW()
               WHERE id = ?`,
              [item.quantity, item.quantity, item.productId]
            )
          }
        }
      }
      
      // Return the invoice ID to fetch the updated invoice
      return invoiceId
    })

    // Fetch the complete updated invoice with items for the response
    const invoice = await query(
      `SELECT si.*, s.name as supplierName, s.email as supplierEmail, s.address as supplierAddress
       FROM supplier_invoices si 
       LEFT JOIN suppliers s ON si.supplierId = s.id 
       WHERE si.id = ?`,
      [invoiceId]
    )

    if ((invoice as any[]).length === 0) {
      return NextResponse.json({ error: "Invoice not found after update" }, { status: 404 })
    }

    const updatedInvoice = (invoice as any[])[0]

    const items = await query(
      `SELECT sii.*, p.name as productName, p.reference as productReference
       FROM supplier_invoice_items sii 
       LEFT JOIN products p ON sii.productId = p.id 
       WHERE sii.invoiceId = ?`,
      [invoiceId]
    )

    updatedInvoice.items = items

    return NextResponse.json(updatedInvoice)
  } catch (error) {
    console.error("Error updating supplier invoice:", error)
    return NextResponse.json({ error: "Failed to update supplier invoice" }, { status: 500 })
  }
}