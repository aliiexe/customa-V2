import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    // Get total products
    const productsResult = await query("SELECT COUNT(*) as count FROM products", [])
    const totalProducts =
      Array.isArray(productsResult) && productsResult.length > 0 ? (productsResult[0] as any).count : 0

    // Get low stock products (less than 10 items)
    const lowStockResult = await query("SELECT COUNT(*) as count FROM products WHERE stockQuantity < 10", [])
    const lowStockProducts =
      Array.isArray(lowStockResult) && lowStockResult.length > 0 ? (lowStockResult[0] as any).count : 0

    // Get total revenue from client invoices
    const revenueResult = await query("SELECT SUM(totalAmount) as total FROM client_invoices WHERE status = 'PAID'", [])
    const totalRevenue =
      Array.isArray(revenueResult) && revenueResult.length > 0 ? (revenueResult[0] as any).total || 0 : 0

    // Get pending orders (unpaid client invoices)
    const pendingOrdersResult = await query("SELECT COUNT(*) as count FROM client_invoices WHERE status = 'UNPAID'", [])
    const pendingOrders =
      Array.isArray(pendingOrdersResult) && pendingOrdersResult.length > 0 ? (pendingOrdersResult[0] as any).count : 0

    // Get total clients
    const clientsResult = await query("SELECT COUNT(*) as count FROM clients", [])
    const totalClients = Array.isArray(clientsResult) && clientsResult.length > 0 ? (clientsResult[0] as any).count : 0

    // Get total suppliers
    const suppliersResult = await query("SELECT COUNT(*) as count FROM suppliers", [])
    const totalSuppliers =
      Array.isArray(suppliersResult) && suppliersResult.length > 0 ? (suppliersResult[0] as any).count : 0

    return NextResponse.json({
      totalProducts,
      lowStockProducts,
      totalRevenue,
      pendingOrders,
      totalClients,
      totalSuppliers,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard statistics" }, { status: 500 })
  }
}
