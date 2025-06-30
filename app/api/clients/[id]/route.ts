import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// Get individual client with stats
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const clientId = params.id;

    // Get basic client info
    const clientResult = await query(
      "SELECT * FROM clients WHERE id = ?",
      [clientId]
    );

    if (!Array.isArray(clientResult) || clientResult.length === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const client = clientResult[0] as any;

    // Get invoice-related stats - ONLY PAID invoices count toward totalSpent
    const invoiceStatsQuery = `
      SELECT 
        COUNT(DISTINCT ci.id) as invoiceCount,
        COUNT(DISTINCT ci.id) as orderCount,
        COALESCE(SUM(CASE WHEN ci.payment_status = 'PAID' THEN ci.totalAmount ELSE 0 END), 0) as totalSpent,
        COALESCE(SUM(CASE WHEN ci.payment_status = 'UNPAID' THEN ci.totalAmount ELSE 0 END), 0) as unpaidAmount,
        MAX(ci.dateCreated) as lastOrderDate
      FROM client_invoices ci
      WHERE ci.clientId = ?
    `;

    const invoiceStatsResult = await query(invoiceStatsQuery, [clientId]);
    const invoiceStats = Array.isArray(invoiceStatsResult) && invoiceStatsResult.length > 0 
      ? invoiceStatsResult[0] as any
      : {
          invoiceCount: 0,
          orderCount: 0,
          totalSpent: 0,
          unpaidAmount: 0,
          lastOrderDate: null
        };

    // Get quote-related stats (tracked separately, doesn't affect totalSpent)
    const quoteStatsQuery = `
      SELECT COUNT(DISTINCT cq.id) as quoteCount
      FROM client_quotes cq
      WHERE cq.clientId = ?
    `;

    const quoteStatsResult = await query(quoteStatsQuery, [clientId]);
    const quoteStats = Array.isArray(quoteStatsResult) && quoteStatsResult.length > 0 
      ? quoteStatsResult[0] as any
      : { quoteCount: 0 };

    // Combine client with stats - totalSpent ONLY from PAID invoices
    const clientWithStats = {
      ...client,
      invoiceCount: Number(invoiceStats.invoiceCount || 0),
      orderCount: Number(invoiceStats.orderCount || 0),
      quoteCount: Number(quoteStats.quoteCount || 0),
      totalSpent: Number(invoiceStats.totalSpent || 0), // ONLY from PAID invoices
      unpaidAmount: Number(invoiceStats.unpaidAmount || 0),
      lastOrderDate: invoiceStats.lastOrderDate
    };

    return NextResponse.json(clientWithStats);
  } catch (error) {
    console.error(`Error fetching client ${params.id}:`, error);
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const clientId = params.id;
    const { name, address, email, phoneNumber, iban, rib } = await request.json();

    if (!name || !address || !email || !phoneNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if another client has the same email
    const existingClient = await query(
      "SELECT id FROM clients WHERE email = ? AND id != ?",
      [email, clientId]
    );

    if (Array.isArray(existingClient) && existingClient.length > 0) {
      return NextResponse.json({ error: "Another client with this email already exists" }, { status: 409 });
    }

    const result = await query(
      `UPDATE clients 
       SET name = ?, address = ?, email = ?, phoneNumber = ?, iban = ?, rib = ?, updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, address, email, phoneNumber, iban || null, rib || null, clientId]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Client updated successfully" });
  } catch (error) {
    console.error("Error updating client:", error);
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const clientId = params.id;

    // Check if client has any invoices
    const invoicesCheck = await query(
      "SELECT COUNT(*) as count FROM client_invoices WHERE clientId = ?",
      [clientId]
    );

    const hasInvoices = Array.isArray(invoicesCheck) && invoicesCheck.length > 0 
      ? (invoicesCheck[0] as any).count > 0
      : false;

    if (hasInvoices) {
      return NextResponse.json(
        { error: "Cannot delete client with existing invoices" },
        { status: 400 }
      );
    }

    // Check if client has any quotes
    const quotesCheck = await query(
      "SELECT COUNT(*) as count FROM client_quotes WHERE clientId = ?",
      [clientId]
    );

    const hasQuotes = Array.isArray(quotesCheck) && quotesCheck.length > 0 
      ? (quotesCheck[0] as any).count > 0
      : false;

    if (hasQuotes) {
      return NextResponse.json(
        { error: "Cannot delete client with existing quotes" },
        { status: 400 }
      );
    }

    const result = await query("DELETE FROM clients WHERE id = ?", [clientId]);

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
  }
}