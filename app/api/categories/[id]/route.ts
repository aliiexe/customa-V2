import { NextResponse } from "next/server"
import { query } from "@/lib/db"

// Get a single category
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const sql = `SELECT * FROM product_categories WHERE id = ?`
    const category = await query(sql, [id])

    if ((category as any[]).length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json((category as any[])[0])
  } catch (error) {
    console.error(`Error fetching category ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 })
  }
}

// Update a category
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { name } = await request.json()

    const sql = `
      UPDATE product_categories
      SET name = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `

    const result = await query(sql, [name, id])

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Category updated successfully",
    })
  } catch (error) {
    console.error(`Error updating category ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}

// Delete a category
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Check if category is used in any products
    const checkProductsQuery = `
      SELECT COUNT(*) as count FROM products WHERE categoryId = ?
    `
    const productsResult = await query(checkProductsQuery, [id])
    const productCount = Array.isArray(productsResult) && productsResult.length > 0 
      ? (productsResult[0] as any).count 
      : 0

    if (productCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete category that contains products" },
        { status: 400 }
      )
    }

    // Delete the category
    const deleteQuery = `DELETE FROM product_categories WHERE id = ?`
    const result = await query(deleteQuery, [id])

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Category deleted successfully" })
  } catch (error) {
    console.error(`Error deleting category ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}