import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // Get total revenue
    const totalResult = await query(
      "SELECT SUM(totalAmount) as totalRevenue FROM client_invoices WHERE status = 'PAID'"
    );
    const totalRevenue =
      Array.isArray(totalResult) && totalResult[0]
        ? Number((totalResult[0] as any).totalRevenue) || 0
        : 0;

    // Get revenue per client
    const clientsResult = await query(`
      SELECT c.id, c.name, SUM(i.totalAmount) as clientRevenue
      FROM clients c
      JOIN client_invoices i ON c.id = i.clientId AND i.status = 'PAID'
      GROUP BY c.id, c.name
      ORDER BY clientRevenue DESC
    `);

    // Format with percentage
    const contributions = Array.isArray(clientsResult)
      ? clientsResult.map((row: any) => ({
          id: row.id,
          name: row.name,
          revenue: Number(row.clientRevenue),
          percentage: totalRevenue
            ? Number(((row.clientRevenue / totalRevenue) * 100).toFixed(2))
            : 0,
        }))
      : [];

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
