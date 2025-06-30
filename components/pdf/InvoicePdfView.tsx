import React from 'react';

interface InvoiceItem {
  id: number;
  productName: string;
  productReference: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
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
    payment_status: 'PAID' | 'UNPAID';
    delivery_status: 'IN_PROCESS' | 'SENDING' | 'DELIVERED';
    items: InvoiceItem[];
    sender?: {
      name: string;
      address?: string;
      email?: string;
      phone?: string;
      website?: string;
    };
  };
}

const InvoicePdfView: React.FC<InvoicePdfViewProps> = ({ invoice }) => {
  const sender = invoice.sender || {
    name: 'Carbon Activated GmbH',
    address: 'Westererbenstraße 24, 44147 Dortmund, Germany',
    email: 'info-europede@activatedcarbon.com',
    phone: '+49 231 54520734',
    website: 'www.activatedcarbon.com',
  };

  return (
    <div style={{
      width: 794,
      backgroundColor: '#fff',
      color: '#222',
      fontFamily: 'Segoe UI, sans-serif',
      padding: 40,
      fontSize: 13,
      lineHeight: 1.5
    }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        {/* Logo & Sender Info */}
        <div style={{ width: '50%' }}>
          <img src="https://via.placeholder.com/180x60?text=LOGO" alt="Company Logo" style={{ marginBottom: 12 }} />
          <div style={{ fontWeight: 600 }}>{sender.name}</div>
          <div>{sender.address}</div>
          <div>{sender.phone}</div>
          <div>{sender.email}</div>
          <div>{sender.website}</div>
        </div>

        {/* Invoice Metadata */}
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ margin: 0, fontSize: 26 }}>INVOICE</h2>
          <div><strong>Invoice #:</strong> {String(invoice.id).padStart(4, '0')}</div>
          <div><strong>Invoice Date:</strong> {new Date(invoice.dateCreated).toLocaleDateString()}</div>
          <div><strong>Ship Date:</strong> {new Date(invoice.deliveryDate).toLocaleDateString()}</div>
          <div><strong>Terms:</strong> Net 30</div>
          <div><strong>Due Date:</strong>  {/* Placeholder: replace with computed date if needed */}07.02.2025</div>
          <div><strong>Status:</strong> {invoice.payment_status} / {invoice.delivery_status}</div>
        </div>
      </div>

      {/* Bill To / Ship To */}
      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '30px 0' }}>
        <div>
          <strong>BILL TO</strong>
          <div>{invoice.clientName}</div>
          {invoice.clientAddress && <div>{invoice.clientAddress}</div>}
          {invoice.clientEmail && <div>Email: {invoice.clientEmail}</div>}
          {invoice.clientPhone && <div>Phone: {invoice.clientPhone}</div>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <strong>SHIP TO</strong>
          <div>{invoice.clientName}</div>
          <div>[Insert Shipping Address]</div>
        </div>
      </div>

      {/* Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20, marginBottom: 30 }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={{ padding: 8, borderBottom: '1px solid #ccc', textAlign: 'left' }}>Date</th>
            <th style={{ padding: 8, borderBottom: '1px solid #ccc', textAlign: 'left' }}>Description</th>
            <th style={{ padding: 8, borderBottom: '1px solid #ccc', textAlign: 'right' }}>Qty</th>
            <th style={{ padding: 8, borderBottom: '1px solid #ccc', textAlign: 'right' }}>Rate</th>
            <th style={{ padding: 8, borderBottom: '1px solid #ccc', textAlign: 'right' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr key={item.id}>
              <td style={{ padding: 8 }}>{invoice.dateCreated}</td>
              <td style={{ padding: 8 }}>{item.productName}</td>
              <td style={{ padding: 8, textAlign: 'right' }}>{item.quantity}</td>
              <td style={{ padding: 8, textAlign: 'right' }}>${Number(item.unitPrice).toFixed(2)}</td>
              <td style={{ padding: 8, textAlign: 'right' }}>${Number(item.totalPrice).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <table style={{ width: 300 }}>
          <tbody>
            <tr>
              <td style={{ padding: '8px 0' }}>Subtotal:</td>
              <td style={{ textAlign: 'right' }}>${Number(invoice.items.reduce((sum, i) => sum + i.totalPrice, 0)).toFixed(2)}</td>
            </tr>
            <tr>
              <td>Tax:</td>
              <td style={{ textAlign: 'right' }}>$0.00</td>
            </tr>
            <tr style={{ borderTop: '2px solid #2e7d32' }}>
              <td style={{ fontWeight: 'bold' }}>TOTAL:</td>
              <td style={{ fontWeight: 'bold', textAlign: 'right', color: '#2e7d32' }}>${Number(invoice.totalAmount).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Payment Info Footer */}
      <div style={{ marginTop: 50, fontSize: 12, color: '#444' }}>
        <p><strong>Kindly indicate the invoice number in your payment reference.</strong></p>
        <p>For payments in €:</p>
        <div>Carbon Activated GmbH<br />Commerzbank Dortmund<br />IBAN: DE29 7004 0041 0272 3070 00<br />BIC: COBADEFFXXX</div>
        <br />
        <p>For payments in USD:</p>
        <div>IBAN: DE02 7004 0041 0272 3070 01<br />BIC: COBADEFFXXX</div>
      </div>
    </div>
  );
};

export default InvoicePdfView;
