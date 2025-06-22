import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    // Get total clients count
    const clientsCountQuery = `SELECT COUNT(*) as totalClients FROM clients`;
    const clientsResult = await query(clientsCountQuery);
    const totalClients = Array.isArray(clientsResult) && clientsResult[0] 
      ? (clientsResult[0] as any).totalClients || 0 
      : 0;
    
    // Get active clients (with orders in the last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const activeClientsQuery = `
      SELECT COUNT(DISTINCT c.id) as activeClients
      FROM clients c
      JOIN client_invoices i ON c.id = i.clientId
      WHERE i.dateCreated >= ?
    `;
    
    const activeClientsResult = await query(activeClientsQuery, [threeMonthsAgo.toISOString().split('T')[0]]);
    const activeClients = Array.isArray(activeClientsResult) && activeClientsResult[0] 
      ? (activeClientsResult[0] as any).activeClients || 0 
      : 0;
    
    // Calculate average lifetime value
    const lifetimeValueQuery = `
      SELECT 
        c.id,
        SUM(i.totalAmount) as totalSpent
      FROM clients c
      LEFT JOIN client_invoices i ON c.id = i.clientId
      WHERE i.status = 'PAID'
      GROUP BY c.id
    `;
    
    const lifetimeValueResult = await query(lifetimeValueQuery);
    
    let avgLifetimeValue = 0;
    if (Array.isArray(lifetimeValueResult) && lifetimeValueResult.length > 0) {
      const totalSpent = lifetimeValueResult.reduce((sum, client) => sum + (client as any).totalSpent, 0);
      avgLifetimeValue = totalSpent / lifetimeValueResult.length;
    }
    
    return NextResponse.json({
      totalClients,
      activeClients,
      avgLifetimeValue
    });
    
  } catch (error) {
    console.error("Error fetching client report data:", error);
    return NextResponse.json({ error: "Failed to fetch client data" }, { status: 500 });
  }
}