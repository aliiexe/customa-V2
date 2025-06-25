import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');

    // Since purchase_orders table doesn't exist, use product inventory value as proxy
    const expensesQuery = `
      SELECT 
        s.name,
        COALESCE(SUM(p.sellingPrice * p.stockQuantity), 0) as expenses,
        COUNT(DISTINCT p.id) as products
      FROM suppliers s
      LEFT JOIN products p ON s.id = p.supplierId
      GROUP BY s.id, s.name
      HAVING products > 0
      ORDER BY expenses DESC
      LIMIT ?
    `;

    const result = await query(expensesQuery, [limit]);
    
    if (!Array.isArray(result)) {
      return NextResponse.json([]);
    }

    const formattedData = result.map((supplier: any) => ({
      name: supplier.name,
      expenses: Number(supplier.expenses),
      products: Number(supplier.products)
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching supplier expenses data:", error);
    return NextResponse.json({ error: "Failed to fetch supplier expenses data" }, { status: 500 });
  }
}