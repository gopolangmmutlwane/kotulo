import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);
const products = await sql`SELECT name, image FROM products LIMIT 5`;
console.log(JSON.stringify(products, null, 2));
process.exit();