import { NextResponse } from "next/server"
import { query, transaction } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const invoiceId = params.id

    const invoiceResult = await query(
      `SELECT ci.*, c.name as clientName, c.email as clientEmail, c.address as clientAddress
       FROM client_invoices ci 
       LEFT JOIN clients c ON ci.clientId = c.id 
       WHERE ci.id = ?`,
      [invoiceId],
    )

    if ((invoiceResult as any[]).length === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const invoice = (invoiceResult as any[])[0]

    const itemsResult = await query(
      `SELECT cii.*, p.name as productName, p.reference as productReference
       FROM client_invoice_items cii 
       LEFT JOIN products p ON cii.productId = p.id 
       WHERE cii.invoiceId = ?`,
      [invoiceId],
    )

    invoice.items = itemsResult

    return NextResponse.json(invoice)
  } catch (error) {
    console.error("Error fetching client invoice:", error)
    return NextResponse.json({ error: "Failed to fetch client invoice" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: invoiceId } = params;
    const body = await request.json();
    const { payment_status, delivery_status } = body;

    // Use transaction for database consistency
    const result = await transaction(async (connection) => {
      // Get current invoice status and items
      const [currentInvoice] = await connection.execute(
        "SELECT delivery_status FROM client_invoices WHERE id = ?",
        [invoiceId]
      );

      const [items] = await connection.execute(
        "SELECT productId, quantity FROM client_invoice_items WHERE invoiceId = ?",
        [invoiceId]
      );

      // Update invoice payment status if provided
      if (payment_status) {
        await connection.execute(
          "UPDATE client_invoices SET payment_status = ?, updatedAt = NOW() WHERE id = ?",
          [payment_status, invoiceId]
        );
      }

      // Update delivery status if provided
      if (delivery_status) {
        await connection.execute(
          "UPDATE client_invoices SET delivery_status = ?, updatedAt = NOW() WHERE id = ?",
          [delivery_status, invoiceId]
        );

        // Handle stock updates when changing to SENDING status
        if (delivery_status === "SENDING" &&
          (currentInvoice as any[])[0].delivery_status !== "SENDING" &&
          (currentInvoice as any[])[0].delivery_status !== "DELIVERED") {
          // Decrease actual stock when status changes to SENDING
          for (const item of items as any[]) {
            await connection.execute(
              `UPDATE products 
               SET stockQuantity = GREATEST(0, stockQuantity - ?),
                   updatedAt = CURRENT_TIMESTAMP
               WHERE id = ?`,
              [item.quantity, item.productId]
            );
          }
        }
      }

      // Return the invoice ID to fetch the updated invoice
      return invoiceId;
    });

    // Fetch the complete updated invoice with items for the response
    const updatedInvoiceResult = await query(
      `SELECT ci.*, c.name as clientName, c.email as clientEmail, c.address as clientAddress
       FROM client_invoices ci 
       LEFT JOIN clients c ON ci.clientId = c.id 
       WHERE ci.id = ?`,
      [invoiceId]
    );

    if ((updatedInvoiceResult as any[]).length === 0) {
      return NextResponse.json({ error: "Invoice not found after update" }, { status: 404 });
    }

    const updatedInvoice = (updatedInvoiceResult as any[])[0];

    const itemsResult = await query(
      `SELECT cii.*, p.name as productName, p.reference as productReference
       FROM client_invoice_items cii 
       LEFT JOIN products p ON cii.productId = p.id 
       WHERE cii.invoiceId = ?`,
      [invoiceId]
    );

    updatedInvoice.items = itemsResult;

    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error("Error updating client invoice:", error);
    return NextResponse.json({ error: "Failed to update client invoice" }, { status: 500 });
  }
}
