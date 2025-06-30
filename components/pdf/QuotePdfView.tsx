import React from "react";

interface RawQuoteItem {
  id: number;
  designation?: string;
  productName?: string;
  quantity: number | string;
  unitPrice: number | string;
  totalPrice: number | string;
}

interface QuotePdfViewProps {
  quote: {
    id: number | string;
    clientName: string;
    date: string;
    lieu?: string;
    validUntil?: string; // ISO string for expiration date
    items: RawQuoteItem[];
    totalHT?: number | string;
    tvaRate?: number | string;
    totalTTC?: number | string;
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

const QuotePdfView: React.FC<QuotePdfViewProps> = ({ quote }) => {
  const sender = quote.sender || {
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

  // Normalize items and ensure designation
  const items = quote.items.map((i) => ({
    ...i,
    quantity: Number(i.quantity) || 0,
    unitPrice: Number(i.unitPrice) || 0,
    totalPrice: Number(i.totalPrice) || 0,
    designation: i.designation || i.productName || "[Désignation manquante]",
  }));

  // Totals calculation
  const computedTotalHT = items.reduce((sum, i) => sum + i.totalPrice, 0);
  const totalHT = quote.totalHT != null ? Number(quote.totalHT) : computedTotalHT;
  const tvaRate = quote.tvaRate != null ? Number(quote.tvaRate) : 0;
  const tvaAmount = totalHT * (tvaRate / 100);
  const totalTTC = quote.totalTTC != null ? Number(quote.totalTTC) : totalHT + tvaAmount;

  // Format validUntil date
  const validUntilFormatted = quote.validUntil
    ? new Date(quote.validUntil).toLocaleDateString("fr-FR")
    : null;

  return (
    <div style={{
      width: 794, backgroundColor: "#fff", color: "#222",
      fontFamily: "Segoe UI, sans-serif", padding: 40, fontSize: 13, lineHeight: 1.5,
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ width: "50%" }}>
          <img src="/GWAtech-logo.jpg" width={100} height={150} alt="Logo" style={{ marginBottom: 12, width: 180, height: 60, objectFit: "contain" }}/>
          <div style={{ fontWeight: 600 }}>{sender.name}</div>
          <div>{sender.address}</div>
          <div>{sender.phone}</div>
          <div>{sender.website}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <h2 style={{ margin: 0, fontSize: 26 }}>DEVIS</h2>
          <div><strong>DEVIS N°:</strong> {String(quote.id).padStart(5, "0")}</div>
          <div><strong>Client:</strong> {quote.clientName}</div>
          <div><strong>Date:</strong> {new Date(quote.date).toLocaleDateString("fr-FR")}</div>
          {quote.lieu && <div><strong>Lieu:</strong> {quote.lieu}</div>}
        </div>
      </div>

      {/* Items Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20, marginBottom: 30 }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            {["Désignation","Quantité","P.U HT","P.T HT"].map((h) => (
              <th key={h} style={{
                padding: 8, border: "1px solid #ccc",
                textAlign: h === "Quantité" ? "center" : h.startsWith("P.") ? "right" : "left",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td style={{ padding: 8, border: "1px solid #ccc" }}>{item.designation}</td>
              <td style={{ padding: 8, border: "1px solid #ccc", textAlign: "center" }}>{item.quantity}</td>
              <td style={{ padding: 8, border: "1px solid #ccc", textAlign: "right" }}>{item.unitPrice.toFixed(2)} DH</td>
              <td style={{ padding: 8, border: "1px solid #ccc", textAlign: "right" }}>{item.totalPrice.toFixed(2)} DH</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <table style={{ width: 300 }}>
          <tbody>
            <tr>
              <td style={{ padding: "8px 0" }}>Prix Total HT:</td>
              <td style={{ textAlign: "right" }}>{totalHT.toFixed(2)} DH</td>
            </tr>
            <tr>
              <td>TVA {tvaRate}%:</td>
              <td style={{ textAlign: "right" }}>{tvaAmount.toFixed(2)} DH</td>
            </tr>
            <tr style={{ borderTop: "2px solid #2e7d32" }}>
              <td style={{ fontWeight: "bold" }}>Prix Total TTC:</td>
              <td style={{ fontWeight: "bold", textAlign: "right", color: "#2e7d32" }}>
                {totalTTC.toFixed(2)} DH
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 40, fontSize: 12, color: "#444" }}>
        <div>
          ICE: {sender.ice} | RC: {sender.rc} | IF: {sender.if} | PATENTE: {sender.patente} | CNSS: {sender.cnss}
        </div>
        <div>
          <strong>
            Merci pour votre confiance.
            {validUntilFormatted && ` Offre valable jusqu'à ${validUntilFormatted}.`}
          </strong>
        </div>
      </div>
    </div>
  );
};

export default QuotePdfView;
