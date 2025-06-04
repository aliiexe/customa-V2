import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const sql = `
      SELECT 
        p.*, 
        c.name as categoryName,
        s.name as supplierName
      FROM 
        products p
      LEFT JOIN 
        product_categories c ON p.categoryId = c.id
      LEFT JOIN 
        suppliers s ON p.supplierId = s.id
      WHERE 
        p.id = ?
    `

    const result = await query(sql, [id])

    if (!Array.isArray(result) || result.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error(`Error fetching product ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const product = await request.json()

    const sql = `
      UPDATE products
      SET 
        name = ?,
        reference = ?,
        supplierPrice = ?,
        sellingPrice = ?,
        stockQuantity = ?,
        description = ?,
        supplierId = ?,
        categoryId = ?,
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `

    const queryParams = [
      product.name,
      product.reference,
      product.supplierPrice,
      product.sellingPrice,
      product.stockQuantity,
      product.description,
      product.supplierId,
      product.categoryId,
      id,
    ]

    const result = await query(sql, queryParams)

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Product updated successfully",
    })
  } catch (error) {
    console.error(`Error updating product ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Check if product is used in any invoice or quote
    const checkUsageQuery = `
      SELECT 
        (SELECT COUNT(*) FROM client_invoice_items WHERE productId = ?) +
        (SELECT COUNT(*) FROM client_quote_items WHERE productId = ?) +
        (SELECT COUNT(*) FROM supplier_invoice_items WHERE productId = ?) +
        (SELECT COUNT(*) FROM supplier_quote_items WHERE productId = ?) as usageCount
    `

    const usageResult = await query(checkUsageQuery, [id, id, id, id])
    const usageCount = Array.isArray(usageResult) && usageResult.length > 0 ? (usageResult[0] as any).usageCount : 0

    if (usageCount > 0) {
      return NextResponse.json({ error: "Cannot delete product as it is used in invoices or quotes" }, { status: 400 })
    }

    // Delete the product
    const sql = `DELETE FROM products WHERE id = ?`
    const result = await query(sql, [id])

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Product deleted successfully",
    })
  } catch (error) {
    console.error(`Error deleting product ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
