import type { Farmer, InsertFarmer, Product, InsertProduct, Order, InsertOrder, User, InsertUser, ServiceArea, Hub, KotuloNotification, InsertKotuloNotification } from "@shared/schema";

export interface IStorage {
  // Users
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  // Service Areas
  getServiceAreas(): Promise<ServiceArea[]>;
  getServiceArea(id: string): Promise<ServiceArea | undefined>;

  // Hubs
  getHubs(): Promise<Hub[]>;
  getHub(id: string): Promise<Hub | undefined>;

  // Farmers
  getFarmers(): Promise<Farmer[]>;
  getFarmer(id: string): Promise<Farmer | undefined>;
  createFarmer(farmer: InsertFarmer): Promise<Farmer>;

  // Products
  getProducts(category?: string, farmerId?: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getFeaturedProducts(): Promise<Product[]>;
  getPendingProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined>;

// Notifications
  createNotification(notification: InsertKotuloNotification): Promise<KotuloNotification>;
  getNotificationsByUser(userId: string): Promise<KotuloNotification[]>;
  markNotificationRead(id: string): Promise<void>;

  // Platform Config
  getPlatformConfig(): Promise<Record<string, any>>;
  setPlatformConfig(config: Record<string, any>): Promise<Record<string, any>>;
}

import { DbStorage } from './db-storage';
export const storage = new DbStorage();