export enum QuoteStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CONVERTED = "CONVERTED", // When quote becomes an invoice
}

export interface BaseQuote {
  id: number
  dateCreated: Date
  totalAmount: number
  status: QuoteStatus
  validUntil?: Date
  notes?: string
}

export interface ClientQuote extends BaseQuote {
  clientId: number
  clientName?: string
  convertedInvoiceId?: number // Reference to invoice if converted
}

export interface SupplierQuote extends BaseQuote {
  supplierId: number
  supplierName?: string
  convertedInvoiceId?: number // Reference to invoice if converted
}

export interface QuoteItem {
  id: number
  productId: number
  quantity: number
  unitPrice: number
  totalPrice: number
  productName?: string
  productReference?: string
}

export interface ClientQuoteItem extends QuoteItem {
  quoteId: number
}

export interface SupplierQuoteItem extends QuoteItem {
  quoteId: number
}
