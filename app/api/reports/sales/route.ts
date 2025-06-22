import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    // Get query params for date filtering
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate') || 
      new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]; // Default to Jan 1st
    const endDate = url.searchParams.get('endDate') || 
      new Date().toISOString().split('T')[0]; // Default to today

    // Get total revenue
    const revenueQuery = `
      SELECT SUM(totalAmount) as totalRevenue
      FROM client_invoices
      WHERE status = 'PAID'
      AND dateCreated BETWEEN ? AND ?
    `;
    
    const revenueResult = await query(revenueQuery, [startDate, endDate]);
    const totalRevenue = Array.isArray(revenueResult) && revenueResult[0] 
      ? (revenueResult[0] as any).totalRevenue || 0 
      : 0;
    
    // Get total orders
    const ordersQuery = `
      SELECT COUNT(*) as totalOrders
      FROM client_invoices
      WHERE dateCreated BETWEEN ? AND ?
    `;
    
    const ordersResult = await query(ordersQuery, [startDate, endDate]);
    const totalOrders = Array.isArray(ordersResult) && ordersResult[0] 
      ? (ordersResult[0] as any).totalOrders || 0 
      : 0;
    
    // Calculate average order value
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Calculate growth compared to previous period
    const previousStartDate = new Date(new Date(startDate).getTime() - 
      (new Date(endDate).getTime() - new Date(startDate).getTime())).toISOString().split('T')[0];
    
    const prevRevenueQuery = `
      SELECT SUM(totalAmount) as prevRevenue
      FROM client_invoices
      WHERE status = 'PAID'
      AND dateCreated BETWEEN ? AND ?
    `;
    
    const prevRevenueResult = await query(prevRevenueQuery, [previousStartDate, startDate]);
    const prevRevenue = Array.isArray(prevRevenueResult) && prevRevenueResult[0] 
      ? (prevRevenueResult[0] as any).prevRevenue || 0 
      : 0;
    
    const revenueGrowth = prevRevenue > 0 
      ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 
      : 0;
    
    return NextResponse.json({
      totalRevenue,
      totalOrders,
      avgOrderValue,
      revenueGrowth
    });
    
  } catch (error) {
    console.error("Error fetching sales report data:", error);
    return NextResponse.json({ error: "Failed to fetch sales data" }, { status: 500 });
  }
}