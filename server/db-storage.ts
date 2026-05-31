import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import type { IStorage } from './storage';
import type { User, InsertUser, Farmer, InsertFarmer, Product, InsertProduct, Order, InsertOrder, ServiceArea, Hub } from '@shared/schema';


const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

export class DbStorage implements IStorage {
  async getUsers(): Promise<User[]> {
    return db.select().from(schema.users);
  }
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return result[0];
  }
  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return result[0];
  }
  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(schema.users).values(user).returning();
    return result[0];
  }
  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const result = await db.update(schema.users).set(updates).where(eq(schema.users.id, id)).returning();
    return result[0];
  }
  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(schema.users).where(eq(schema.users.id, id)).returning();
    return result.length > 0;
  }
  async getServiceAreas(): Promise<ServiceArea[]> {
    return db.select().from(schema.serviceAreas);
  }
  async getServiceArea(id: string): Promise<ServiceArea | undefined> {
    const result = await db.select().from(schema.serviceAreas).where(eq(schema.serviceAreas.id, id));
    return result[0];
  }
  async getHubs(): Promise<Hub[]> {
    return db.select().from(schema.hubs);
  }
  async getHub(id: string): Promise<Hub | undefined> {
    const result = await db.select().from(schema.hubs).where(eq(schema.hubs.id, id));
    return result[0];
  }
  async getFarmers(): Promise<Farmer[]> {
    return db.select().from(schema.farmers);
  }
  async getFarmer(id: string): Promise<Farmer | undefined> {
    const result = await db.select().from(schema.farmers).where(eq(schema.farmers.id, id));
    return result[0];
  }
  async createFarmer(farmer: InsertFarmer): Promise<Farmer> {
    const result = await db.insert(schema.farmers).values(farmer).returning();
    return result[0];
  }
  async getProducts(category?: string, farmerId?: string): Promise<Product[]> {
    let query = db.select().from(schema.products).where(eq(schema.products.isActive, true));
    if (category) {
      query = db.select().from(schema.products).where(and(eq(schema.products.isActive, true), eq(schema.products.category, category)));
    }
    return query;
  }
  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(schema.products).where(eq(schema.products.id, id));
    return result[0];
  }
  async getFeaturedProducts(): Promise<Product[]> {
    return db.select().from(schema.products).where(and(eq(schema.products.featured, true), eq(schema.products.isActive, true)));
  }
  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(schema.products).values(product).returning();
    return result[0];
  }
  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    const result = await db.update(schema.products).set(updates).where(eq(schema.products.id, id)).returning();
    return result[0];
  }
  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(schema.products).where(eq(schema.products.id, id)).returning();
    return result.length > 0;
  }
  async getOrders(): Promise<Order[]> {
    return db.select().from(schema.orders);
  }
  async getOrder(id: string): Promise<Order | undefined> {
    const result = await db.select().from(schema.orders).where(eq(schema.orders.id, id));
    return result[0];
  }
  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await db.insert(schema.orders).values(order).returning();
    return result[0];
  }
  async getPlatformConfig(): Promise<Record<string, any>> {
    return {};
  }
  async setPlatformConfig(config: Record<string, any>): Promise<Record<string, any>> {
    return config;
  }
}
