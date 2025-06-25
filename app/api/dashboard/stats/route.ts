import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30";
    
    const daysAgo = parseInt(period);
    const currentDate = new Date();
    const startDate = new Date(currentDate.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    const previousStartDate = new Date(startDate.getTime() - (daysAgo * 24 * 60 * 60 * 1000));

    // Current period revenue
    const currentRevenueResult = await query(`
      SELECT COALESCE(SUM(totalAmount), 0) as revenue
      FROM client_invoices 
      WHERE payment_status = 'PAID' 
      AND dateCreated >= ?
    `, [startDate.toISOString().split('T')[0]]);

    // Previous period revenue for growth calculation
    const previousRevenueResult = await query(`
      SELECT COALESCE(SUM(totalAmount), 0) as revenue
      FROM client_invoices 
      WHERE payment_status = 'PAID' 
      AND dateCreated >= ? AND dateCreated < ?
    `, [previousStartDate.toISOString().split('T')[0], startDate.toISOString().split('T')[0]]);

    // Total revenue (all time)
    const totalRevenueResult = await query(`
      SELECT COALESCE(SUM(totalAmount), 0) as revenue
      FROM client_invoices 
      WHERE payment_status = 'PAID'
    `, []);

    // Total expenses
    const totalExpensesResult = await query(`
      SELECT COALESCE(SUM(totalAmount), 0) as expenses
      FROM supplier_invoices 
      WHERE payment_status = 'PAID'
    `, []);

    // Inventory metrics - Fixed column name to use lowercase 'reorderlevel'
    const inventoryResult = await query(`
      SELECT 
        COUNT(*) as totalProducts,
        COALESCE(SUM(CASE WHEN stockQuantity <= 10 THEN 1 ELSE 0 END), 0) as lowStockAlerts,
        COALESCE(SUM(CASE WHEN stockQuantity = 0 THEN 1 ELSE 0 END), 0) as outOfStockCount,
        COALESCE(SUM(sellingPrice * stockQuantity), 0) as totalInventoryValue
      FROM products
    `, []);

    // Order metrics
    const orderMetrics = await query(`
      SELECT 
        COUNT(CASE WHEN payment_status = 'UNPAID' THEN 1 END) as pendingInvoices,
        COALESCE(SUM(CASE WHEN payment_status = 'UNPAID' THEN totalAmount ELSE 0 END), 0) as pendingInvoicesValue,
        COUNT(CASE WHEN DATE(dateCreated) = CURDATE() AND payment_status = 'PAID' THEN 1 END) as completedOrdersToday,
        COUNT(CASE WHEN payment_status = 'UNPAID' AND DATEDIFF(CURDATE(), dateCreated) > 30 THEN 1 END) as overdueInvoices
      FROM client_invoices
    `, []);

    // Client metrics
    const clientMetrics = await query(`
      SELECT 
        COUNT(*) as totalClients,
        COUNT(CASE WHEN lastOrderDate >= DATE_SUB(CURDATE(), INTERVAL 90 DAY) THEN 1 END) as activeClients,
        COUNT(CASE WHEN DATE(createdAt) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as newClientsThisMonth
      FROM (
        SELECT 
          c.*,
          MAX(ci.dateCreated) as lastOrderDate
        FROM clients c
        LEFT JOIN client_invoices ci ON c.id = ci.clientId
        GROUP BY c.id
      ) client_data
    `, []);

    // Supplier metrics  
    const supplierMetrics = await query(`
      SELECT 
        COUNT(DISTINCT s.id) as totalSuppliers,
        COUNT(CASE WHEN si.payment_status = 'UNPAID' THEN 1 END) as unpaidSupplierInvoices,
        COALESCE(SUM(CASE WHEN si.payment_status = 'UNPAID' THEN si.totalAmount ELSE 0 END), 0) as unpaidSupplierAmount
      FROM suppliers s
      LEFT JOIN supplier_invoices si ON s.id = si.supplierId
    `, []);

    // Average order value
    const avgOrderResult = await query(`
      SELECT COALESCE(AVG(totalAmount), 0) as avgOrderValue
      FROM client_invoices 
      WHERE payment_status = 'PAID'
    `, []);

    // Extract values
    const currentRevenue = Array.isArray(currentRevenueResult) ? currentRevenueResult[0]?.revenue || 0 : 0;
    const previousRevenue = Array.isArray(previousRevenueResult) ? previousRevenueResult[0]?.revenue || 0 : 0;
    const totalRevenue = Array.isArray(totalRevenueResult) ? totalRevenueResult[0]?.revenue || 0 : 0;
    const totalExpenses = Array.isArray(totalExpensesResult) ? totalExpensesResult[0]?.expenses || 0 : 0;
    
    const inventory = Array.isArray(inventoryResult) ? inventoryResult[0] : {};
    const orders = Array.isArray(orderMetrics) ? orderMetrics[0] : {};
    const clients = Array.isArray(clientMetrics) ? clientMetrics[0] : {};
    const suppliers = Array.isArray(supplierMetrics) ? supplierMetrics[0] : {};
    const avgOrder = Array.isArray(avgOrderResult) ? avgOrderResult[0]?.avgOrderValue || 0 : 0;

    // Calculate metrics
    const totalProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    return NextResponse.json({
      totalRevenue: Number(totalRevenue),
      monthlyRevenue: Number(currentRevenue),
      revenueGrowth: Number(revenueGrowth),
      totalProfit: Number(totalProfit),
      profitMargin: Number(profitMargin),
      
      totalProducts: Number(inventory.totalProducts || 0),
      lowStockAlerts: Number(inventory.lowStockAlerts || 0),
      outOfStockCount: Number(inventory.outOfStockCount || 0),
      totalInventoryValue: Number(inventory.totalInventoryValue || 0),
      
      pendingInvoices: Number(orders.pendingInvoices || 0),
      pendingInvoicesValue: Number(orders.pendingInvoicesValue || 0),
      completedOrdersToday: Number(orders.completedOrdersToday || 0),
      overdueInvoices: Number(orders.overdueInvoices || 0),
      
      totalClients: Number(clients.totalClients || 0),
      activeClients: Number(clients.activeClients || 0),
      newClientsThisMonth: Number(clients.newClientsThisMonth || 0),
      topClientRevenue: 0, // TODO: Implement
      
      totalSuppliers: Number(suppliers.totalSuppliers || 0),
      unpaidSupplierInvoices: Number(suppliers.unpaidSupplierInvoices || 0),
      unpaidSupplierAmount: Number(suppliers.unpaidSupplierAmount || 0),
      
      avgOrderValue: Number(avgOrder),
      conversionRate: 85, // TODO: Calculate actual rate
      customerSatisfaction: 92 // TODO: Implement feedback system
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}
