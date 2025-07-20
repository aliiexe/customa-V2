"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

// Types (copied from detail page)
interface InvoiceItem {
  id: number;
  productName: string;
  productReference: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Invoice {
  id: number;
  clientId: number;
  clientName: string;
  totalAmount: number;
  dateCreated: string;
  deliveryDate: string;
  payment_status: "PAID" | "UNPAID";
  delivery_status: "IN_PROCESS" | "SENDING" | "DELIVERED";
  items: InvoiceItem[];
}

export default function EditClientInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`/api/invoices/client/${invoiceId}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Loaded invoice items:', data.items);
          setInvoice(data);
        } else {
          setError("Invoice not found");
        }
      } catch (err) {
        setError("Error fetching invoice");
      } finally {
        setIsLoading(false);
      }
    };
    if (invoiceId) fetchInvoice();
  }, [invoiceId]);

  const handleChange = (field: keyof Invoice, value: any) => {
    if (!invoice) return;
    setInvoice({ ...invoice, [field]: value });
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    if (!invoice) return;
    const items = [...invoice.items];
    let updatedItem = { ...items[index], [field]: value };
    if (field === "quantity" || field === "unitPrice") {
      const quantity = field === "quantity" ? value : updatedItem.quantity;
      const unitPrice = field === "unitPrice" ? value : updatedItem.unitPrice;
      updatedItem.totalPrice = Number(quantity) * Number(unitPrice);
    }
    items[index] = updatedItem;
    // Recalculate totalAmount
    const newTotalAmount = items.reduce((sum, i) => sum + i.totalPrice, 0);
    setInvoice({ ...invoice, items, totalAmount: newTotalAmount });
  };

  const handleSave = async () => {
    if (!invoice) return;
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/invoices/client/${invoiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoice),
      });
      if (response.ok) {
        router.push(`/invoices/client/${invoiceId}`);
      } else {
        setError("Failed to save invoice");
      }
    } catch (err) {
      setError("Error saving invoice");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!invoice) return <div>Invoice not found</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Invoice #{invoice.id}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            label="Client Name"
            value={invoice.clientName}
            onChange={e => handleChange("clientName", e.target.value)}
          />
          <Input
            label="Delivery Date"
            type="date"
            value={invoice.deliveryDate ? format(new Date(invoice.deliveryDate), "yyyy-MM-dd") : ""}
            onChange={e => handleChange("deliveryDate", e.target.value)}
          />
          <div>
            <label>Payment Status</label>
            <select
              value={invoice.payment_status}
              onChange={e => handleChange("payment_status", e.target.value)}
            >
              <option value="PAID">Paid</option>
              <option value="UNPAID">Unpaid</option>
            </select>
          </div>
          <div>
            <label>Delivery Status</label>
            <select
              value={invoice.delivery_status}
              onChange={e => handleChange("delivery_status", e.target.value)}
            >
              <option value="IN_PROCESS">In Process</option>
              <option value="SENDING">Sending</option>
              <option value="DELIVERED">Delivered</option>
            </select>
          </div>
          <div>
            <label>Items</label>
            <div className="space-y-2">
              <div className="flex gap-2 font-semibold text-gray-700">
                <span className="w-40">Name</span>
                <span className="w-32">Quantity</span>
                <span className="w-32">Unit Price</span>
                <span className="w-32">Total</span>
              </div>
              {invoice.items.map((item, idx) => (
                <div key={item.id} className="flex gap-2 items-center">
                  <Input
                    value={item.productName}
                    readOnly
                    className="w-40 bg-gray-100"
                    placeholder="Product Name"
                  />
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={e => handleItemChange(idx, "quantity", Number(e.target.value))}
                    className="w-32"
                    placeholder="Qty"
                  />
                  <Input
                    type="number"
                    value={item.unitPrice}
                    onChange={e => handleItemChange(idx, "unitPrice", Number(e.target.value))}
                    className="w-32"
                    placeholder="Unit Price"
                  />
                  <Input
                    type="number"
                    value={item.quantity * item.unitPrice}
                    readOnly
                    className="w-32 bg-gray-100"
                    placeholder="Total"
                  />
                </div>
              ))}
            </div>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 