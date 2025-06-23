import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const invoiceId = params.id

    const invoiceResult = await query(
      `SELECT ci.*, c.name as clientName, c.email as clientEmail, c.address as clientAddress
       FROM client_invoices ci 
       LEFT JOIN clients c ON ci.clientId = c.id 
       WHERE ci.id = ?`,
      [invoiceId],
    )

    if ((invoiceResult as any[]).length === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const invoice = (invoiceResult as any[])[0]

    const itemsResult = await query(
      `SELECT cii.*, p.name as productName, p.reference as productReference
       FROM client_invoice_items cii 
       LEFT JOIN products p ON cii.productId = p.id 
       WHERE cii.invoiceId = ?`,
      [invoiceId],
    )

    invoice.items = itemsResult

    return NextResponse.json(invoice)
  } catch (error) {
    console.error("Error fetching client invoice:", error)
    return NextResponse.json({ error: "Failed to fetch client invoice" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const invoiceId = params.id
    const body = await request.json()
    const { payment_status, delivery_status } = body

    if (!payment_status && !delivery_status) {
      return NextResponse.json({ error: "No status provided to update." }, { status: 400 })
    }

    let sql = "UPDATE client_invoices SET "
    const sqlParams = []
    
    if (payment_status) {
      sql += "payment_status = ?"
      sqlParams.push(payment_status)
    }

    if (delivery_status) {
      if (payment_status) sql += ", "
      sql += "delivery_status = ?"
      sqlParams.push(delivery_status)
    }

    sql += ", updatedAt = NOW() WHERE id = ?"
    sqlParams.push(invoiceId)

    await query(sql, sqlParams)

    const updatedInvoiceResult = await query(
      `SELECT ci.*, c.name as clientName, c.email as clientEmail, c.address as clientAddress
       FROM client_invoices ci 
       LEFT JOIN clients c ON ci.clientId = c.id 
       WHERE ci.id = ?`,
      [invoiceId],
    )
    
    if ((updatedInvoiceResult as any[]).length === 0) {
      return NextResponse.json({ error: "Invoice not found after update" }, { status: 404 });
    }

    const updatedInvoice = (updatedInvoiceResult as any[])[0];

    const itemsResult = await query(
      `SELECT cii.*, p.name as productName, p.reference as productReference
       FROM client_invoice_items cii 
       LEFT JOIN products p ON cii.productId = p.id 
       WHERE cii.invoiceId = ?`,
      [invoiceId],
    );

    updatedInvoice.items = itemsResult;


    return NextResponse.json(updatedInvoice)
  } catch (error) {
    console.error("Error updating client invoice:", error)
    return NextResponse.json({ error: "Failed to update client invoice" }, { status: 500 })
  }
}
