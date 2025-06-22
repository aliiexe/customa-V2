import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '5');
    
    const topClientsQuery = `
      SELECT 
        c.id,
        c.name,
        COALESCE(SUM(i.totalAmount), 0) as totalSpent,
        COUNT(i.id) as orderCount,
        MAX(i.dateCreated) as lastPurchase,
        CASE 
          WHEN MAX(i.dateCreated) >= DATE_SUB(NOW(), INTERVAL 3 MONTH) THEN 'active' 
          ELSE 'inactive' 
        END as status
      FROM clients c
      LEFT JOIN client_invoices i ON c.id = i.clientId AND i.status = 'PAID'
      GROUP BY c.id, c.name
      ORDER BY totalSpent DESC
      LIMIT ?
    `;
    
    const topClientsResult = await query(topClientsQuery, [limit]);
    
    return NextResponse.json(Array.isArray(topClientsResult) ? topClientsResult : []);
    
  } catch (error) {
    console.error("Error fetching top clients data:", error);
    return NextResponse.json({ error: "Failed to fetch top clients data" }, { status: 500 });
  }
}