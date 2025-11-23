import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];

    // Get total suppliers count
    const suppliersCountQuery = `SELECT COUNT(*) as totalSuppliers FROM suppliers`;
    const suppliersResult = await query(suppliersCountQuery);
    const totalSuppliers = Array.isArray(suppliersResult) && suppliersResult[0] 
      ? (suppliersResult[0] as { totalSuppliers: number }).totalSuppliers || 0 
      : 0;

    // Get active suppliers (suppliers who have products)
    const activeSuppliersQuery = `
      SELECT COUNT(DISTINCT s.id) as activeSuppliers
      FROM suppliers s
      INNER JOIN products p ON s.id = p.supplierId
    `;
    const activeResult = await query(activeSuppliersQuery);
    const activeSuppliers = Array.isArray(activeResult) && activeResult[0] 
      ? (activeResult[0] as { activeSuppliers: number }).activeSuppliers || 0 
      : 0;

    // Get total products from suppliers
    const productsQuery = `
      SELECT COUNT(*) as totalProducts
      FROM products p
      INNER JOIN suppliers s ON p.supplierId = s.id
    `;
    const productsResult = await query(productsQuery);
    const totalProducts = Array.isArray(productsResult) && productsResult[0] 
      ? (productsResult[0] as { totalProducts: number }).totalProducts || 0 
      : 0;

    // Get supplier invoices if the table exists, otherwise use 0
    let totalExpenses = 0;
    let pendingInvoices = 0;
    let pendingAmount = 0;
    let averageDeliveryTime: number | null = null;
    let reliabilityScore: number | null = null;

    try {
      const expensesQuery = `
        SELECT COALESCE(SUM(totalAmount), 0) as totalExpenses
        FROM supplier_invoices
        WHERE payment_status = 'PAID'
        AND dateCreated BETWEEN ? AND ?
      `;
      const expensesResult = await query(expensesQuery, [startDate, endDate]);
      totalExpenses = Array.isArray(expensesResult) && expensesResult[0] 
        ? (expensesResult[0] as { totalExpenses: number }).totalExpenses || 0 
        : 0;

      const pendingQuery = `
        SELECT 
          COUNT(*) as pendingInvoices,
          COALESCE(SUM(totalAmount), 0) as pendingAmount
        FROM supplier_invoices
        WHERE payment_status = 'UNPAID'
      `;
      const pendingResult = await query(pendingQuery);
      const pending = Array.isArray(pendingResult) && pendingResult[0] 
        ? pendingResult[0] 
        : { pendingInvoices: 0, pendingAmount: 0 };
      
      pendingInvoices = (pending as { pendingInvoices: number; pendingAmount: number }).pendingInvoices;
      pendingAmount = (pending as { pendingInvoices: number; pendingAmount: number }).pendingAmount;

      // Calculate average delivery time (only for delivered invoices with both dates)
      const avgDeliveryTimeQuery = `
        SELECT AVG(DATEDIFF(deliveryDate, dateCreated)) as avgDeliveryTime
        FROM supplier_invoices
        WHERE delivery_status = 'DELIVERED'
          AND deliveryDate IS NOT NULL
          AND dateCreated IS NOT NULL
          AND deliveryDate >= dateCreated
      `;
      const avgDeliveryResult = await query(avgDeliveryTimeQuery);
      if (Array.isArray(avgDeliveryResult) && avgDeliveryResult[0] && (avgDeliveryResult[0] as any).avgDeliveryTime !== null) {
        averageDeliveryTime = Number((avgDeliveryResult[0] as any).avgDeliveryTime);
      }

      // Calculate reliability score based on:
      // 1. Delivery completion rate (50% weight)
      // 2. Payment compliance rate (50% weight)
      const reliabilityQuery = `
        SELECT 
          COUNT(*) as totalInvoices,
          SUM(CASE WHEN delivery_status = 'DELIVERED' THEN 1 ELSE 0 END) as deliveredInvoices,
          SUM(CASE WHEN payment_status = 'PAID' THEN 1 ELSE 0 END) as paidInvoices
        FROM supplier_invoices
        WHERE dateCreated BETWEEN ? AND ?
      `;
      const reliabilityResult = await query(reliabilityQuery, [startDate, endDate]);
      
      if (Array.isArray(reliabilityResult) && reliabilityResult[0]) {
        const stats = reliabilityResult[0] as { totalInvoices: number; deliveredInvoices: number; paidInvoices: number };
        const total = Number(stats.totalInvoices) || 0;
        
        if (total > 0) {
          const deliveryRate = (Number(stats.deliveredInvoices) || 0) / total;
          const paymentRate = (Number(stats.paidInvoices) || 0) / total;
          
          // Combined score: 50% delivery rate + 50% payment rate, scaled to 0-100
          reliabilityScore = Math.round((deliveryRate * 0.5 + paymentRate * 0.5) * 100);
        }
      }
    } catch (error) {
      // Table might not exist, use default values
      console.log("Supplier invoices table not found, using default values");
    }

    return NextResponse.json({
      totalSuppliers: Number(totalSuppliers),
      activeSuppliers: Number(activeSuppliers),
      totalProducts: Number(totalProducts),
      totalExpenses: Number(totalExpenses),
      pendingInvoices: Number(pendingInvoices),
      pendingAmount: Number(pendingAmount),
      supplierEfficiency: totalSuppliers > 0 ? (activeSuppliers / totalSuppliers * 100) : 0,
      averageDeliveryTime: averageDeliveryTime !== null ? Number(averageDeliveryTime.toFixed(1)) : null,
      reliabilityScore: reliabilityScore !== null ? Number(reliabilityScore) : null
    });

  } catch (error) {
    console.error("Error fetching supplier data:", error);
    return NextResponse.json({ error: "Failed to fetch supplier data" }, { status: 500 });
  }
}