import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '5');
    
    const supplierExpensesQuery = `
      SELECT 
        s.name,
        COALESCE(SUM(po.totalAmount), 0) as expenses,
        COUNT(DISTINCT p.id) as products
      FROM suppliers s
      LEFT JOIN purchase_orders po ON s.id = po.supplierId AND po.status = 'COMPLETED'
      LEFT JOIN products p ON p.supplierId = s.id
      GROUP BY s.id, s.name
      ORDER BY expenses DESC
      LIMIT ?
    `;
    
    const expensesResult = await query(supplierExpensesQuery, [limit]);
    
    return NextResponse.json(Array.isArray(expensesResult) ? expensesResult : []);
    
  } catch (error) {
    console.error("Error fetching supplier expenses data:", error);
    return NextResponse.json({ error: "Failed to fetch supplier expenses data" }, { status: 500 });
  }
}