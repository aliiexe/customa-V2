import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const activities: Array<{
      id: string;
      type: string;
      title: string;
      description: string;
      timestamp: string | Date;
      href: string;
      value?: number;
      status?: string;
    }> = [];

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
        const p = product as {
          id: string;
          name: string;
          reference: string;
          createdAt: string | Date;
          categoryName?: string;
        };
        activities.push({
          id: `product-${p.id}`,
          type: 'product',
          title: `New product: ${p.name}`,
          description: `Product ${p.reference} added to ${p.categoryName || 'Uncategorized'}`,
          timestamp: p.createdAt,
          href: `/products/${p.id}`
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
      recentInvoices.forEach(inv => {
        const invoice = inv as {
          id: string;
          totalAmount: number;
          dateCreated: string | Date;
          payment_status?: string;
          clientName?: string;
        };
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
      recentClients.forEach(c => {
        const client = c as {
          id: string;
          name: string;
          email: string;
          createdAt: string | Date;
        };
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