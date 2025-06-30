import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Only aggregate PAID invoices
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
      LEFT JOIN client_invoices i ON c.id = i.clientId AND i.payment_status = 'PAID'
      GROUP BY c.id, c.name
      HAVING totalSpent > 0
      ORDER BY totalSpent DESC
      LIMIT ?
    `;

    const result = await query(topClientsQuery, [limit]);
    
    if (!Array.isArray(result)) {
      return NextResponse.json([]);
    }

    const formattedData = result.map((client: any) => ({
      id: client.id,
      name: client.name,
      totalSpent: Number(client.totalSpent),
      orderCount: Number(client.orderCount),
      lastPurchase: client.lastPurchase,
      status: client.status
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching top clients data:", error);
    return NextResponse.json({ error: "Failed to fetch top clients data" }, { status: 500 });
  }
}