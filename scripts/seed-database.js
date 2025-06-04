// This is a simplified version of the seed script that can be run directly
// It will populate your database with sample data for testing

const mysql = require("mysql2/promise")

async function seedDatabase() {
  console.log("Starting database seeding...")

  // Database configuration
  const connection = await mysql.createConnection({
    host: "gateway01.us-west-2.prod.aws.tidbcloud.com",
    port: 4000,
    user: "3cCV8A7jGy25fjk.root",
    password: "S9SQ3wgf8ntySRRc",
    database: "test",
    ssl: { rejectUnauthorized: true },
  })

  try {
    // Check if we already have data
    const [categoryCheck] = await connection.execute("SELECT COUNT(*) as count FROM product_categories")
    if (categoryCheck[0].count > 0) {
      console.log("Database already has data. Skipping seeding to avoid duplicates.")
      return
    }

    // Seed categories
    console.log("Seeding product categories...")
    const categories = [
      "Electronics",
      "Office Supplies",
      "Furniture",
      "Kitchen Appliances",
      "Computer Accessories",
      "Networking Equipment",
    ]

    for (const category of categories) {
      await connection.execute("INSERT INTO product_categories (name) VALUES (?)", [category])
    }

    // Get the inserted category IDs
    const [categoryRows] = await connection.execute("SELECT id, name FROM product_categories")
    const categoryMap = categoryRows.reduce((map, row) => {
      map[row.name] = row.id
      return map
    }, {})

    // Seed suppliers
    console.log("Seeding suppliers...")
    const suppliers = [
      {
        name: "Tech Solutions Inc.",
        contactName: "John Smith",
        address: "123 Tech Street, Silicon Valley, CA",
        email: "contact@techsolutions.com",
        phoneNumber: "555-123-4567",
        website: "www.techsolutions.com",
      },
      {
        name: "Office World",
        contactName: "Sarah Johnson",
        address: "456 Office Avenue, Business District, NY",
        email: "info@officeworld.com",
        phoneNumber: "555-987-6543",
        website: "www.officeworld.com",
      },
      {
        name: "Furniture Plus",
        contactName: "Michael Brown",
        address: "789 Furniture Boulevard, Design District, MI",
        email: "sales@furnitureplus.com",
        phoneNumber: "555-456-7890",
        website: "www.furnitureplus.com",
      },
    ]

    for (const supplier of suppliers) {
      await connection.execute(
        `INSERT INTO suppliers 
         (name, contactName, address, email, phoneNumber, website) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [supplier.name, supplier.contactName, supplier.address, supplier.email, supplier.phoneNumber, supplier.website],
      )
    }

    // Get the inserted supplier IDs
    const [supplierRows] = await connection.execute("SELECT id, name FROM suppliers")
    const supplierMap = supplierRows.reduce((map, row) => {
      map[row.name] = row.id
      return map
    }, {})

    // Seed products
    console.log("Seeding products...")
    const products = [
      {
        name: "Laptop Pro X1",
        reference: "LP-X1",
        supplierPrice: 800,
        sellingPrice: 1200,
        stockQuantity: 15,
        description: "High-performance laptop with 16GB RAM and 512GB SSD",
        supplierId: supplierMap["Tech Solutions Inc."],
        categoryId: categoryMap["Electronics"],
      },
      {
        name: "Office Chair Deluxe",
        reference: "OC-DLX",
        supplierPrice: 150,
        sellingPrice: 250,
        stockQuantity: 8,
        description: "Ergonomic office chair with adjustable height and lumbar support",
        supplierId: supplierMap["Furniture Plus"],
        categoryId: categoryMap["Furniture"],
      },
      {
        name: "Wireless Mouse",
        reference: "WM-101",
        supplierPrice: 15,
        sellingPrice: 30,
        stockQuantity: 50,
        description: "Bluetooth wireless mouse with long battery life",
        supplierId: supplierMap["Tech Solutions Inc."],
        categoryId: categoryMap["Computer Accessories"],
      },
      {
        name: "Premium Paper Ream",
        reference: "PPR-500",
        supplierPrice: 5,
        sellingPrice: 8.5,
        stockQuantity: 100,
        description: "500 sheets of premium A4 paper",
        supplierId: supplierMap["Office World"],
        categoryId: categoryMap["Office Supplies"],
      },
      {
        name: "Network Router Pro",
        reference: "NR-PRO",
        supplierPrice: 80,
        sellingPrice: 120,
        stockQuantity: 12,
        description: "High-speed wireless router with extended range",
        supplierId: supplierMap["Tech Solutions Inc."],
        categoryId: categoryMap["Networking Equipment"],
      },
      {
        name: "Coffee Maker Deluxe",
        reference: "CM-DLX",
        supplierPrice: 60,
        sellingPrice: 95,
        stockQuantity: 5,
        description: "Programmable coffee maker with thermal carafe",
        supplierId: supplierMap["Office World"],
        categoryId: categoryMap["Kitchen Appliances"],
      },
    ]

    for (const product of products) {
      await connection.execute(
        `INSERT INTO products 
         (name, reference, supplierPrice, sellingPrice, stockQuantity, description, supplierId, categoryId) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          product.name,
          product.reference,
          product.supplierPrice,
          product.sellingPrice,
          product.stockQuantity,
          product.description,
          product.supplierId,
          product.categoryId,
        ],
      )
    }

    // Seed clients
    console.log("Seeding clients...")
    const clients = [
      {
        name: "Acme Corporation",
        address: "123 Business Road, Corporate Park, NY",
        email: "orders@acmecorp.com",
        phoneNumber: "555-111-2222",
        iban: "US12345678901234567890",
      },
      {
        name: "Global Enterprises",
        address: "456 Enterprise Street, Business Center, CA",
        email: "purchasing@globalent.com",
        phoneNumber: "555-333-4444",
        iban: "US09876543210987654321",
      },
      {
        name: "Local Business LLC",
        address: "789 Main Street, Downtown, TX",
        email: "info@localbusiness.com",
        phoneNumber: "555-555-6666",
        iban: "US13579246801357924680",
      },
    ]

    for (const client of clients) {
      await connection.execute(
        `INSERT INTO clients 
         (name, address, email, phoneNumber, iban) 
         VALUES (?, ?, ?, ?, ?)`,
        [client.name, client.address, client.email, client.phoneNumber, client.iban],
      )
    }

    // Get the inserted client IDs
    const [clientRows] = await connection.execute("SELECT id, name FROM clients")
    const clientMap = clientRows.reduce((map, row) => {
      map[row.name] = row.id
      return map
    }, {})

    // Get the inserted product IDs
    const [productRows] = await connection.execute("SELECT id, name FROM products")
    const productMap = productRows.reduce((map, row) => {
      map[row.name] = row.id
      return map
    }, {})

    // Seed client quotes
    console.log("Seeding client quotes...")
    const today = new Date()
    const oneMonthLater = new Date(today)
    oneMonthLater.setMonth(today.getMonth() + 1)

    const clientQuotes = [
      {
        clientId: clientMap["Acme Corporation"],
        dateCreated: today,
        validUntil: oneMonthLater,
        totalAmount: 1450,
        status: "APPROVED",
        notes: "Quote for office equipment",
        items: [
          {
            productId: productMap["Laptop Pro X1"],
            quantity: 1,
            unitPrice: 1200,
            totalPrice: 1200,
          },
          {
            productId: productMap["Wireless Mouse"],
            quantity: 2,
            unitPrice: 30,
            totalPrice: 60,
          },
          {
            productId: productMap["Premium Paper Ream"],
            quantity: 5,
            unitPrice: 8.5,
            totalPrice: 42.5,
          },
          {
            productId: productMap["Coffee Maker Deluxe"],
            quantity: 1,
            unitPrice: 95,
            totalPrice: 95,
          },
        ],
      },
      {
        clientId: clientMap["Global Enterprises"],
        dateCreated: today,
        validUntil: oneMonthLater,
        totalAmount: 370,
        status: "PENDING",
        notes: "Quote for networking equipment",
        items: [
          {
            productId: productMap["Network Router Pro"],
            quantity: 3,
            unitPrice: 120,
            totalPrice: 360,
          },
          {
            productId: productMap["Premium Paper Ream"],
            quantity: 1,
            unitPrice: 8.5,
            totalPrice: 8.5,
          },
        ],
      },
    ]

    for (const quote of clientQuotes) {
      // Insert quote header
      const [quoteResult] = await connection.execute(
        `INSERT INTO client_quotes 
         (clientId, dateCreated, validUntil, totalAmount, status, notes) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [quote.clientId, quote.dateCreated, quote.validUntil, quote.totalAmount, quote.status, quote.notes],
      )

      const quoteId = quoteResult.insertId

      // Insert quote items
      for (const item of quote.items) {
        await connection.execute(
          `INSERT INTO client_quote_items 
           (quoteId, productId, quantity, unitPrice, totalPrice) 
           VALUES (?, ?, ?, ?, ?)`,
          [quoteId, item.productId, item.quantity, item.unitPrice, item.totalPrice],
        )
      }
    }

    // Seed client invoices
    console.log("Seeding client invoices...")
    const deliveryDate = new Date(today)
    deliveryDate.setDate(today.getDate() + 7)

    const clientInvoices = [
      {
        clientId: clientMap["Local Business LLC"],
        quoteId: null,
        totalAmount: 250,
        dateCreated: today,
        deliveryDate: deliveryDate,
        status: "PAID",
        items: [
          {
            productId: productMap["Office Chair Deluxe"],
            quantity: 1,
            unitPrice: 250,
            totalPrice: 250,
          },
        ],
      },
      {
        clientId: clientMap["Acme Corporation"],
        quoteId: null,
        totalAmount: 148.5,
        dateCreated: today,
        deliveryDate: deliveryDate,
        status: "UNPAID",
        items: [
          {
            productId: productMap["Coffee Maker Deluxe"],
            quantity: 1,
            unitPrice: 95,
            totalPrice: 95,
          },
          {
            productId: productMap["Premium Paper Ream"],
            quantity: 5,
            unitPrice: 8.5,
            totalPrice: 42.5,
          },
          {
            productId: productMap["Wireless Mouse"],
            quantity: 1,
            unitPrice: 30,
            totalPrice: 30,
          },
        ],
      },
    ]

    for (const invoice of clientInvoices) {
      // Insert invoice header
      const [invoiceResult] = await connection.execute(
        `INSERT INTO client_invoices 
         (clientId, quoteId, totalAmount, dateCreated, deliveryDate, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          invoice.clientId,
          invoice.quoteId,
          invoice.totalAmount,
          invoice.dateCreated,
          invoice.deliveryDate,
          invoice.status,
        ],
      )

      const invoiceId = invoiceResult.insertId

      // Insert invoice items
      for (const item of invoice.items) {
        await connection.execute(
          `INSERT INTO client_invoice_items 
           (invoiceId, productId, quantity, unitPrice, totalPrice) 
           VALUES (?, ?, ?, ?, ?)`,
          [invoiceId, item.productId, item.quantity, item.unitPrice, item.totalPrice],
        )
      }
    }

    console.log("Database seeding completed successfully!")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await connection.end()
  }
}

// Run the seeding function
seedDatabase()
