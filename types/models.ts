export enum InvoiceStatus {
  PAID = "PAID",
  UNPAID = "UNPAID",
}

export interface User {
  id: number
  firstname: string
  lastname: string
  username: string
  email: string
  password: string
  phone: string
  address: string
  city: string
  balance: number
  actived: boolean
}

export interface Role {
  id: number
  roleName: string
}

export interface ProductCategory {
  id: number
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: number
  name: string
  reference: string
  supplierPrice: number
  sellingPrice: number
  stockQuantity: number
  provisionalStock: number
  description?: string
  supplierId: number
  categoryId: number
  createdAt: Date
  updatedAt: Date
  // Joined fields
  supplierName?: string
  categoryName?: string
}

export interface Supplier {
  id: number
  name: string
  contactName: string
  address: string
  email: string
  rib?: string
  iban: string
  phoneNumber: string
  website?: string
  createdAt: Date
  updatedAt: Date
}

export interface Client {
  id: number
  name: string
  address: string
  email: string
  phoneNumber: string
  iban: string
  rib?: string
  createdAt: Date
  updatedAt: Date
}

export interface BaseInvoice {
  id: number
  totalAmount: number
  dateCreated: Date
  deliveryDate: Date
  status: InvoiceStatus
}

export interface ClientInvoice extends BaseInvoice {
  clientId: number
  quoteId?: number
  clientName?: string
}

export interface SupplierInvoice extends BaseInvoice {
  supplierId: number
  quoteId?: number
  supplierName?: string
}

export interface InvoiceItem {
  id: number
  productId: number
  quantity: number
  unitPrice: number
  totalPrice: number
  productName?: string
}

export interface ClientInvoiceItem extends InvoiceItem {
  invoiceId: number
}

export interface SupplierInvoiceItem extends InvoiceItem {
  invoiceId: number
}

export interface BaseQuote {
  id: number
  dateCreated: Date
  totalAmount: number
}

export interface ClientQuote extends BaseQuote {
  clientId: number
  clientName?: string
}

export interface SupplierQuote extends BaseQuote {
  supplierId: number
  supplierName?: string
}

export interface QuoteItem {
  id: number
  productId: number
  quantity: number
  unitPrice: number
  totalPrice: number
  productName?: string
}

export interface ClientQuoteItem extends QuoteItem {
  quoteId: number
}

export interface SupplierQuoteItem extends QuoteItem {
  quoteId: number
}
