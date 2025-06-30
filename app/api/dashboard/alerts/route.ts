import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const alerts = [];

    // Check for low stock products - use hardcoded threshold (10) instead of reorderlevel column
    const lowStockResult = await query(`
      SELECT COUNT(*) as count
      FROM products 
      WHERE stockQuantity <= 10
    `, []) as { count: number }[];
    
    const lowStockCount = Array.isArray(lowStockResult) ? lowStockResult[0]?.count || 0 : 0;
    
    if (lowStockCount > 0) {
      alerts.push({
        id: 'low-stock',
        type: 'stock',
        severity: 'high',
        title: 'Low Stock Alert',
        description: `${lowStockCount} products are running low on stock`,
        count: lowStockCount,
        action: {
          label: 'View Products',
          href: '/products?stockLevel=low'
        }
      });
    }

    // Check for overdue invoices
    const overdueResult = await query(`
      SELECT 
        COUNT(*) as count,
        COALESCE(SUM(totalAmount), 0) as value
      FROM client_invoices 
      WHERE payment_status = 'UNPAID' 
      AND DATEDIFF(CURDATE(), dateCreated) > 30
    `, []) as { count: number, value: number }[];
    
    const overdueData = Array.isArray(overdueResult) ? overdueResult[0] : { count: 0, value: 0 };
    
    if (overdueData.count > 0) {
      alerts.push({
        id: 'overdue-invoices',
        type: 'payment',
        severity: 'high',
        title: 'Overdue Invoices',
        description: `${overdueData.count} invoices are overdue by more than 30 days`,
        count: overdueData.count,
        value: overdueData.value,
        action: {
          label: 'View Invoices',
          href: '/invoices/client'
        }
      });
    }

    // Check for out of stock products
    const outOfStockResult = await query(`
      SELECT COUNT(*) as count
      FROM products 
      WHERE stockQuantity = 0
    `, []) as { count: number }[];
    
    const outOfStockCount = Array.isArray(outOfStockResult) ? outOfStockResult[0]?.count || 0 : 0;
    
    if (outOfStockCount > 0) {
      alerts.push({
        id: 'out-of-stock',
        type: 'stock',
        severity: 'medium',
        title: 'Out of Stock Products',
        description: `${outOfStockCount} products are completely out of stock`,
        count: outOfStockCount,
        action: {
          label: 'Restock Now',
          href: '/products?stockLevel=out'
        }
      });
    }

    // Check for unpaid supplier invoices
    const unpaidSupplierResult = await query(`
      SELECT 
        COUNT(*) as count,
        COALESCE(SUM(totalAmount), 0) as value
      FROM supplier_invoices 
      WHERE payment_status = 'UNPAID'
    `, []) as { count: number, value: number }[];
    
    const unpaidSupplierData = Array.isArray(unpaidSupplierResult) ? unpaidSupplierResult[0] : { count: 0, value: 0 };
    
    if (unpaidSupplierData.count > 0) {
      alerts.push({
        id: 'unpaid-suppliers',
        type: 'supplier',
        severity: 'medium',
        title: 'Unpaid Supplier Invoices',
        description: `${unpaidSupplierData.count} supplier invoices are pending payment`,
        count: unpaidSupplierData.count,
        value: unpaidSupplierData.value,
        action: {
          label: 'Pay Suppliers',
          href: '/invoices/supplier'
        }
      });
    }

    return NextResponse.json(alerts);
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}