import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);

// Fix URLs that start with /https://
const products = await sql`SELECT id, name, image FROM products`;
for (const product of products) {
  if (product.image?.startsWith('/https://')) {
    const fixedUrl = product.image.substring(1); // Remove leading /
    await sql`UPDATE products SET image = ${fixedUrl} WHERE id = ${product.id}`;
    console.log(`Fixed: ${product.name} -> ${fixedUrl}`);
  } else if (product.image?.startsWith('/uploads/')) {
    await sql`UPDATE products SET image = null WHERE id = ${product.id}`;
    console.log(`Cleared local path for: ${product.name}`);
  }
}
console.log('Done!');
process.exit();