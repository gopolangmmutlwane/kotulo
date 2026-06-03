import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);

// Verify all unverified users
await sql`UPDATE users SET email_verified = true WHERE email_verified = false`;
console.log('All users verified!');

// Show all users
const users = await sql`SELECT email, role, approval_status, email_verified FROM users`;
console.log(JSON.stringify(users, null, 2));
process.exit();