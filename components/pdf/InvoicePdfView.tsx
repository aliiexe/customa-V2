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

        {/* Invoice Metadata */}
        <div style={{ textAlign: "right" }}>
          <h2 style={{ margin: 0, fontSize: 26 }}>INVOICE</h2>
          <div>
            <strong>INVOICE N°:</strong> {String(invoice.id).padStart(5, "0")}
          </div>
          <div>
            <strong>Client:</strong> {invoice.clientName}
          </div>
          <div>
            <strong>Date:</strong>{" "}
            {new Date(invoice.dateCreated).toLocaleDateString("en-US")}
          </div>
          <div>
            <strong>Delivery:</strong>{" "}
            {new Date(invoice.deliveryDate).toLocaleDateString("en-US")}
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
          <strong>BILL TO</strong>
          <div>{invoice.clientName}</div>
          {invoice.clientAddress && <div>{invoice.clientAddress}</div>}
          {invoice.clientEmail && <div>Email: {invoice.clientEmail}</div>}
          {invoice.clientPhone && <div>Phone: {invoice.clientPhone}</div>}
        </div>
        <div style={{ textAlign: "right" }}>
          <strong>DELIVER TO</strong>
          <div>{invoice.clientName}</div>
          <div>{invoice.clientAddress || "[Delivery address]"}</div>
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
              Description
            </th>
            <th style={{ padding: 8, border: "1px solid #ccc", textAlign: "left" }}>
              Reference
            </th>
            <th style={{ padding: 8, border: "1px solid #ccc", textAlign: "center" }}>
              Quantity
            </th>
            <th style={{ padding: 8, border: "1px solid #ccc", textAlign: "right" }}>
              Unit Price
            </th>
            <th style={{ padding: 8, border: "1px solid #ccc", textAlign: "right" }}>
              Total
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
              <td style={{ padding: "8px 0", fontWeight: "bold"}}>Subtotal:</td>
              <td style={{ textAlign: "right" }}>
                {totalHT.toFixed(2)} DH
              </td>
            </tr>
            <tr>
              <td style={{ paddingBottom: 8 }}>
                <span style={{ fontWeight: "bold" }}>
                  VAT {tvaRate}%:
                </span>
              </td>
              <td style={{ textAlign: "right" }}>
                {tvaAmount.toFixed(2)} DH
              </td>
            </tr>
            <tr style={{ borderTop: "2px solid #FF8C00" }}>
              <td style={{ fontWeight: "bold" }}>Total Amount:</td>
              <td
                style={{
                  fontWeight: "bold",
                  textAlign: "right",
                  color: "#FF8C00",
                }}
              >
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

export default InvoicePdfView;
