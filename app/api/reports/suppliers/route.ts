import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    // Get total suppliers count
    const suppliersCountQuery = `SELECT COUNT(*) as totalSuppliers FROM suppliers`;
    const suppliersResult = await query(suppliersCountQuery);
    const totalSuppliers = Array.isArray(suppliersResult) && suppliersResult[0] 
      ? (suppliersResult[0] as any).totalSuppliers || 0 
      : 0;
    
    // Get active purchase orders
    const activePOQuery = `
      SELECT COUNT(*) as activePurchaseOrders 
      FROM purchase_orders 
      WHERE status != 'COMPLETED' AND status != 'CANCELLED'
    `;
    const activePOResult = await query(activePOQuery);
    const activePurchaseOrders = Array.isArray(activePOResult) && activePOResult[0] 
      ? (activePOResult[0] as any).activePurchaseOrders || 0 
      : 0;
    
    // Get total expenses YTD
    const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    
    const expensesQuery = `
      SELECT COALESCE(SUM(totalAmount), 0) as totalExpenses
      FROM purchase_orders
      WHERE dateCreated >= ?
      AND status = 'COMPLETED'
    `;
    
    const expensesResult = await query(expensesQuery, [startOfYear]);
    const totalExpenses = Array.isArray(expensesResult) && expensesResult[0] 
      ? (expensesResult[0] as any).totalExpenses || 0 
      : 0;
    
    return NextResponse.json({
      totalSuppliers,
      activePurchaseOrders,
      totalExpenses
    });
    
  } catch (error) {
    console.error("Error fetching supplier report data:", error);
    return NextResponse.json({ error: "Failed to fetch supplier data" }, { status: 500 });
  }
}