import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    let sql = `
      SELECT 
        c.*,
        COUNT(DISTINCT ci.id) as invoiceCount,
        SUM(CASE WHEN ci.payment_status = 'UNPAID' THEN ci.totalAmount ELSE 0 END) as unpaidAmount,
        COUNT(DISTINCT cq.id) as quoteCount
      FROM 
        clients c
      LEFT JOIN 
        client_invoices ci ON c.id = ci.clientId
      LEFT JOIN 
        client_quotes cq ON c.id = cq.clientId
      WHERE 1=1
    `

    const params: any[] = []

    if (search) {
      sql += " AND (c.name LIKE ? OR c.email LIKE ? OR c.phoneNumber LIKE ?)"
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }

    sql += " GROUP BY c.id, c.name, c.address, c.email, c.phoneNumber, c.iban, c.createdAt, c.updatedAt"
    sql += " ORDER BY c.name ASC"

    const clients = await query(sql, params)

    return NextResponse.json(contributions);
  } catch (error) {
    console.error("Error fetching client contributions:", error);
    return NextResponse.json(
      { error: "Failed to fetch client contributions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const client = await request.json()

    const sql = `
      INSERT INTO clients (
        name, address, email, phoneNumber, iban
      ) VALUES (?, ?, ?, ?, ?)
    `

    const params = [client.name, client.address, client.email, client.phoneNumber, client.iban]

    const result = await query(sql, params)

    return NextResponse.json(
      {
        message: "Client created successfully",
        id: (result as any).insertId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating client:", error)
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
  }
}
