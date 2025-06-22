import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const inventoryQuery = `
      SELECT 
        p.id,
        p.name,
        p.reference,
        pc.name as category,
        s.name as supplier,
        p.stockQuantity as inStock,
        p.reorderLevel,
        CASE
          WHEN p.stockQuantity = 0 THEN 'out-of-stock'
          WHEN p.stockQuantity <= p.reorderLevel THEN 'low-stock'
          ELSE 'in-stock'
        END as status
      FROM products p
      LEFT JOIN product_categories pc ON p.categoryId = pc.id
      LEFT JOIN suppliers s ON p.supplierId = s.id
      ORDER BY 
        CASE
          WHEN p.stockQuantity = 0 THEN 1
          WHEN p.stockQuantity <= p.reorderLevel THEN 2
          ELSE 3
        END,
        p.name
    `;
    
    const inventoryResult = await query(inventoryQuery);
    
    return NextResponse.json(Array.isArray(inventoryResult) ? inventoryResult : []);
    
  } catch (error) {
    console.error("Error fetching product inventory data:", error);
    return NextResponse.json({ error: "Failed to fetch product inventory data" }, { status: 500 });
  }
}