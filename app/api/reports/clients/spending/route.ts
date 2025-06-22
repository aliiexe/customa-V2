import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const months = parseInt(url.searchParams.get('months') || '6');
    
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    const spendingQuery = `
      SELECT 
        DATE_FORMAT(dateCreated, '%b') as month,
        SUM(totalAmount) as spending,
        COUNT(*) as orders
      FROM client_invoices
      WHERE dateCreated >= ?
      GROUP BY DATE_FORMAT(dateCreated, '%b'), MONTH(dateCreated)
      ORDER BY MONTH(dateCreated)
    `;
    
    const spendingResult = await query(spendingQuery, [startDate.toISOString().split('T')[0]]);
    
    return NextResponse.json(Array.isArray(spendingResult) ? spendingResult : []);
    
  } catch (error) {
    console.error("Error fetching client spending data:", error);
    return NextResponse.json({ error: "Failed to fetch client spending data" }, { status: 500 });
  }
}