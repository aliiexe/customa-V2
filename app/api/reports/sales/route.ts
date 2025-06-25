import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];

    // Get total revenue - using payment_status instead of status
    const revenueQuery = `
      SELECT SUM(totalAmount) as totalRevenue
      FROM client_invoices
      WHERE payment_status = 'PAID'
      AND dateCreated BETWEEN ? AND ?
    `;
    const revenueResult = await query(revenueQuery, [startDate, endDate]);
    const totalRevenue = Array.isArray(revenueResult) && revenueResult[0] 
      ? revenueResult[0].totalRevenue || 0 
      : 0;

    // Get total orders
    const ordersQuery = `
      SELECT COUNT(*) as totalOrders
      FROM client_invoices
      WHERE payment_status = 'PAID'
      AND dateCreated BETWEEN ? AND ?
    `;
    const ordersResult = await query(ordersQuery, [startDate, endDate]);
    const totalOrders = Array.isArray(ordersResult) && ordersResult[0] 
      ? ordersResult[0].totalOrders || 0 
      : 0;

    // Calculate average order value
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get previous period for growth calculation
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
    const prevEndDate = new Date(startDate);
    prevEndDate.setDate(prevEndDate.getDate() - 1);

    const prevRevenueQuery = `
      SELECT SUM(totalAmount) as prevRevenue
      FROM client_invoices
      WHERE payment_status = 'PAID'
      AND dateCreated BETWEEN ? AND ?
    `;
    const prevRevenueResult = await query(prevRevenueQuery, [prevStartDate.toISOString().split('T')[0], prevEndDate.toISOString().split('T')[0]]);
    const prevRevenue = Array.isArray(prevRevenueResult) && prevRevenueResult[0] 
      ? prevRevenueResult[0].prevRevenue || 0 
      : 0;

    const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    return NextResponse.json({
      totalRevenue: Number(totalRevenue),
      totalOrders: Number(totalOrders),
      avgOrderValue: Number(avgOrderValue),
      revenueGrowth: Number(revenueGrowth.toFixed(2))
    });

  } catch (error) {
    console.error("Error fetching sales report data:", error);
    return NextResponse.json({ error: "Failed to fetch sales data" }, { status: 500 });
  }
}