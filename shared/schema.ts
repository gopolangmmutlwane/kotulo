import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, jsonb, boolean, real, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enhanced user system with roles
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  password: text("password"), // Hashed password
  phone: text("phone"),
  address: text("address"),
  role: text("role").notNull().default("household"), // 'household', 'b2b', 'vendor', 'farmer', 'operations', 'admin'
  businessName: text("business_name"), // For B2B users, vendors, and farmers
  businessType: text("business_type"), // 'supermarket', 'restaurant', 'vendor', 'farm'
  creditLimit: decimal("credit_limit", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
  status: text("status").notNull().default("approved"), // 'pending', 'approved', 'rejected'
  rejectionReason: text("rejection_reason"),
  approvalStatus: text("approval_status").default("approved"), // 'pending', 'approved', 'rejected' - for vendors/farmers
  // Application data for vendors/farmers
  businessRegistrationNumber: text("business_registration_number"), // CIPC registration
  taxId: text("tax_id"), // VAT/Tax number
  businessAddress: text("business_address"), // Full business address
  businessDescription: text("business_description"), // Business description
  applicationDocuments: jsonb("application_documents"), // {license: "url", certificate: "url", etc.}
  applicationSubmittedAt: timestamp("application_submitted_at"), // When application was submitted
  emailVerified: boolean("email_verified").default(false),
  emailVerificationToken: text("email_verification_token"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Service areas for geo-fencing
export const serviceAreas = pgTable("service_areas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  geoPolygon: jsonb("geo_polygon").notNull(), // GeoJSON polygon
  deliveryFee: decimal("delivery_fee", { precision: 8, scale: 2 }).default("0"),
  minOrderValue: decimal("min_order_value", { precision: 8, scale: 2 }).default("0"),
  maxDeliveryTime: integer("max_delivery_time").default(60), // minutes
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Micro-fulfillment hubs
export const hubs = pgTable("hubs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  capacity: integer("capacity").default(1000),
  currentLoad: integer("current_load").default(0),
  coldStorage: boolean("cold_storage").default(true),
  isActive: boolean("is_active").default(true),
  operatingHours: jsonb("operating_hours"), // {open: "06:00", close: "22:00"}
  serviceAreaIds: text("service_area_ids").array(), // References to service areas
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced farmers/vendors
export const farmers = pgTable("farmers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  location: text("location").notNull(),
  province: text("province").notNull(),
  description: text("description"),
  farmType: text("farm_type").notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  avatar: text("avatar"),
  verified: boolean("verified").default(false),
  consignToHub: boolean("consign_to_hub").default(false),
  selfFulfill: boolean("self_fulfill").default(true),
  commissionRate: decimal("commission_rate", { precision: 4, scale: 2 }).default("10.00"), // %
  adBudget: decimal("ad_budget", { precision: 8, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced products with lot tracking
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  farmerId: varchar("farmer_id").references(() => farmers.id),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // 'vegetables', 'meat', 'dairy'
  subcategory: text("subcategory"), // 'leafy_greens', 'beef', 'milk'
  grade: text("grade"), // 'A', 'B', 'premium'
  weight: text("weight"), // '1kg', '2kg', '500g'
  retailPrice: decimal("retail_price", { precision: 10, scale: 2 }).notNull(),
  wholesalePrice: decimal("wholesale_price", { precision: 10, scale: 2 }),
  unit: text("unit").notNull(), // 'kg', 'L', 'box', 'piece'
  minOrderQty: integer("min_order_qty").default(1),
  maxOrderQty: integer("max_order_qty"),
  shelfLifeDays: integer("shelf_life_days"), // Days until expiry
  temperatureRange: text("temperature_range"), // '2-4°C', 'frozen', 'ambient'
  image: text("image"),
  featured: boolean("featured").default(false),
  organic: boolean("organic").default(false),
  substitutes: text("substitutes").array(), // Product IDs that can substitute
  isActive: boolean("is_active").default(true),
  status: text("status").notNull().default("approved"), // 'pending', 'approved', 'rejected'
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Product lots for batch tracking
export const productLots = pgTable("product_lots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  hubId: varchar("hub_id").references(() => hubs.id),
  batchNumber: text("batch_number").notNull(),
  harvestDate: timestamp("harvest_date"),
  packDate: timestamp("pack_date"),
  expiryDate: timestamp("expiry_date"),
  quantity: integer("quantity").notNull(),
  reserved: integer("reserved").default(0),
  available: integer("available").notNull(),
  temperature: real("temperature"), // Current temperature
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced orders with delivery tracking
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  type: text("type").notNull().default("household"), // 'household', 'b2b'
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  deliveryAddress: text("delivery_address").notNull(),
  deliveryLatitude: real("delivery_latitude"),
  deliveryLongitude: real("delivery_longitude"),
  serviceAreaId: varchar("service_area_id").references(() => serviceAreas.id),
  hubId: varchar("hub_id").references(() => hubs.id),
  items: jsonb("items").notNull(), // Array of order items
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal("delivery_fee", { precision: 8, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("pending"), // Order status workflow
  deliveryTimeSlot: timestamp("delivery_time_slot"),
  promisedDelivery: timestamp("promised_delivery"), // 60-min promise
  actualDelivery: timestamp("actual_delivery"),
  slaStatus: text("sla_status").default("on_time"), // 'on_time', 'late', 'failed'
  paymentMethod: text("payment_method"), // 'card', 'cash', 'credit'
  paymentStatus: text("payment_status").default("pending"),
  specialInstructions: text("special_instructions"),
  createdAt: timestamp("created_at").defaultNow(),
});

// B2B Purchase Orders
export const purchaseOrders = pgTable("purchase_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  poNumber: text("po_number").notNull().unique(),
  buyerId: varchar("buyer_id").notNull().references(() => users.id),
  supplierId: varchar("supplier_id").notNull().references(() => farmers.id),
  orderType: text("order_type").notNull(), // 'scheduled', 'recurring', 'one_time'
  deliveryDate: timestamp("delivery_date").notNull(),
  deliveryWindow: text("delivery_window"), // '8AM-12PM'
  items: jsonb("items").notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  status: text("status").default("draft"), // 'draft', 'sent', 'confirmed', 'delivered'
  paymentTerms: text("payment_terms").default("net_30"), // Payment terms
  recurringSchedule: jsonb("recurring_schedule"), // For recurring orders
  createdAt: timestamp("created_at").defaultNow(),
});

// Delivery tracking
export const deliveries = pgTable("deliveries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  driverId: varchar("driver_id").references(() => users.id),
  vehicleId: text("vehicle_id"),
  status: text("status").default("pending"), // 'pending', 'assigned', 'picked_up', 'in_transit', 'delivered'
  pickedUpAt: timestamp("picked_up_at"),
  estimatedDelivery: timestamp("estimated_delivery"),
  actualDelivery: timestamp("actual_delivery"),
  currentLatitude: real("current_latitude"),
  currentLongitude: real("current_longitude"),
  routeOptimized: boolean("route_optimized").default(false),
  proofOfDelivery: text("proof_of_delivery"), // Image URL
  deliveryNotes: text("delivery_notes"),
  customerSignature: text("customer_signature"), // Base64 signature
  temperature: real("temperature"), // Cold chain tracking
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas for all tables
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastLogin: true,
  emailVerificationToken: true,
  passwordResetToken: true,
  passwordResetExpires: true,
});

export const insertServiceAreaSchema = createInsertSchema(serviceAreas).omit({
  id: true,
  createdAt: true,
});

export const insertHubSchema = createInsertSchema(hubs).omit({
  id: true,
  createdAt: true,
});

export const insertFarmerSchema = createInsertSchema(farmers).omit({
  id: true,
  createdAt: true,
  rating: true,
  reviewCount: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  status: true,
  rejectionReason: true,
});

export const insertProductLotSchema = createInsertSchema(productLots).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  status: true,
  slaStatus: true,
  paymentStatus: true,
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertDeliverySchema = createInsertSchema(deliveries).omit({
  id: true,
  createdAt: true,
  status: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ServiceArea = typeof serviceAreas.$inferSelect;
export type InsertServiceArea = z.infer<typeof insertServiceAreaSchema>;

export type Hub = typeof hubs.$inferSelect;
export type InsertHub = z.infer<typeof insertHubSchema>;

export type Farmer = typeof farmers.$inferSelect;
export type InsertFarmer = z.infer<typeof insertFarmerSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type ProductLot = typeof productLots.$inferSelect;
export type InsertProductLot = z.infer<typeof insertProductLotSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;

export type Delivery = typeof deliveries.$inferSelect;
export type InsertDelivery = z.infer<typeof insertDeliverySchema>;

// Enums and constants
export const UserRole = z.enum(['household', 'b2b', 'vendor', 'operations', 'admin']);
export const BusinessType = z.enum(['supermarket', 'restaurant', 'vendor']);
export const ProductCategory = z.enum(['vegetables', 'meat', 'dairy', 'merchandise', 'clothing', 'fruits']);
export const ProductGrade = z.enum(['A', 'B', 'premium']);
export const TemperatureRange = z.enum(['2-4°C', 'frozen', 'ambient']);
export const OrderStatus = z.enum(['pending', 'confirmed', 'picking', 'picked', 'out_for_delivery', 'delivered', 'cancelled']);
export const OrderType = z.enum(['household', 'b2b']);
export const SlaStatus = z.enum(['on_time', 'late', 'failed']);
export const PaymentMethod = z.enum(['card', 'cash', 'credit', 'eft']);
export const PaymentStatus = z.enum(['pending', 'paid', 'failed', 'refunded']);
export const PurchaseOrderStatus = z.enum(['draft', 'sent', 'confirmed', 'delivered', 'cancelled']);
export const PurchaseOrderType = z.enum(['scheduled', 'recurring', 'one_time']);
export const PaymentTerms = z.enum(['net_30', 'net_15', 'cod', 'prepaid']);
export const DeliveryStatus = z.enum(['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed']);










