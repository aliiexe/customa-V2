import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId")
    const supplierId = searchParams.get("supplierId")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "name"
    const sortOrder = searchParams.get("sortOrder") || "asc"

    // Build the query with filters
    let sql = `
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
      WHERE 1=1
    `

    const params: any[] = []

    if (categoryId) {
      sql += " AND p.categoryId = ?"
      params.push(categoryId)
    }

    if (supplierId) {
      sql += " AND p.supplierId = ?"
      params.push(supplierId)
    }

    if (search) {
      sql += " AND (p.name LIKE ? OR p.reference LIKE ? OR p.description LIKE ?)"
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }

    // Add sorting
    sql += ` ORDER BY ${sortBy} ${sortOrder}`

    const products = await query(sql, params)

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const product = await request.json()

    const sql = `
      INSERT INTO products (
        name, reference, supplierPrice, sellingPrice, 
        stockQuantity, description, supplierId, categoryId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `

    const params = [
      product.name,
      product.reference,
      product.supplierPrice,
      product.sellingPrice,
      product.stockQuantity,
      product.description,
      product.supplierId,
      product.categoryId,
    ]

    const result = await query(sql, params)

    return NextResponse.json(
      {
        message: "Product created successfully",
        id: (result as any).insertId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
