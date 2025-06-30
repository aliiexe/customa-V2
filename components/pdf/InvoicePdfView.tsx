import React from "react";

interface InvoiceItem {
  id: number;
  productName: string;
  productReference: string;
  quantity: number;
  unitPrice: number | string;
  totalPrice: number | string;
}

interface InvoicePdfViewProps {
  invoice: {
    id: number;
    clientName: string;
    clientAddress?: string;
    clientEmail?: string;
    clientPhone?: string;
    totalAmount: number;
    dateCreated: string;
    deliveryDate: string;
    payment_status: "PAID" | "UNPAID";
    delivery_status: "IN_PROCESS" | "SENDING" | "DELIVERED";
    items: InvoiceItem[];
    tvaRate?: number; // e.g. 20 for 20%
    sender?: {
      name: string;
      address?: string;
      email?: string;
      phone?: string;
      website?: string;
      ice?: string;
      rc?: string;
      if?: string;
      patente?: string;
      cnss?: string;
    };
  };
}

const InvoicePdfView: React.FC<InvoicePdfViewProps> = ({ invoice }) => {
  const sender = invoice.sender || {
    name: "GLOBAL WATCH LUNG APP",
    address: "RESID. KAWKAB, MOHAMMEDIA",
    phone: "0521 10 14 04",
    website: "www.globalwatchtech.com",
    ice: "0023121275000067",
    rc: "139941",
    if: "13994111",
    patente: "36507435",
    cnss: "36507435",
  };

  const tvaRate = invoice.tvaRate ?? 20;
  // Ensure totalPrice is numeric
  const totalHT = invoice.items.reduce(
    (sum, i) => sum + Number(i.totalPrice),
    0
  );
  const tvaAmount = totalHT * (tvaRate / 100);
  const totalTTC = totalHT + tvaAmount;

  return (
    <div
      style={{
        width: 794,
        backgroundColor: "#fff",
        color: "#222",
        fontFamily: "Segoe UI, sans-serif",
        padding: 40,
        fontSize: 13,
        lineHeight: 1.5,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        {/* Logo & Sender Info */}
        <div style={{ width: "50%" }}>
          <img
            src="/GWAtech-logo.jpg"
            alt="GWAtech Logo"
            style={{
              marginBottom: 12,
              width: 100,
              height: 150,
              objectFit: "contain",
            }}
          />
          <div style={{ fontWeight: 600 }}>{sender.name}</div>
          <div>{sender.address}</div>
          <div>{sender.phone}</div>
          <div>{sender.website}</div>
        </div>

        {/* Invoice Metadata */}
        <div style={{ textAlign: "right" }}>
          <h2 style={{ margin: 0, fontSize: 26 }}>FACTURE</h2>
          <div>
            <strong>FACTURE N°:</strong> {String(invoice.id).padStart(5, "0")}
          </div>
          <div>
            <strong>Client:</strong> {invoice.clientName}
          </div>
          <div>
            <strong>Date:</strong>{" "}
            {new Date(invoice.dateCreated).toLocaleDateString("fr-FR")}
          </div>
          <div>
            <strong>Livraison:</strong>{" "}
            {new Date(invoice.deliveryDate).toLocaleDateString("fr-FR")}
          </div>
        </div>
      </div>

      {/* Client & Delivery Info */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "30px 0",
        }}
      >
        <div>
          <strong>FACTURER À</strong>
          <div>{invoice.clientName}</div>
          {invoice.clientAddress && <div>{invoice.clientAddress}</div>}
          {invoice.clientEmail && <div>Email: {invoice.clientEmail}</div>}
          {invoice.clientPhone && <div>Tél: {invoice.clientPhone}</div>}
        </div>
        <div style={{ textAlign: "right" }}>
          <strong>LIVRER À</strong>
          <div>{invoice.clientName}</div>
          <div>{invoice.clientAddress || "[Adresse de livraison]"}</div>
        </div>
      </div>

      {/* Items Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: 20,
          marginBottom: 30,
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th style={{ padding: 8, border: "1px solid #ccc", textAlign: "left" }}>
              Désignation
            </th>
            <th style={{ padding: 8, border: "1px solid #ccc", textAlign: "left" }}>
              Référence
            </th>
            <th style={{ padding: 8, border: "1px solid #ccc", textAlign: "center" }}>
              Quantité
            </th>
            <th style={{ padding: 8, border: "1px solid #ccc", textAlign: "right" }}>
              P.U HT
            </th>
            <th style={{ padding: 8, border: "1px solid #ccc", textAlign: "right" }}>
              P.T HT
            </th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => {
            const unit = Number(item.unitPrice);
            const total = Number(item.totalPrice);
            return (
              <tr key={item.id}>
                <td style={{ padding: 8, border: "1px solid #ccc" }}>
                  {item.productName}
                </td>
                <td style={{ padding: 8, border: "1px solid #ccc" }}>
                  {item.productReference}
                </td>
                <td
                  style={{
                    padding: 8,
                    border: "1px solid #ccc",
                    textAlign: "center",
                  }}
                >
                  {item.quantity}
                </td>
                <td
                  style={{
                    padding: 8,
                    border: "1px solid #ccc",
                    textAlign: "right",
                  }}
                >
                  {unit.toFixed(2)} DH
                </td>
                <td
                  style={{
                    padding: 8,
                    border: "1px solid #ccc",
                    textAlign: "right",
                  }}
                >
                  {total.toFixed(2)} DH
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <table style={{ width: 300 }}>
          <tbody>
            <tr>
              <td style={{ padding: "8px 0" }}>Prix Total HT:</td>
              <td style={{ textAlign: "right" }}>
                {totalHT.toFixed(2)} DH
              </td>
            </tr>
            <tr>
              <td>
                <span style={{ textDecoration: "underline" }}>
                  TVA {tvaRate}%:
                </span>
              </td>
              <td style={{ textAlign: "right" }}>
                {tvaAmount.toFixed(2)} DH
              </td>
            </tr>
            <tr style={{ borderTop: "2px solid #2e7d32" }}>
              <td style={{ fontWeight: "bold" }}>Prix Total TTC:</td>
              <td
                style={{
                  fontWeight: "bold",
                  textAlign: "right",
                  color: "#2e7d32",
                }}
              >
                {totalTTC.toFixed(2)} DH
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 40, fontSize: 12, color: "#444" }}>
        <div>
          ICE: {sender.ice} | RC: {sender.rc} | IF: {sender.if} | PATENTE:{" "}
          {sender.patente} | CNSS: {sender.cnss}
        </div>
        <div>
          <strong>Merci pour votre confiance.</strong>
        </div>
      </div>
    </div>
  );
};

export default InvoicePdfView;
