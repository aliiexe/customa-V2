import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// Get a single supplier with stats
export async function GET(request: Request, context: { params: { id: string } }) {
  try {
    const supplierId = context.params.id;

    // Per-supplier stats
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

    return NextResponse.json({
      ...supplier,
      productCount: Number(supplier.productCount || 0),
      invoiceCount: Number(supplier.invoiceCount || 0),
      totalSpent: Number(supplier.totalSpent || 0),
      unpaidAmount: Number(supplier.unpaidAmount || 0),
      averageDeliveryTime: supplier.averageDeliveryTime ? Number(supplier.averageDeliveryTime).toFixed(1) : null,
    });
  } catch (error) {
    console.error("Error fetching supplier:", error);
    return NextResponse.json({ error: "Failed to fetch supplier" }, { status: 500 });
  }
}

// Update a supplier
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const { name, contactName, address, email, phoneNumber, website, iban, rib } = await request.json();

    if (!name || !contactName || !address || !email || !phoneNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const sql = `
      UPDATE suppliers
      SET 
        name = ?,
        contactName = ?,
        address = ?,
        email = ?,
        phoneNumber = ?,
        website = ?,
        iban = ?,
        rib = ?,
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const queryParams = [
      name,
      contactName,
      address,
      email,
      phoneNumber,
      website,
      iban || null,
      rib || null,
      id
    ];

    const result = await query(sql, queryParams);

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Supplier updated successfully",
    });
  } catch (error) {
    console.error(`Error updating supplier ${params.id}:`, error);
    return NextResponse.json({ error: "Failed to update supplier" }, { status: 500 });
  }
}

// Delete a supplier
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supplierId = params.id;

    // Check if supplier has any products
    const productsCheck = await query(
      "SELECT COUNT(*) as count FROM products WHERE supplierId = ?",
      [supplierId]
    );

    const hasProducts = Array.isArray(productsCheck) && productsCheck.length > 0 
      ? (productsCheck[0] as any).count > 0
      : false;

    if (hasProducts) {
      return NextResponse.json(
        { error: "Cannot delete supplier with existing products" },
        { status: 400 }
      );
    }

    // Check if supplier has any invoices
    const invoicesCheck = await query(
      "SELECT COUNT(*) as count FROM supplier_invoices WHERE supplierId = ?",
      [supplierId]
    );

    const hasInvoices = Array.isArray(invoicesCheck) && invoicesCheck.length > 0 
      ? (invoicesCheck[0] as any).count > 0
      : false;

    if (hasInvoices) {
      return NextResponse.json(
        { error: "Cannot delete supplier with existing invoices" },
        { status: 400 }
      );
    }

    const result = await query("DELETE FROM suppliers WHERE id = ?", [supplierId]);

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return NextResponse.json({ error: "Failed to delete supplier" }, { status: 500 });
  }
}