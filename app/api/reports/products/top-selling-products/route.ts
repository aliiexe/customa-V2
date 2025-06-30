import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    // Get top selling products based on invoice items
    const topProductsQuery = `
      SELECT 
        p.id,
        p.name,
        p.reference,
        SUM(ii.quantity) as totalSold,
        SUM(ii.totalPrice) as totalRevenue,
        p.stockQuantity as currentStock
      FROM 
        products p
      JOIN 
        client_invoice_items ii ON p.id = ii.productId
      JOIN 
        client_invoices i ON ii.invoiceId = i.id
      GROUP BY 
        p.id, p.name, p.reference, p.stockQuantity
      ORDER BY 
        totalSold DESC
      LIMIT 5
    `

    const topProducts = await query(topProductsQuery, [])

    // Format the results
    let formattedProducts = []
    
    if (Array.isArray(topProducts) && topProducts.length > 0) {
      formattedProducts = topProducts.map((product: any) => ({
        id: product.id,
        name: product.name,
        reference: product.reference,
        sales: Number(product.totalSold),
        totalRevenue: Number(product.totalRevenue),
        currentStock: product.currentStock,
      }))
    } else {
      // Return sample data if no products are found
      formattedProducts = [
        { name: "Shaker", sales: 32, totalRevenue: 640, currentStock: 15 },
        { name: "Coffee Cup", sales: 24, totalRevenue: 480, currentStock: 8 },
        { name: "Water Bottle", sales: 18, totalRevenue: 360, currentStock: 12 },
        { name: "Thermos", sales: 15, totalRevenue: 450, currentStock: 5 },
        { name: "Insulated Mug", sales: 12, totalRevenue: 300, currentStock: 10 }
      ]
    }

    return NextResponse.json(formattedProducts)
  } catch (error) {
    console.error("Error fetching top selling products:", error)
    return NextResponse.json({ error: "Failed to fetch top selling products" }, { status: 500 })
  }
}