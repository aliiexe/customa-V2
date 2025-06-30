import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let sql = `
      SELECT 
        s.*,
        COUNT(DISTINCT p.id) as productCount,
        COUNT(DISTINCT si.id) as invoiceCount,
        COALESCE(SUM(CASE WHEN si.payment_status = 'UNPAID' THEN si.totalAmount ELSE 0 END), 0) as unpaidAmount,
        COALESCE(SUM(CASE WHEN si.payment_status = 'PAID' THEN si.totalAmount ELSE 0 END), 0) as totalSpent,
        MAX(si.dateCreated) as lastOrderDate
      FROM 
        suppliers s
      LEFT JOIN 
        products p ON s.id = p.supplierId
      LEFT JOIN 
        supplier_invoices si ON s.id = si.supplierId
      WHERE 1=1
    `;

    const params: any[] = [];

    if (search) {
      sql += " AND (s.name LIKE ? OR s.contactName LIKE ? OR s.email LIKE ? OR s.phoneNumber LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    sql += " GROUP BY s.id, s.name, s.contactName, s.address, s.email, s.phoneNumber, s.website, s.createdAt, s.updatedAt";
    sql += " ORDER BY s.name ASC";

    const suppliers = await query(sql, params);

    // Convert numeric fields to proper numbers
    const formattedSuppliers = Array.isArray(suppliers) 
      ? suppliers.map((supplier: any) => ({
          ...supplier,
          productCount: Number(supplier.productCount || 0),
          invoiceCount: Number(supplier.invoiceCount || 0),
          totalSpent: Number(supplier.totalSpent || 0), // Only from PAID invoices
          unpaidAmount: Number(supplier.unpaidAmount || 0) // Only from UNPAID invoices
        }))
      : [];

    return NextResponse.json(formattedSuppliers);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json(
      { error: "Failed to fetch suppliers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, contactName, address, email, phoneNumber, website, iban, rib } = body;

    if (!name || !contactName || !address || !email || !phoneNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if supplier already exists
    const existingSupplier = await query(
      "SELECT id FROM suppliers WHERE email = ? OR (name = ? AND phoneNumber = ?)",
      [email, name, phoneNumber]
    );

    if (Array.isArray(existingSupplier) && existingSupplier.length > 0) {
      return NextResponse.json({ error: "Supplier with this email or name/phone already exists" }, { status: 409 });
    }

    const result = await query(
      `INSERT INTO suppliers (name, contactName, address, email, phoneNumber, website, iban, rib) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, contactName, address, email, phoneNumber, website || null, iban || null, rib || null]
    );

    return NextResponse.json(
      { message: "Supplier created successfully", id: (result as any).insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating supplier:", error);
    return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 });
  }
}
