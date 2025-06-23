# Enhanced Quote System

This document describes the enhanced quote system that allows for draft quotes, price negotiations, and conversion to invoices without affecting stock levels.

## Overview

The quote system now supports a complete workflow from draft creation to invoice conversion, with the ability to adjust prices and quantities at each stage without impacting inventory.

## Quote Status Flow

1. **DRAFT** - Initial state where quotes can be created and edited
2. **PENDING** - Quote sent to client for review
3. **CONFIRMED** - Client has confirmed the quote
4. **APPROVED** - Internal approval (optional step)
5. **CONVERTED** - Quote converted to invoice
6. **REJECTED** - Client rejected the quote

## Key Features

### 1. Draft Quotes
- Create quotes in draft mode
- Adjust selling prices for each product
- Add/remove items freely
- No impact on stock levels
- Save and edit multiple times

### 2. Price Adjustments
- Set custom unit prices for each product
- Automatic discount/markup calculation
- Visual indicators for price changes
- Track original vs. quoted prices

### 3. Quote Confirmation
- Send quotes to clients
- Client can review and confirm
- Maintain price flexibility until confirmation
- No stock reservation during negotiation

### 4. Invoice Conversion
- Convert confirmed quotes to invoices
- Preserve all pricing and quantities
- No stock impact during conversion
- Stock only affected when invoice is fulfilled

## Database Schema Updates

The following changes were made to support the enhanced quote system:

### client_quotes table
- Added `updatedAt` timestamp field
- Enhanced status enum support

### client_quote_items table
- Added `discount` field (DECIMAL(5,2)) to track price adjustments
- Supports percentage-based discount calculations

## API Endpoints

### Create Quote
```
POST /api/quotes/client
```
- Creates new quote in DRAFT status
- Supports custom pricing and discounts

### Update Quote
```
PUT /api/quotes/client/[id]
```
- Updates draft quotes only
- Recalculates totals and discounts

### Update Quote Status
```
PATCH /api/quotes/client/[id]/status
```
- Changes quote status (DRAFT → PENDING → CONFIRMED, etc.)
- Validates status transitions

### Convert Quote to Invoice
```
POST /api/quotes/client/[id]/convert
```
- Converts confirmed/approved quotes to invoices
- Creates invoice with same items and pricing
- Updates quote status to CONVERTED

## User Interface

### Quote Creation Page (`/quotes/client/new`)
- Client selection
- Product selection with price adjustment
- Real-time total calculation
- Discount/markup indicators
- Save as draft or send to client

### Quote Detail Page (`/quotes/client/[id]`)
- View quote details and items
- Status-specific actions
- Price comparison display
- Convert to invoice option

### Quote Edit Page (`/quotes/client/[id]/edit`)
- Edit draft quotes only
- Modify items, quantities, and prices
- Save changes or send to client

### Quote List Page (`/quotes/client`)
- Filter by status, client, date range
- Sort by various criteria
- Status-specific action buttons
- Real-time data from API

## Stock Management

**Important**: The quote system is designed to NOT affect stock levels until the invoice is actually fulfilled. This allows for:

- Flexible pricing negotiations
- Multiple quote revisions
- Client confirmation process
- No premature stock reservations

Stock is only affected when:
1. Invoice is created from quote
2. Invoice is marked as fulfilled/processed
3. Actual stock movement occurs

## Usage Examples

### Creating a Draft Quote
1. Navigate to `/quotes/client/new`
2. Select client and add products
3. Adjust prices as needed
4. Save as draft
5. Edit multiple times until ready

### Sending Quote to Client
1. From draft quote, click "Send to Client"
2. Quote status changes to PENDING
3. Client can review and confirm
4. No stock impact during this process

### Confirming Quote
1. Client confirms quote
2. Status changes to CONFIRMED
3. Ready for invoice conversion
4. Pricing is locked in

### Converting to Invoice
1. From confirmed quote, click "Convert to Invoice"
2. Creates invoice with same items/pricing
3. Quote status becomes CONVERTED
4. Invoice ready for fulfillment

## Benefits

1. **Flexible Pricing**: Adjust prices without affecting stock
2. **Client Negotiation**: Support price discussions with clients
3. **Draft Management**: Create and edit quotes freely
4. **Stock Protection**: No premature stock reservations
5. **Audit Trail**: Track all price changes and status updates
6. **Workflow Support**: Clear status progression
7. **Invoice Integration**: Seamless conversion to invoices

## Migration

To update an existing database:

```sql
-- Run the migration script
source scripts/update-quote-schema.sql
```

This will:
- Add the discount field to quote items
- Update existing quotes to DRAFT status
- Add performance indexes
- Ensure compatibility with new features 