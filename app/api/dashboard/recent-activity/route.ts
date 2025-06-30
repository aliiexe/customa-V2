import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const activities = [];

    // Recent products
    const recentProducts = await query(`
      SELECT 
        p.id,
        p.name,
        p.reference,
        p.created_at AS createdAt,
        c.name as categoryName
      FROM products p
      LEFT JOIN categories c ON p.categoryId = c.id
      ORDER BY p.created_at DESC
      LIMIT 3
    `, []);

    if (Array.isArray(recentProducts)) {
      recentProducts.forEach(product => {
        activities.push({
          id: `product-${product.id}`,
          type: 'product',
          title: `New product: ${product.name}`,
          description: `Product ${product.reference} added to ${product.categoryName || 'Uncategorized'}`,
          timestamp: product.createdAt,
          href: `/products/${product.id}`
        });
      });
    }

    // Recent client invoices
    const recentInvoices = await query(`
      SELECT 
        ci.id,
        ci.totalAmount,
        ci.dateCreated,
        ci.payment_status,
        c.name as clientName
      FROM client_invoices ci
      LEFT JOIN clients c ON ci.clientId = c.id
      ORDER BY ci.dateCreated DESC
      LIMIT 3
    `, []);

    if (Array.isArray(recentInvoices)) {
      recentInvoices.forEach(invoice => {
        activities.push({
          id: `invoice-${invoice.id}`,
          type: 'invoice',
          title: `Invoice #${invoice.id} ${invoice.payment_status ? invoice.payment_status.toLowerCase() : ''}`,
          description: `Invoice for ${invoice.clientName}`,
          timestamp: invoice.dateCreated,
          value: invoice.totalAmount,
          status: invoice.payment_status,
          href: `/invoices/client/${invoice.id}`
        });
      });
    }

    // Recent clients
    const recentClients = await query(`
      SELECT 
        id,
        name,
        email,
        created_at AS createdAt
      FROM clients
      ORDER BY created_at DESC
      LIMIT 2
    `, []);

    if (Array.isArray(recentClients)) {
      recentClients.forEach(client => {
        activities.push({
          id: `client-${client.id}`,
          type: 'client',
          title: `New client: ${client.name}`,
          description: `Client registered with email ${client.email}`,
          timestamp: client.createdAt,
          href: `/clients/${client.id}`
        });
      });
    }

    // Sort by timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json(activities.slice(0, limit));
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return NextResponse.json({ error: "Failed to fetch recent activity" }, { status: 500 });
  }
}