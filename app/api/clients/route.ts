import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let sql = `
      SELECT 
        c.*,
        COUNT(DISTINCT ci.id) as invoiceCount,
        COUNT(DISTINCT ci.id) as orderCount,
        COALESCE(SUM(CASE WHEN ci.payment_status = 'UNPAID' THEN ci.totalAmount ELSE 0 END), 0) as unpaidAmount,
        COALESCE(SUM(CASE WHEN ci.payment_status = 'PAID' THEN ci.totalAmount ELSE 0 END), 0) as totalSpent,
        COUNT(DISTINCT cq.id) as quoteCount,
        MAX(ci.dateCreated) as lastOrderDate
      FROM 
        clients c
      LEFT JOIN 
        client_invoices ci ON c.id = ci.clientId
      LEFT JOIN 
        client_quotes cq ON c.id = cq.clientId
      WHERE 1=1
    `;

    const params: any[] = [];

    if (search) {
      sql += " AND (c.name LIKE ? OR c.email LIKE ? OR c.phoneNumber LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    sql += " GROUP BY c.id, c.name, c.address, c.email, c.phoneNumber, c.iban, c.createdAt, c.updatedAt";
    sql += " ORDER BY c.name ASC";

    const clients = await query(sql, params);

    // Convert numeric fields to proper numbers - totalSpent ONLY includes PAID invoices
    const formattedClients = Array.isArray(clients) 
      ? clients.map((client: any) => ({
          ...client,
          invoiceCount: Number(client.invoiceCount || 0),
          orderCount: Number(client.orderCount || 0),
          quoteCount: Number(client.quoteCount || 0),
          totalSpent: Number(client.totalSpent || 0), // ONLY from PAID invoices
          unpaidAmount: Number(client.unpaidAmount || 0)
        }))
      : [];

    return NextResponse.json(formattedClients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, address, email, phoneNumber, iban } = body;

    if (!name || !address || !email || !phoneNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if client already exists
    const existingClient = await query(
      "SELECT id FROM clients WHERE email = ? OR (name = ? AND phoneNumber = ?)",
      [email, name, phoneNumber]
    );

    if (Array.isArray(existingClient) && existingClient.length > 0) {
      return NextResponse.json({ error: "Client with this email or name/phone already exists" }, { status: 409 });
    }

    const result = await query(
      `INSERT INTO clients (name, address, email, phoneNumber, iban) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, address, email, phoneNumber, iban || null]
    );

    return NextResponse.json(
      { message: "Client created successfully", id: (result as any).insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}
