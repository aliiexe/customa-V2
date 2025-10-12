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

  // Normalize items and ensure designation
  const items = quote.items.map((i) => ({
    ...i,
    quantity: Number(i.quantity) || 0,
    unitPrice: Number(i.unitPrice) || 0,
    totalPrice: Number(i.totalPrice) || 0,
    designation: i.designation || i.productName || "[Missing description]",
  }));

  // Totals calculation
  const computedTotalHT = items.reduce((sum, i) => sum + i.totalPrice, 0);
  const totalHT = quote.totalHT != null ? Number(quote.totalHT) : computedTotalHT;
  const tvaRate = quote.tvaRate != null ? Number(quote.tvaRate) : 20;
  const tvaAmount = totalHT * (tvaRate / 100);
  const totalTTC = quote.totalTTC != null ? Number(quote.totalTTC) : totalHT + tvaAmount;

  // Format validUntil date
  const validUntilFormatted = quote.validUntil
    ? new Date(quote.validUntil).toLocaleDateString("en-US")
    : null;

  return (
    <div style={{
      width: 794, backgroundColor: "#fff", color: "#222",
      fontFamily: "Segoe UI, sans-serif", padding: 40, fontSize: 13, lineHeight: 1.5,
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ width: "50%" }}>
          <img
            src="/company1logo.png"
            alt="GWAtech Logo"
            style={{
              marginBottom: 12,
              width: 100,
              height: 150,
              objectFit: "contain",
            }}
          />
          <div
            style={{
              border: "1px solid #ccc",
              padding: 10,
              borderRadius: 4,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 2 }}>GasFil BV</div>
            <div style={{ marginBottom: 1 }}>Zuiderakerweg 15b, 1069MD</div>
            <div style={{ marginBottom: 1 }}>Amsterdam, The Netherlands.</div>
            <div style={{ marginBottom: 1 }}>
              <span style={{ color: "#000", fontSize: 12 }}>●</span> +31 6 20 57 84 96
            </div>
            <div style={{ marginBottom: 1 }}>
              <span style={{ color: "#000", fontSize: 12 }}>●</span> contact@gasfil.com
            </div>
            <div>
              <span style={{ color: "#000", fontSize: 12 }}>●</span> www.gasfil.com
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <h2 style={{ margin: 0, fontSize: 26 }}>QUOTE</h2>
          <div><strong>QUOTE N°:</strong> {String(quote.id).padStart(5, "0")}</div>
          <div><strong>Client:</strong> {quote.clientName}</div>
          <div><strong>Date:</strong> {new Date(quote.date).toLocaleDateString("en-US")}</div>
          {quote.lieu && <div><strong>Location:</strong> {quote.lieu}</div>}
        </div>
      </div>

      {/* Introductory line */}
      <div style={{ margin: '24px 0 8px 0' }}>
        Hello,<br/>
        Thank you for your price request. Please find below our best offer and our terms of sale:
      </div>

      {/* Items Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20, marginBottom: 30 }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            {["Description","Quantity","Unit Price","Total"].map((h) => (
              <th key={h} style={{
                padding: 8, border: "1px solid #ccc",
                textAlign: h === "Quantity" ? "center" : h === "Unit Price" || h === "Total" ? "right" : "left",
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
              <td style={{ padding: "8px 0", fontWeight: "bold" }}>Subtotal:</td>
              <td style={{ textAlign: "right" }}>{totalHT.toFixed(2)} DH</td>
            </tr>
            <tr>
              <td style={{ paddingBottom: 8, fontWeight: "bold" }}>VAT {tvaRate}%:</td>
              <td style={{ textAlign: "right" }}>{tvaAmount.toFixed(2)} DH</td>
            </tr>
            <tr style={{ borderTop: "2px solid #FF8C00" }}>
              <td style={{ fontWeight: "bold" }}>Total Amount:</td>
              <td style={{ fontWeight: "bold", textAlign: "right", color: "#FF8C00" }}>
                {totalTTC.toFixed(2)} DH
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div
        className="pdf-footer"
        style={{
          position: "fixed",
          left: 40,
          right: 40,
          bottom: 40,
          paddingTop: 10,
          fontSize: 11,
          background: "#fff",
        }}
      >
        {/* Horizontal line with colored sections */}
        <div
          style={{
            height: 3,
            display: "flex",
            marginBottom: 15,
          }}
        >
          <div
            style={{
              width: "50%",
              backgroundColor: "#FF8C00", // Orange color
            }}
          />
          <div
            style={{
              width: "50%",
              backgroundColor: "#000000", // Black color
            }}
          />
        </div>

        {/* Footer content */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          {/* Left section - Banking Information */}
          <div style={{ width: "50%", paddingRight: 20 }}>
            <div style={{ display: "flex", marginBottom: 4 }}>
              <div style={{ width: 100, fontWeight: 600 }}>BANK NAME</div>
              <div>ABN AMRO BANK</div>
            </div>
            <div style={{ display: "flex", marginBottom: 4 }}>
              <div style={{ width: 100, fontWeight: 600 }}>IBAN NUMBER</div>
              <div>IBAN : NL88 ABNA 0128671513</div>
            </div>
            <div style={{ display: "flex", marginBottom: 4 }}>
              <div style={{ width: 100, fontWeight: 600 }}>BIC/swift code</div>
              <div>ABNANL2A</div>
            </div>
          </div>

          {/* Right section - Company Identification */}
          <div style={{ width: "50%", paddingLeft: 20 }}>
            <div style={{ display: "flex", marginBottom: 4 }}>
              <div style={{ width: 100, fontWeight: 600 }}>EORI-number</div>
              <div>NL86564926139590111</div>
            </div>
            <div style={{ display: "flex", marginBottom: 4 }}>
              <div style={{ width: 100, fontWeight: 600 }}>Our VAT Number</div>
              <div>NL865649261B01</div>
            </div>
            <div style={{ display: "flex", marginBottom: 4 }}>
              <div style={{ width: 100, fontWeight: 600 }}>Company Registra</div>
              <div>91414350</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotePdfView;
