import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);
const orders = await sql`SELECT id, items, status, vendor_id FROM orders ORDER BY created_at DESC LIMIT 3`;
console.log(JSON.stringify(orders, null, 2));
process.exit();
