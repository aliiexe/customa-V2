import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    // Get the count of products for each category
    const sql = `
      SELECT 
        c.*,
        COUNT(p.id) as productsCount
      FROM 
        product_categories c
      LEFT JOIN 
        products p ON c.id = p.categoryId
      GROUP BY 
        c.id, c.name, c.createdAt, c.updatedAt
      ORDER BY 
        c.name ASC
    `

    const categories = await query(sql, [])
    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json()

    const sql = `
      INSERT INTO product_categories (name) 
      VALUES (?)
    `

    const result = await query(sql, [name])

    return NextResponse.json(
      {
        message: "Category created successfully",
        id: (result as any).insertId,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}
