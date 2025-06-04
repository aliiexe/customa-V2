import mysql from "mysql2/promise"

// Parse connection details from environment or use provided values
const DB_CONFIG = {
  host: process.env.TIDB_HOST || "gateway01.us-west-2.prod.aws.tidbcloud.com",
  port: Number.parseInt(process.env.TIDB_PORT || "4000"),
  user: process.env.TIDB_USER || "3cCV8A7jGy25fjk.root",
  password: process.env.TIDB_PASSWORD || "S9SQ3wgf8ntySRRc",
  database: process.env.TIDB_DATABASE || "test",
  ssl: { rejectUnauthorized: true },
  connectionLimit: 10,
  timezone: "+00:00",
}

// Create a connection pool
const pool = mysql.createPool(DB_CONFIG)

// Helper function to execute queries
export async function query(sql: string, params?: any[]) {
  try {
    const [results] = await pool.execute(sql, params)
    return results
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Helper function for transactions
export async function transaction<T>(callback: (connection: mysql.PoolConnection) => Promise<T>): Promise<T> {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const result = await callback(connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}
