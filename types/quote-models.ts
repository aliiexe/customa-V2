export enum QuoteStatus {
  DRAFT = "DRAFT",           // Initial draft state - can be edited
  PENDING = "PENDING",       // Sent to client, waiting for response
  CONFIRMED = "CONFIRMED",   // Client confirmed the quote
  APPROVED = "APPROVED",     // Internal approval (if needed)
  REJECTED = "REJECTED",     // Client rejected
  CONVERTED = "CONVERTED",   // Converted to invoice
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
  originalPrice?: number    // Original product price for comparison
}

export interface ClientQuoteItem extends QuoteItem {
  quoteId: number
}

export interface SupplierQuoteItem extends QuoteItem {
  quoteId: number
}

// New interface for quote creation/editing
export interface CreateQuoteRequest {
  clientId: number
  validUntil?: Date
  notes?: string
  items: CreateQuoteItemRequest[]
}

export interface CreateQuoteItemRequest {
  productId: number
  quantity: number
  unitPrice: number
}

// New interface for quote confirmation
export interface ConfirmQuoteRequest {
  quoteId: number
  confirmedItems: ConfirmQuoteItemRequest[]
  notes?: string
}

export interface ConfirmQuoteItemRequest {
  itemId: number
  confirmedUnitPrice: number
  confirmedQuantity: number
}
