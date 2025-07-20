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

export async function PUT(request: Request, context: { params: { id: string } }) {
  try {
    // Await params for Next.js app router compatibility
    const { id: invoiceId } = context.params;
    const body = await request.json();
    const { payment_status, delivery_status, clientName, deliveryDate, items } = body;

    // Calculate new totalAmount if items are provided
    let newTotalAmount = undefined;
    if (Array.isArray(items)) {
      const totalHT = items.reduce((sum, item) => sum + Number(item.totalPrice), 0);
      newTotalAmount = totalHT + (totalHT * 0.20); // Add 20% TVA
    }

    // Use transaction for database consistency
    const result = await transaction(async (connection) => {
      // Get current invoice status and items
      const [currentInvoice] = await connection.execute(
        "SELECT delivery_status FROM client_invoices WHERE id = ?",
        [invoiceId]
      );

      const [oldItems] = await connection.execute(
        "SELECT id, productId, quantity FROM client_invoice_items WHERE invoiceId = ?",
        [invoiceId]
      );

      // Update invoice fields if provided
      const updateFields = [];
      const updateValues = [];
      if (payment_status) {
        updateFields.push("payment_status = ?");
        updateValues.push(payment_status);
      }
      if (delivery_status) {
        updateFields.push("delivery_status = ?");
        updateValues.push(delivery_status);
      }
      if (clientName) {
        // Update client name in clients table if needed
        await connection.execute(
          "UPDATE clients c JOIN client_invoices ci ON c.id = ci.clientId SET c.name = ? WHERE ci.id = ?",
          [clientName, invoiceId]
        );
      }
      if (deliveryDate) {
        updateFields.push("deliveryDate = ?");
        updateValues.push(deliveryDate);
      }
      if (typeof newTotalAmount === 'number') {
        updateFields.push("totalAmount = ?");
        updateValues.push(newTotalAmount);
      }
      if (updateFields.length > 0) {
        updateFields.push("updatedAt = NOW()");
        await connection.execute(
          `UPDATE client_invoices SET ${updateFields.join(", ")} WHERE id = ?`,
          [...updateValues, invoiceId]
        );
      }

      // Update items if provided
      if (Array.isArray(items)) {
        for (const item of items) {
          if (item.id) {
            // Update existing item
            await connection.execute(
              `UPDATE client_invoice_items SET productId = ?, quantity = ?, unitPrice = ?, totalPrice = ? WHERE id = ? AND invoiceId = ?`,
              [item.productId, item.quantity, item.unitPrice, item.totalPrice, item.id, invoiceId]
            );
          } else {
            // Insert new item (if needed)
            await connection.execute(
              `INSERT INTO client_invoice_items (invoiceId, productId, quantity, unitPrice, totalPrice) VALUES (?, ?, ?, ?, ?)`,
              [invoiceId, item.productId, item.quantity, item.unitPrice, item.totalPrice]
            );
          }
        }
        // Optionally, delete removed items
        const updatedIds = items.filter(i => i.id).map(i => i.id);
        for (const oldItem of oldItems as any[]) {
          if (!updatedIds.includes(oldItem.id)) {
            await connection.execute(
              `DELETE FROM client_invoice_items WHERE id = ? AND invoiceId = ?`,
              [oldItem.id, invoiceId]
            );
          }
        }
      }

      // Handle stock updates when changing to SENDING status
      if (
        delivery_status === "SENDING" &&
        (currentInvoice as any[])[0].delivery_status !== "SENDING" &&
        (currentInvoice as any[])[0].delivery_status !== "DELIVERED"
      ) {
        for (const item of oldItems as any[]) {
          await connection.execute(
            `UPDATE products 
             SET stockQuantity = GREATEST(0, stockQuantity - ?),
                 updatedAt = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [item.quantity, item.productId]
          );
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
