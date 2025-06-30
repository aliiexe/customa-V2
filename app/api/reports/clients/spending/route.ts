import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const months = parseInt(searchParams.get('months') || '6');

    // Get monthly spending data from actual invoices
    const spendingQuery = `
      SELECT 
        DATE_FORMAT(ci.dateCreated, '%Y-%m') as month,
        COALESCE(SUM(ci.totalAmount), 0) as spending,
        COUNT(ci.id) as orders
      FROM client_invoices ci
      WHERE ci.payment_status = 'PAID'
      AND ci.dateCreated >= DATE_SUB(NOW(), INTERVAL ? MONTH)
      GROUP BY DATE_FORMAT(ci.dateCreated, '%Y-%m')
      ORDER BY month ASC
    `;

    const result = await query(spendingQuery, [months]);
    
    if (!Array.isArray(result)) {
      return NextResponse.json([]);
    }

    const formattedData = result.map((item: any) => ({
      month: item.month,
      spending: Number(item.spending),
      orders: Number(item.orders)
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching client spending data:", error);
    return NextResponse.json([]);
  }
}