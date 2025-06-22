import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    // Get total product count for percentage calculation
    const totalProductsQuery = `SELECT COUNT(*) as totalProducts FROM products`;
    const totalResult = await query(totalProductsQuery);
    const totalProducts = Array.isArray(totalResult) && totalResult[0] 
      ? (totalResult[0] as any).totalProducts || 0 
      : 1; // Avoid division by zero
    
    const supplierProductsQuery = `
      SELECT 
        s.id,
        s.name as supplier,
        COUNT(p.id) as productCount,
        AVG(p.sellingPrice) as avgPrice,
        (SELECT 
          pc.name 
         FROM products p2 
         JOIN product_categories pc ON p2.categoryId = pc.id 
         WHERE p2.supplierId = s.id 
         GROUP BY pc.id 
         ORDER BY COUNT(*) DESC 
         LIMIT 1) as topCategory,
        (SELECT 
          GROUP_CONCAT(DISTINCT pc.name) 
         FROM products p2 
         JOIN product_categories pc ON p2.categoryId = pc.id 
         WHERE p2.supplierId = s.id) as categories
      FROM suppliers s
      LEFT JOIN products p ON s.id = p.supplierId
      GROUP BY s.id, s.name
      ORDER BY productCount DESC
    `;
    
    const suppliersResult = await query(supplierProductsQuery);
    
    const formattedResult = Array.isArray(suppliersResult) 
      ? suppliersResult.map((item: any) => {
          // Parse categories into array
          const categories = item.categories ? item.categories.split(',') : [];
          
          return {
            id: item.id,
            supplier: item.supplier,
            categories: categories,
            productCount: item.productCount || 0,
            percentageOfTotal: parseFloat(((item.productCount / totalProducts) * 100).toFixed(1)),
            avgPrice: parseFloat((item.avgPrice || 0).toFixed(2)),
            topCategory: item.topCategory || "N/A"
          };
        })
      : [];
    
    return NextResponse.json(formattedResult);
    
  } catch (error) {
    console.error("Error fetching supplier products data:", error);
    return NextResponse.json({ error: "Failed to fetch supplier products data" }, { status: 500 });
  }
}