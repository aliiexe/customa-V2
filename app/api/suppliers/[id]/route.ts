import { NextResponse } from "next/server"
import { query } from "@/lib/db"

// Get a single supplier
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const sql = `
      SELECT * FROM suppliers 
      WHERE id = ?
    `
    const supplier = await query(sql, [id])

    if ((supplier as any[]).length === 0) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 })
    }

    return NextResponse.json((supplier as any[])[0])
  } catch (error) {
    console.error(`Error fetching supplier ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to fetch supplier" }, { status: 500 })
  }
}

// Update a supplier
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const supplier = await request.json()

    const sql = `
      UPDATE suppliers
      SET 
        name = ?,
        contactName = ?,
        address = ?,
        email = ?,
        phoneNumber = ?,
        website = ?,
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `

    const queryParams = [
      supplier.name,
      supplier.contactName,
      supplier.address,
      supplier.email,
      supplier.phoneNumber,
      supplier.website,
      id
    ]

    const result = await query(sql, queryParams)

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Supplier updated successfully",
    })
  } catch (error) {
    console.error(`Error updating supplier ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to update supplier" }, { status: 500 })
  }
}

// Delete a supplier
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Check if supplier is used in any products
    const checkProductsQuery = `
      SELECT COUNT(*) as count FROM products WHERE supplierId = ?
    `
    const productsResult = await query(checkProductsQuery, [id])
    const productCount = Array.isArray(productsResult) && productsResult.length > 0 
      ? (productsResult[0] as any).count 
      : 0

    if (productCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete supplier with associated products" },
        { status: 400 }
      )
    }

    // Check if supplier is used in any invoices/quotes
    const checkInvoicesQuery = `
      SELECT COUNT(*) as count FROM supplier_invoices WHERE supplierId = ?
    `
    const invoicesResult = await query(checkInvoicesQuery, [id])
    const invoiceCount = Array.isArray(invoicesResult) && invoicesResult.length > 0 
      ? (invoicesResult[0] as any).count 
      : 0

    if (invoiceCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete supplier with associated invoices" },
        { status: 400 }
      )
    }

    // Delete the supplier
    const deleteQuery = `DELETE FROM suppliers WHERE id = ?`
    const result = await query(deleteQuery, [id])

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Supplier deleted successfully" })
  } catch (error) {
    console.error(`Error deleting supplier ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to delete supplier" }, { status: 500 })
  }
}