import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const contributionsQuery = `
      SELECT 
        c.id,
        c.name,
        COALESCE(SUM(ci.totalAmount), 0) as revenue,
        COALESCE(COUNT(ci.id), 0) as orders
      FROM clients c
      LEFT JOIN client_invoices ci ON c.id = ci.clientId AND ci.payment_status = 'PAID'
      GROUP BY c.id, c.name
      ORDER BY revenue DESC
      LIMIT 10
    `;

    const result = await query(contributionsQuery);
    
    if (!Array.isArray(result)) {
      return NextResponse.json([]);
    }

    // Calculate total revenue for percentage calculation
    const totalRevenue = result.reduce((sum: number, client: any) => sum + Number(client.revenue), 0);

    const formattedData = result.map((client: any) => ({
      id: client.id,
      name: client.name,
      revenue: Number(client.revenue),
      percentage: totalRevenue > 0 ? (Number(client.revenue) / totalRevenue) * 100 : 0,
      orders: Number(client.orders)
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching client contributions:", error);
    return NextResponse.json({ error: "Failed to fetch client contributions" }, { status: 500 });
  }
}