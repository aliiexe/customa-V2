import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const clientId = params.id;
    
    // Get invoice-related stats - ONLY count PAID invoices for totalSpent
    const invoiceStatsQuery = `
      SELECT 
        COUNT(DISTINCT ci.id) as invoiceCount,
        COUNT(DISTINCT ci.id) as orderCount,
        COALESCE(SUM(CASE WHEN ci.payment_status = 'PAID' THEN ci.totalAmount ELSE 0 END), 0) as paidInvoiceAmount,
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
          paidInvoiceAmount: 0,
          unpaidAmount: 0,
          lastOrderDate: null
        };

    // Get quote-related stats including converted quotes amount
    const quoteStatsQuery = `
      SELECT 
        COUNT(DISTINCT cq.id) as quoteCount,
        COALESCE(SUM(CASE WHEN cq.status = 'CONVERTED' THEN cq.totalAmount ELSE 0 END), 0) as convertedQuoteAmount
      FROM client_quotes cq
      WHERE cq.clientId = ?
    `;

    const quoteStatsResult = await query(quoteStatsQuery, [clientId]);
    const quoteStats = Array.isArray(quoteStatsResult) && quoteStatsResult.length > 0 
      ? quoteStatsResult[0] as any
      : { quoteCount: 0, convertedQuoteAmount: 0 };

    // Combine all stats - totalSpent = PAID invoices + CONVERTED quotes
    const stats = {
      invoiceCount: Number(invoiceStats.invoiceCount || 0),
      orderCount: Number(invoiceStats.orderCount || 0),
      quoteCount: Number(quoteStats.quoteCount || 0),
      totalSpent: Number(invoiceStats.paidInvoiceAmount || 0) + Number(quoteStats.convertedQuoteAmount || 0),
      unpaidAmount: Number(invoiceStats.unpaidAmount || 0),
      lastOrderDate: invoiceStats.lastOrderDate
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error(`Error fetching stats for client ${params.id}:`, error);
    return NextResponse.json({
      invoiceCount: 0,
      orderCount: 0,
      quoteCount: 0,
      totalSpent: 0,
      unpaidAmount: 0,
      lastOrderDate: null
    }, { status: 500 });
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