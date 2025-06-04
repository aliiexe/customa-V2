import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    // Get product count by category
    const categoryQuery = `
      SELECT 
        c.id,
        c.name,
        COUNT(p.id) as productCount
      FROM 
        product_categories c
      LEFT JOIN 
        products p ON c.id = p.categoryId
      GROUP BY 
        c.id, c.name
      ORDER BY 
        productCount DESC
    `

    const categoryResults = await query(categoryQuery, [])

    // Get products without a category
    const uncategorizedQuery = `
      SELECT COUNT(*) as count
      FROM products
      WHERE categoryId IS NULL OR categoryId = 0
    `

    const uncategorizedResult = await query(uncategorizedQuery, [])
    const uncategorizedCount =
      Array.isArray(uncategorizedResult) && uncategorizedResult.length > 0 ? (uncategorizedResult[0] as any).count : 0

    // Format the results
    const chartData = Array.isArray(categoryResults)
      ? categoryResults.map((category: any) => ({
          name: category.name,
          value: category.productCount,
        }))
      : []

    // Add uncategorized if there are any
    if (uncategorizedCount > 0) {
      chartData.push({
        name: "Uncategorized",
        value: uncategorizedCount,
      })
    }

    return NextResponse.json(chartData)
  } catch (error) {
    console.error("Error fetching category distribution:", error)
    return NextResponse.json({ error: "Failed to fetch category distribution" }, { status: 500 })
  }
}
