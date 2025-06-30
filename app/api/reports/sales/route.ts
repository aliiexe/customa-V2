import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];

    console.log('Sales API - Date range:', { startDate, endDate }); // Debug log

    // Test the database connection first
    const testQuery = `SELECT COUNT(*) as total FROM client_invoices`;
    const testResult = await query(testQuery);
    console.log('Total invoices in database:', testResult); // Debug log

    // Get total revenue - using payment_status instead of status
    const revenueQuery = `
      SELECT SUM(totalAmount) as totalRevenue
      FROM client_invoices
      WHERE payment_status = 'PAID'
      AND dateCreated BETWEEN ? AND ?
    `;
    
    console.log('Revenue query:', revenueQuery); // Debug log
    const revenueResult = await query(revenueQuery, [startDate, endDate]);
    console.log('Revenue result:', revenueResult); // Debug log
    
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

    // Get all invoices for broader date range if needed
    const allRevenueQuery = `
      SELECT SUM(totalAmount) as allRevenue, COUNT(*) as allOrders
      FROM client_invoices
      WHERE payment_status = 'PAID'
    `;
    const allRevenueResult = await query(allRevenueQuery);
    console.log('All revenue result:', allRevenueResult); // Debug log

    // Calculate growth (simplified)
    const revenueGrowth = 5.2; // Placeholder - you can implement proper growth calculation

    const result = {
      totalRevenue: Number(totalRevenue),
      totalOrders: Number(totalOrders),
      avgOrderValue: Number(avgOrderValue),
      revenueGrowth: Number(revenueGrowth),
      // Add debug info
      debug: {
        startDate,
        endDate,
        rawRevenue: revenueResult,
        allRevenue: allRevenueResult
      }
    };

    console.log('Final sales result:', result); // Debug log
    return NextResponse.json(result);

  } catch (error) {
    console.error("Error fetching sales report data:", error);
    return NextResponse.json({ 
      error: "Failed to fetch sales data",
      details: error.message 
    }, { status: 500 });
  }
}