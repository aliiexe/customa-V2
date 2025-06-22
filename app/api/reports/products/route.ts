import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    // Get total products count
    const productsCountQuery = `SELECT COUNT(*) as totalProducts FROM products`;
    const productsResult = await query(productsCountQuery);
    const totalProducts = Array.isArray(productsResult) && productsResult[0] 
      ? (productsResult[0] as any).totalProducts || 0 
      : 0;
    
    // Get low stock products (below reorder level)
    const lowStockQuery = `
      SELECT COUNT(*) as lowStockCount 
      FROM products 
      WHERE stockQuantity <= reorderLevel 
      AND stockQuantity > 0
    `;
    const lowStockResult = await query(lowStockQuery);
    const lowStockCount = Array.isArray(lowStockResult) && lowStockResult[0] 
      ? (lowStockResult[0] as any).lowStockCount || 0 
      : 0;
    
    // Get out of stock products
    const outOfStockQuery = `
      SELECT COUNT(*) as outOfStockCount 
      FROM products 
      WHERE stockQuantity = 0
    `;
    const outOfStockResult = await query(outOfStockQuery);
    const outOfStockCount = Array.isArray(outOfStockResult) && outOfStockResult[0] 
      ? (outOfStockResult[0] as any).outOfStockCount || 0 
      : 0;
    
    return NextResponse.json({
      totalProducts,
      lowStockCount,
      outOfStockCount
    });
    
  } catch (error) {
    console.error("Error fetching product report data:", error);
    return NextResponse.json({ error: "Failed to fetch product data" }, { status: 500 });
  }
}