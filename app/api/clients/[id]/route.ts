import { NextResponse } from "next/server"
import { query } from "@/lib/db"

// Get a single client
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const sql = `
      SELECT * FROM clients 
      WHERE id = ?
    `
    const client = await query(sql, [id])

    if ((client as any[]).length === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json((client as any[])[0])
  } catch (error) {
    console.error(`Error fetching client ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 })
  }
}

// Update a client
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const client = await request.json()

    const sql = `
      UPDATE clients
      SET 
        name = ?,
        address = ?,
        email = ?,
        phoneNumber = ?,
        iban = ?,
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `

    const queryParams = [
      client.name,
      client.address,
      client.email,
      client.phoneNumber,
      client.iban,
      id
    ]

    const result = await query(sql, queryParams)

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Client updated successfully",
    })
  } catch (error) {
    console.error(`Error updating client ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 })
  }
}

// Delete a client
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Check if client is used in any invoices
    const checkInvoicesQuery = `
      SELECT COUNT(*) as count FROM client_invoices WHERE clientId = ?
    `
    const invoicesResult = await query(checkInvoicesQuery, [id])
    const invoiceCount = Array.isArray(invoicesResult) && invoicesResult.length > 0 
      ? (invoicesResult[0] as any).count 
      : 0

    if (invoiceCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete client with associated invoices" },
        { status: 400 }
      )
    }

    // Check if client is used in any quotes
    const checkQuotesQuery = `
      SELECT COUNT(*) as count FROM client_quotes WHERE clientId = ?
    `
    const quotesResult = await query(checkQuotesQuery, [id])
    const quoteCount = Array.isArray(quotesResult) && quotesResult.length > 0 
      ? (quotesResult[0] as any).count 
      : 0

    if (quoteCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete client with associated quotes" },
        { status: 400 }
      )
    }

    // Delete the client
    const deleteQuery = `DELETE FROM clients WHERE id = ?`
    const result = await query(deleteQuery, [id])

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Client deleted successfully" })
  } catch (error) {
    console.error(`Error deleting client ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 })
  }
}