import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // Simplified query without complex subqueries
    const productsQuery = `
      SELECT 
        s.name as supplier,
        COUNT(p.id) as productCount,
        AVG(p.sellingPrice) as avgPrice
      FROM suppliers s
      LEFT JOIN products p ON s.id = p.supplierId
      GROUP BY s.id, s.name
      HAVING productCount > 0
      ORDER BY productCount DESC
    `;

    const result = await query(productsQuery);
    
    if (!Array.isArray(result)) {
      return NextResponse.json([]);
    }

    // Calculate total for percentages
    const totalProducts = result.reduce((sum: number, supplier: any) => sum + Number(supplier.productCount), 0);

    const formattedData = result.map((supplier: any) => ({
      name: supplier.supplier,
      totalProducts: Number(supplier.productCount),
      avgPrice: Number(supplier.avgPrice || 0),
      percentage: totalProducts > 0 ? (Number(supplier.productCount) / totalProducts) * 100 : 0
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching supplier products data:", error);
    return NextResponse.json({ error: "Failed to fetch supplier products data" }, { status: 500 });
  }
}