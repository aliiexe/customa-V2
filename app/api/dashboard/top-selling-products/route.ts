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
      WHERE 
        i.payment_status = 'PAID'
      GROUP BY 
        p.id, p.name, p.reference, p.stockQuantity
      ORDER BY 
        totalSold DESC
      LIMIT 5
    `

    const topProducts = await query(topProductsQuery, [])

    // Format the results - return empty array if no data
    const formattedProducts = Array.isArray(topProducts) && topProducts.length > 0
      ? topProducts.map((product: any) => ({
          id: product.id,
          name: product.name,
          reference: product.reference,
          sales: Number(product.totalSold),
          totalRevenue: Number(product.totalRevenue),
          currentStock: product.currentStock,
        }))
      : []

    return NextResponse.json(formattedProducts)

  } catch (error) {
    console.error("Error fetching top selling products:", error)
    return NextResponse.json(
      { error: "Failed to fetch top selling products" },
      { status: 500 }
    )
  }
}