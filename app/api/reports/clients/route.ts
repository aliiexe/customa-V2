import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];

    // Get total clients
    const totalClientsResult = await query(`SELECT COUNT(*) as totalClients FROM clients`);
    const totalClients = Array.isArray(totalClientsResult) && (totalClientsResult as { totalClients: number }[])[0] 
      ? Number((totalClientsResult as { totalClients: number }[])[0].totalClients) || 0 
      : 0;

    // Get active clients (clients with paid orders in last 3 months)
    const activeClientsResult = await query(`
      SELECT COUNT(DISTINCT c.id) as activeClients
      FROM clients c
      INNER JOIN client_invoices ci ON c.id = ci.clientId
      WHERE ci.dateCreated >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
      AND ci.payment_status = 'PAID'
    `);
    const activeClientsArray = activeClientsResult as { activeClients: number }[];
    const activeClients = Array.isArray(activeClientsArray) && activeClientsArray[0] 
      ? Number(activeClientsArray[0].activeClients) || 0 
      : 0;

    // Get total revenue from clients in date range
    const revenueResult = await query(`
      SELECT COALESCE(SUM(totalAmount), 0) as totalRevenue
      FROM client_invoices
      WHERE payment_status = 'PAID'
      AND dateCreated BETWEEN ? AND ?
    `, [startDate, endDate]);
    const totalRevenueArray = revenueResult as { totalRevenue: number }[];
    const totalRevenue = Array.isArray(totalRevenueArray) && totalRevenueArray[0] 
      ? Number(totalRevenueArray[0].totalRevenue) || 0 
      : 0;

    // Get new clients this month
    const newClientsResult = await query(`
      SELECT COUNT(*) as newClients
      FROM clients
      WHERE createdAt >= DATE_FORMAT(NOW(), '%Y-%m-01')
    `);
    const newClientsArray = newClientsResult as { newClients: number }[];
    const newClientsThisMonth = Array.isArray(newClientsArray) && newClientsArray[0] 
      ? Number(newClientsArray[0].newClients) || 0 
      : 0;

    // Calculate metrics
    const avgLifetimeValue = totalClients > 0 ? totalRevenue / totalClients : 0;
    const retentionRate = totalClients > 0 ? (activeClients / totalClients) * 100 : 0;

    return NextResponse.json({
      totalClients,
      activeClients,
      totalRevenue,
      newClientsThisMonth,
      avgLifetimeValue: Number(avgLifetimeValue.toFixed(2)),
      retentionRate: Number(retentionRate.toFixed(2))
    });

  } catch (error) {
    console.error("Error fetching client data:", error);
    return NextResponse.json({ 
      error: "Failed to fetch client data",
      totalClients: 0,
      activeClients: 0,
      totalRevenue: 0,
      newClientsThisMonth: 0,
      avgLifetimeValue: 0,
      retentionRate: 0
    }, { status: 500 });
  }
}