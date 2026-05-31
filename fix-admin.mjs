import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);
const result = await sql`UPDATE users SET role='admin' WHERE email='gopolang@kotulo.co.za'`;
console.log('Done! Admin role set.');
process.exit();