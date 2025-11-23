import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    // Get products with low stock (less than 20 items)
    const lowStockQuery = `
      SELECT 
        p.id,
        p.name,
        p.reference,
        p.stockQuantity,
        c.name as category
      FROM 
        products p
      LEFT JOIN 
        product_categories c ON p.categoryId = c.id
      WHERE 
        p.stockQuantity < 20
      ORDER BY 
        p.stockQuantity ASC
      LIMIT 10
    `

    const lowStockProducts = await query(lowStockQuery, [])

    // Format the results - return empty array if no data
    const formattedProducts = Array.isArray(lowStockProducts) && lowStockProducts.length > 0
      ? lowStockProducts.map((product: any) => ({
          id: product.id,
          name: product.name,
          reference: product.reference,
          stock: product.stockQuantity,
          category: product.category || "Uncategorized",
          status: product.stockQuantity <= 5 ? "critical" : product.stockQuantity <= 10 ? "low" : "medium",
        }))
      : []

    return NextResponse.json(formattedProducts)
  } catch (error) {
    console.error("Error fetching stock levels:", error)
    return NextResponse.json({ error: "Failed to fetch stock levels" }, { status: 500 })
  }
}