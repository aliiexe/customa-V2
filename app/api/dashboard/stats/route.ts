import { NextResponse } from "next/server";
import { query } from "@/lib/db";

//
// ─── TYPE DEFINITIONS ─────────────────────────────────────────────────────────
//
type RevenueRow = { revenue: number };
type ExpensesRow = { expenses: number };
type InventoryMetrics = {
  totalProducts: number;
  lowStockAlerts: number;
  outOfStockCount: number;
  totalInventoryValue: number;
};
type OrderMetrics = {
  pendingInvoices: number;
  pendingInvoicesValue: number;
  completedOrdersToday: number;
  overdueInvoices: number;
};
type ClientMetrics = {
  totalClients: number;
  activeClients: number;
  newClientsThisMonth: number;
};
type SupplierMetrics = {
  totalSuppliers: number;
  unpaidSupplierInvoices: number;
  unpaidSupplierAmount: number;
};
type AvgOrderRow = { avgOrderValue: number };

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30";

    const daysAgo = parseInt(period, 10);
    const currentDate = new Date();
    const startDate = new Date(currentDate.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const previousStartDate = new Date(startDate.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    // ─── REVENUE QUERIES ────────────────────────────────────────────────────────
    const currentRevenueResult = await query(
      `
      SELECT COALESCE(SUM(totalAmount), 0) as revenue
      FROM client_invoices 
      WHERE payment_status = 'PAID' 
        AND dateCreated >= ?
      `,
      [startDate.toISOString().split("T")[0]]
    ) as RevenueRow[];

    const previousRevenueResult = await query(
      `
      SELECT COALESCE(SUM(totalAmount), 0) as revenue
      FROM client_invoices 
      WHERE payment_status = 'PAID'
        AND dateCreated >= ? 
        AND dateCreated < ?
      `,
      [
        previousStartDate.toISOString().split("T")[0],
        startDate.toISOString().split("T")[0],
      ]
    ) as RevenueRow[];

    const totalRevenueResult = await query(
      `
      SELECT COALESCE(SUM(totalAmount), 0) as revenue
      FROM client_invoices 
      WHERE payment_status = 'PAID'
      `,
      []
    ) as RevenueRow[];

    // ─── EXPENSES ──────────────────────────────────────────────────────────────
    const totalExpensesResult = await query(
      `
      SELECT COALESCE(SUM(totalAmount), 0) as expenses
      FROM supplier_invoices 
      WHERE payment_status = 'PAID'
      `,
      []
    ) as ExpensesRow[];

    // ─── INVENTORY METRICS ─────────────────────────────────────────────────────
    const inventoryResult = await query(
      `
      SELECT 
        COUNT(*) as totalProducts,
        COALESCE(SUM(CASE WHEN stockQuantity <= 10 THEN 1 ELSE 0 END), 0) as lowStockAlerts,
        COALESCE(SUM(CASE WHEN stockQuantity = 0 THEN 1 ELSE 0 END), 0) as outOfStockCount,
        COALESCE(SUM(sellingPrice * stockQuantity), 0) as totalInventoryValue
      FROM products
      `,
      []
    ) as InventoryMetrics[];
    const inventory = inventoryResult[0] ?? {
      totalProducts: 0,
      lowStockAlerts: 0,
      outOfStockCount: 0,
      totalInventoryValue: 0,
    };

    // ─── ORDER METRICS ─────────────────────────────────────────────────────────
    const orderMetricsResult = await query(
      `
      SELECT 
        COUNT(CASE WHEN payment_status = 'UNPAID' THEN 1 END) as pendingInvoices,
        COALESCE(SUM(CASE WHEN payment_status = 'UNPAID' THEN totalAmount ELSE 0 END), 0) as pendingInvoicesValue,
        COUNT(CASE WHEN DATE(dateCreated) = CURDATE() AND payment_status = 'PAID' THEN 1 END) as completedOrdersToday,
        COUNT(CASE WHEN payment_status = 'UNPAID' AND DATEDIFF(CURDATE(), dateCreated) > 30 THEN 1 END) as overdueInvoices
      FROM client_invoices
      `,
      []
    ) as OrderMetrics[];
    const orders = orderMetricsResult[0] ?? {
      pendingInvoices: 0,
      pendingInvoicesValue: 0,
      completedOrdersToday: 0,
      overdueInvoices: 0,
    };

    // ─── CLIENT METRICS ────────────────────────────────────────────────────────
    const clientMetricsResult = await query(
      `
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
      `,
      []
    ) as ClientMetrics[];
    const clients = clientMetricsResult[0] ?? {
      totalClients: 0,
      activeClients: 0,
      newClientsThisMonth: 0,
    };

    // ─── SUPPLIER METRICS ──────────────────────────────────────────────────────
    const supplierMetricsResult = await query(
      `
      SELECT 
        COUNT(DISTINCT s.id) as totalSuppliers,
        COUNT(CASE WHEN si.payment_status = 'UNPAID' THEN 1 END) as unpaidSupplierInvoices,
        COALESCE(SUM(CASE WHEN si.payment_status = 'UNPAID' THEN si.totalAmount ELSE 0 END), 0) as unpaidSupplierAmount
      FROM suppliers s
      LEFT JOIN supplier_invoices si ON s.id = si.supplierId
      `,
      []
    ) as SupplierMetrics[];
    const suppliers = supplierMetricsResult[0] ?? {
      totalSuppliers: 0,
      unpaidSupplierInvoices: 0,
      unpaidSupplierAmount: 0,
    };

    // ─── AVERAGE ORDER VALUE ───────────────────────────────────────────────────
    const avgOrderResult = await query(
      `
      SELECT COALESCE(AVG(totalAmount), 0) as avgOrderValue
      FROM client_invoices 
      WHERE payment_status = 'PAID'
      `,
      []
    ) as AvgOrderRow[];
    const avgOrderValue = avgOrderResult[0]?.avgOrderValue ?? 0;

    // ─── AGGREGATE CALCULATIONS ────────────────────────────────────────────────
    const currentRevenue = currentRevenueResult[0]?.revenue ?? 0;
    const previousRevenue = previousRevenueResult[0]?.revenue ?? 0;
    const totalRevenue = totalRevenueResult[0]?.revenue ?? 0;
    const totalExpenses = totalExpensesResult[0]?.expenses ?? 0;

    const totalProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const revenueGrowth =
      previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    return NextResponse.json({
      totalRevenue,
      monthlyRevenue: currentRevenue,
      revenueGrowth,
      totalProfit,
      profitMargin,

      totalProducts: inventory.totalProducts,
      lowStockAlerts: inventory.lowStockAlerts,
      outOfStockCount: inventory.outOfStockCount,
      totalInventoryValue: inventory.totalInventoryValue,

      pendingInvoices: orders.pendingInvoices,
      pendingInvoicesValue: orders.pendingInvoicesValue,
      completedOrdersToday: orders.completedOrdersToday,
      overdueInvoices: orders.overdueInvoices,

      totalClients: clients.totalClients,
      activeClients: clients.activeClients,
      newClientsThisMonth: clients.newClientsThisMonth,
      topClientRevenue: 0, // TODO

      totalSuppliers: suppliers.totalSuppliers,
      unpaidSupplierInvoices: suppliers.unpaidSupplierInvoices,
      unpaidSupplierAmount: suppliers.unpaidSupplierAmount,

      avgOrderValue,
      conversionRate: 85, // TODO
      customerSatisfaction: 92 // TODO
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
