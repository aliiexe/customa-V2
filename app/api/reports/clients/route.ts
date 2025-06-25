import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];

    // Get total clients
    const totalClientsQuery = `SELECT COUNT(*) as totalClients FROM clients`;
    const totalClientsResult = await query(totalClientsQuery);
    const totalClients = Array.isArray(totalClientsResult) && totalClientsResult[0] 
      ? totalClientsResult[0].totalClients || 0 
      : 0;

    // Get active clients (clients with orders in last 3 months)
    const activeClientsQuery = `
      SELECT COUNT(DISTINCT c.id) as activeClients
      FROM clients c
      INNER JOIN client_invoices ci ON c.id = ci.clientId
      WHERE ci.dateCreated >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
      AND ci.payment_status = 'PAID'
    `;
    const activeClientsResult = await query(activeClientsQuery);
    const activeClients = Array.isArray(activeClientsResult) && activeClientsResult[0] 
      ? activeClientsResult[0].activeClients || 0 
      : 0;

    // Get total revenue from clients
    const revenueQuery = `
      SELECT COALESCE(SUM(totalAmount), 0) as totalRevenue
      FROM client_invoices
      WHERE payment_status = 'PAID'
      AND dateCreated BETWEEN ? AND ?
    `;
    const revenueResult = await query(revenueQuery, [startDate, endDate]);
    const totalRevenue = Array.isArray(revenueResult) && revenueResult[0] 
      ? revenueResult[0].totalRevenue || 0 
      : 0;

    // Get new clients this month
    const newClientsQuery = `
      SELECT COUNT(*) as newClients
      FROM clients
      WHERE createdAt >= DATE_FORMAT(NOW(), '%Y-%m-01')
    `;
    const newClientsResult = await query(newClientsQuery);
    const newClientsThisMonth = Array.isArray(newClientsResult) && newClientsResult[0] 
      ? newClientsResult[0].newClients || 0 
      : 0;

    // Calculate average lifetime value
    const avgLifetimeValue = totalClients > 0 ? totalRevenue / totalClients : 0;

    // Calculate retention rate
    const retentionRate = totalClients > 0 ? (activeClients / totalClients) * 100 : 0;

    return NextResponse.json({
      totalClients: Number(totalClients),
      activeClients: Number(activeClients),
      totalRevenue: Number(totalRevenue),
      newClientsThisMonth: Number(newClientsThisMonth),
      avgLifetimeValue: Number(avgLifetimeValue),
      retentionRate: Number(retentionRate)
    });

  } catch (error) {
    console.error("Error fetching client data:", error);
    return NextResponse.json({ error: "Failed to fetch client data" }, { status: 500 });
  }
}