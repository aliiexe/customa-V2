import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// Get a single supplier with stats
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supplierId = params.id;

    // Get supplier info and stats
    const supplierQuery = `
      SELECT 
        s.*,
        COUNT(DISTINCT p.id) as productCount,
        COUNT(DISTINCT si.id) as invoiceCount,
        COALESCE(SUM(CASE WHEN si.payment_status = 'UNPAID' THEN si.totalAmount ELSE 0 END), 0) as unpaidAmount,
        COALESCE(SUM(CASE WHEN si.payment_status = 'PAID' THEN si.totalAmount ELSE 0 END), 0) as totalSpent,
        MAX(si.dateCreated) as lastOrderDate,
        AVG(DATEDIFF(si.deliveryDate, si.dateCreated)) as averageDeliveryTime
      FROM 
        suppliers s
      LEFT JOIN 
        products p ON s.id = p.supplierId
      LEFT JOIN 
        supplier_invoices si ON s.id = si.supplierId
      WHERE s.id = ?
      GROUP BY s.id
    `;

    const supplierResult = await query(supplierQuery, [supplierId]);

    if (!Array.isArray(supplierResult) || supplierResult.length === 0) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    }

    const supplier = supplierResult[0] as any;

    // You can add more per-supplier metrics here as needed

    return NextResponse.json({
      ...supplier,
      productCount: Number(supplier.productCount || 0),
      invoiceCount: Number(supplier.invoiceCount || 0),
      totalSpent: Number(supplier.totalSpent || 0),
      unpaidAmount: Number(supplier.unpaidAmount || 0),
      averageDeliveryTime: supplier.averageDeliveryTime ? Number(supplier.averageDeliveryTime).toFixed(1) : null,
    });
  } catch (error) {
    console.error(`Error fetching supplier ${params.id}:`, error);
    return NextResponse.json({ error: "Failed to fetch supplier" }, { status: 500 });
  }
}