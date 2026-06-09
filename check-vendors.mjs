import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);
const vendors = await sql`SELECT id, name, role, business_model, service_area, approval_status FROM users WHERE role = 'vendor'`;
console.log(JSON.stringify(vendors, null, 2));
process.exit();
