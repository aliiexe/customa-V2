import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // Get total products
    const totalQuery = `SELECT COUNT(*) as totalProducts FROM products`;
    const totalResult = await query(totalQuery);
    const totalProducts = Array.isArray(totalResult) && (totalResult as any[])[0] 
      ? (totalResult as any[])[0].totalProducts || 0 
      : 0;

    // Get low stock count using hardcoded threshold of 10
    const lowStockQuery = `
      SELECT COUNT(*) as lowStockCount 
      FROM products 
      WHERE stockQuantity <= 10 
      AND stockQuantity > 0
    `;
    const lowStockResult = await query(lowStockQuery);
    const lowStockCount = Array.isArray(lowStockResult) && (lowStockResult as { lowStockCount: number }[])[0] 
      ? (lowStockResult as { lowStockCount: number }[])[0].lowStockCount || 0 
      : 0;

    // Get out of stock count
    const outOfStockQuery = `
      SELECT COUNT(*) as outOfStockCount 
      FROM products 
      WHERE stockQuantity = 0
    `;
    const outOfStockResult = await query(outOfStockQuery);
    const outOfStockCount = Array.isArray(outOfStockResult) && (outOfStockResult as { outOfStockCount: number }[])[0] 
      ? (outOfStockResult as { outOfStockCount: number }[])[0].outOfStockCount || 0 
      : 0;

    // Get total inventory value
    const inventoryValueQuery = `
      SELECT SUM(sellingPrice * stockQuantity) as totalValue 
      FROM products
    `;
    const inventoryValueResult = await query(inventoryValueQuery);
    const totalInventoryValue = Array.isArray(inventoryValueResult) && (inventoryValueResult as { totalValue: number }[])[0] 
      ? (inventoryValueResult as { totalValue: number }[])[0].totalValue || 0 
      : 0;

    // Get categories count
    const categoriesQuery = `SELECT COUNT(*) as totalCategories FROM product_categories`;
    const categoriesResult = await query(categoriesQuery);
    const totalCategories = Array.isArray(categoriesResult) && (categoriesResult as { totalCategories: number }[])[0] 
      ? (categoriesResult as { totalCategories: number }[])[0].totalCategories || 0 
      : 0;

    return NextResponse.json({
      totalProducts: Number(totalProducts),
      lowStockCount: Number(lowStockCount),
      outOfStockCount: Number(outOfStockCount),
      totalInventoryValue: Number(totalInventoryValue),
      totalCategories: Number(totalCategories),
      inStockCount: Number(totalProducts - outOfStockCount)
    });

  } catch (error) {
    console.error("Error fetching product report data:", error);
    return NextResponse.json({ error: "Failed to fetch product data" }, { status: 500 });
  }
}