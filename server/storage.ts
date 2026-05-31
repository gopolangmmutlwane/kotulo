import { type Farmer, type InsertFarmer, type Product, type InsertProduct, type Order, type InsertOrder, type User, type InsertUser, type ServiceArea, type Hub, type ProductLot, type PurchaseOrder, type Delivery } from "@shared/schema";
import { randomUUID } from "crypto";

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
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  
  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;

  // Platform Config
  getPlatformConfig(): Promise<Record<string, any>>;
  setPlatformConfig(config: Record<string, any>): Promise<Record<string, any>>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private serviceAreas: Map<string, ServiceArea>;
  private hubs: Map<string, Hub>;
  private farmers: Map<string, Farmer>;
  private products: Map<string, Product>;
  private orders: Map<string, Order>;
  private platformConfig: Record<string, any>;

  constructor() {
    this.users = new Map();
    this.serviceAreas = new Map();
    this.hubs = new Map();
    this.farmers = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.platformConfig = {};
    
    // Seed with sample data
    this.seedData();
  }

  private seedData() {
    // Sample service areas
    const joziArea: ServiceArea = {
      id: "area-1",
      name: "Johannesburg Central",
      geoPolygon: {
        type: "Polygon",
        coordinates: [[[-26.0, 28.0], [-26.0, 28.1], [-25.9, 28.1], [-25.9, 28.0], [-26.0, 28.0]]]
      },
      deliveryFee: "25.00",
      minOrderValue: "100.00",
      maxDeliveryTime: 60,
      isActive: true,
      createdAt: new Date(),
    };

    // Sample hub
    const hub1: Hub = {
      id: "hub-1",
      name: "Johannesburg Micro-Hub",
      address: "123 Fresh Market St, Johannesburg",
      latitude: -26.2041,
      longitude: 28.0473,
      capacity: 1000,
      currentLoad: 350,
      coldStorage: true,
      isActive: true,
      operatingHours: { open: "06:00", close: "22:00" },
      serviceAreaIds: ["area-1"],
      createdAt: new Date(),
    };

    this.serviceAreas.set(joziArea.id, joziArea);
    this.hubs.set(hub1.id, hub1);

    // Sample users
    const user1: User = {
      id: "user-1",
      email: "sophy@organicfarm.co.za",
      name: "Sophy Kgoahla",
      password: null,
      phone: "+27 71 377 1455",
      address: null,
      role: "farmer",
      businessName: "Sophy's Organic Farm",
      businessType: "farm",
      creditLimit: null,
      isActive: true,
      approvalStatus: "approved",
      businessRegistrationNumber: null,
      taxId: null,
      businessAddress: null,
      businessDescription: null,
      applicationDocuments: null,
      applicationSubmittedAt: null,
      emailVerified: true,
      emailVerificationToken: null,
      passwordResetToken: null,
      passwordResetExpires: null,
      lastLogin: null,
      createdAt: new Date(),
    };

    this.users.set(user1.id, user1);

    // Admin user - persists across server restarts
    // Password: KotuloFarm@25 (hashed with bcrypt)
    const adminUser: User = {
      id: "admin-1", // Fixed ID for consistency
      name: "Kotulo",
      email: "gopolang@kotulo.co.za",
      password: "$2b$10$LDCdE7sCSXfld8rBYT.YIuB4y63tykMq0NG8oVdR5KLG5cV8/Vbtu",
      phone: null,
      address: null,
      role: "admin",
      businessName: null,
      businessType: null,
      creditLimit: null,
      isActive: true,
      approvalStatus: "approved",
      businessRegistrationNumber: null,
      taxId: null,
      businessAddress: null,
      businessDescription: null,
      applicationDocuments: null,
      applicationSubmittedAt: null,
      emailVerified: true,
      emailVerificationToken: null,
      passwordResetToken: null,
      passwordResetExpires: null,
      lastLogin: null,
      createdAt: new Date(),
    };

    this.users.set(adminUser.id, adminUser);

    // Sample farmers
    const farmer1: Farmer = {
      id: "farmer-1",
      userId: "user-1",
      name: "Sophy Kgoahla",
      email: "sophy@organicfarm.co.za",
      phone: "+27 71 377 1455",
      location: "Marapyane",
      province: "Mpumalanga",
      description: "Organic vegetable and herb farming with a passion for fresh, sustainable produce",
      farmType: "Organic Vegetable & Herb Farm",
      rating: "4.8",
      reviewCount: 124,
      avatar: "/images/Sophy.jpeg",
      verified: true,
      consignToHub: false,
      selfFulfill: true,
      commissionRate: "10.00",
      adBudget: "500.00",
      createdAt: new Date(),
    };

    const farmer2: Farmer = {
      id: "farmer-2",
      userId: null,
      name: "Tefo Mmutlwane",
      email: "Tefo.mmutlwane@gmail.com",
      phone: "+27 78 2931034",
      location: "Nelspruit",
      province: "Mpumalanga",
      description: "Family-owned dairy and livestock farm",
      farmType: "Dairy & Livestock Farm",
      rating: "4.9",
      reviewCount: 89,
      avatar: "/images/tefo.jpeg",
      verified: true,
      consignToHub: true,
      selfFulfill: false,
      commissionRate: "8.00",
      adBudget: "200.00",
      createdAt: new Date(),
    };

    const farmer3: Farmer = {
      id: "farmer-3",
      userId: null,
      name: "Gopolang mmutlwane",
      email: "gopolang@farmharvest.coza",
      phone: "+27 66 230 5349",
      location: "Johannesburg",
      province: "Gauteng",
      description: "Hydroponic farming with vegetables and livestock",
      farmType: "Mixed Farming",
      rating: "4.6",
      reviewCount: 67,
      avatar: "/images/Gopolang.jpeg",
      verified: true,
      consignToHub: false,
      selfFulfill: true,
      commissionRate: "12.00",
      adBudget: "0.00",
      createdAt: new Date(),
    };

    this.farmers.set(farmer1.id, farmer1);
    this.farmers.set(farmer2.id, farmer2);
    this.farmers.set(farmer3.id, farmer3);

    // Sample products
    const products: Product[] = [
      {
        id: "product-1",
        farmerId: "farmer-1",
        name: "Organic Tomatoes",
        description: "Fresh organic tomatoes, perfect for salads and cooking",
        category: "vegetables",
        subcategory: "tomatoes",
        grade: "A",
        weight: "1kg",
        retailPrice: "25.00",
        wholesalePrice: "20.00",
        unit: "kg",
        minOrderQty: 1,
        maxOrderQty: 50,
        shelfLifeDays: 7,
        temperatureRange: "2-4°C",
        image: "https://images.unsplash.com/photo-1546470427-e26264cd4d9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        featured: true,
        organic: true,
        substitutes: [],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "product-2",
        farmerId: "farmer-2",
        name: "Grass-Fed Beef",
        description: "Premium grass-fed beef cuts from our pasture-raised cattle",
        category: "meat",
        subcategory: "beef",
        grade: "premium",
        weight: "500g",
        retailPrice: "180.00",
        wholesalePrice: "150.00",
        unit: "kg",
        minOrderQty: 1,
        maxOrderQty: 10,
        shelfLifeDays: 5,
        temperatureRange: "2-4°C",
        image: "https://images.unsplash.com/photo-1615962830150-bd3b5bc09ad4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        featured: true,
        organic: false,
        substitutes: [],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "product-3",
        farmerId: "farmer-2",
        name: "Farm Fresh Milk",
        description: "Raw milk from our grass-fed cows, delivered daily",
        category: "dairy",
        subcategory: "milk",
        grade: "A",
        weight: "1L",
        retailPrice: "18.00",
        wholesalePrice: "15.00",
        unit: "L",
        minOrderQty: 1,
        maxOrderQty: 20,
        shelfLifeDays: 3,
        temperatureRange: "2-4°C",
        image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        featured: true,
        organic: true,
        substitutes: [],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "product-4",
        farmerId: "farmer-3",
        name: "Mixed Vegetables Box",
        description: "Seasonal mix of fresh vegetables including peppers, cabbage, and carrots",
        category: "vegetables",
        subcategory: "mixed",
        grade: "A",
        weight: "2kg",
        retailPrice: "35.00",
        wholesalePrice: "28.00",
        unit: "box",
        minOrderQty: 1,
        maxOrderQty: 20,
        shelfLifeDays: 5,
        temperatureRange: "2-4°C",
        image: "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        featured: true,
        organic: false,
        substitutes: [],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "product-5",
        farmerId: "farmer-1",
        name: "Organic Spinach",
        description: "Fresh organic spinach leaves, rich in nutrients",
        category: "vegetables",
        subcategory: "leafy_greens",
        grade: "A",
        weight: "500g",
        retailPrice: "15.00",
        wholesalePrice: "12.00",
        unit: "kg",
        minOrderQty: 1,
        maxOrderQty: 30,
        shelfLifeDays: 3,
        temperatureRange: "2-4°C",
        image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        featured: false,
        organic: true,
        substitutes: [],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "product-6",
        farmerId: "farmer-2",
        name: "Fresh Cheese",
        description: "Artisanal cheese made from our farm's milk",
        category: "dairy",
        subcategory: "cheese",
        grade: "premium",
        weight: "250g",
        retailPrice: "45.00",
        wholesalePrice: "38.00",
        unit: "kg",
        minOrderQty: 1,
        maxOrderQty: 15,
        shelfLifeDays: 14,
        temperatureRange: "2-4°C",
        image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        featured: false,
        organic: true,
        substitutes: [],
        isActive: true,
        createdAt: new Date(),
      },
    ];

    products.forEach(product => this.products.set(product.id, product));
  }

  // Users
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      password: insertUser.password ?? null,
      phone: insertUser.phone ?? null,
      address: insertUser.address ?? null,
      role: insertUser.role ?? "household",
      businessName: insertUser.businessName ?? null,
      businessType: insertUser.businessType ?? null,
      creditLimit: insertUser.creditLimit ?? null,
      isActive: insertUser.isActive ?? true,
      approvalStatus: (insertUser as any).approvalStatus ?? "approved",
      businessRegistrationNumber: (insertUser as any).businessRegistrationNumber ?? null,
      taxId: (insertUser as any).taxId ?? null,
      businessAddress: (insertUser as any).businessAddress ?? null,
      businessDescription: (insertUser as any).businessDescription ?? null,
      applicationDocuments: (insertUser as any).applicationDocuments ?? null,
      applicationSubmittedAt: (insertUser as any).applicationSubmittedAt ?? null,
      emailVerified: (insertUser as any).emailVerified ?? false,
      emailVerificationToken: (insertUser as any).emailVerificationToken ?? null,
      passwordResetToken: (insertUser as any).passwordResetToken ?? null,
      passwordResetExpires: (insertUser as any).passwordResetExpires ?? null,
      lastLogin: null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) {
      return undefined;
    }
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  // Service Areas
  async getServiceAreas(): Promise<ServiceArea[]> {
    return Array.from(this.serviceAreas.values());
  }

  async getServiceArea(id: string): Promise<ServiceArea | undefined> {
    return this.serviceAreas.get(id);
  }

  // Hubs
  async getHubs(): Promise<Hub[]> {
    return Array.from(this.hubs.values());
  }

  async getHub(id: string): Promise<Hub | undefined> {
    return this.hubs.get(id);
  }

  // Farmers
  async getFarmers(): Promise<Farmer[]> {
    return Array.from(this.farmers.values());
  }

  async getFarmer(id: string): Promise<Farmer | undefined> {
    return this.farmers.get(id);
  }

  async createFarmer(insertFarmer: InsertFarmer): Promise<Farmer> {
    const id = randomUUID();
    const farmer: Farmer = {
      ...insertFarmer,
      id,
      userId: insertFarmer.userId ?? null,
      phone: insertFarmer.phone ?? null,
      description: insertFarmer.description ?? null,
      avatar: insertFarmer.avatar ?? null,
      rating: "0",
      reviewCount: 0,
      verified: insertFarmer.verified ?? false,
      consignToHub: insertFarmer.consignToHub ?? false,
      selfFulfill: insertFarmer.selfFulfill ?? true,
      commissionRate: insertFarmer.commissionRate ?? "10.00",
      adBudget: insertFarmer.adBudget ?? "0.00",
      createdAt: new Date(),
    };
    this.farmers.set(id, farmer);
    return farmer;
  }

  // Products
  async getProducts(category?: string, farmerId?: string): Promise<Product[]> {
    let products = Array.from(this.products.values()).filter(p => p.isActive === true);
    
    if (category) {
      products = products.filter(p => p.category === category);
    }
    
    if (farmerId) {
      products = products.filter(p => p.farmerId === farmerId);
    }
    
    return products;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const product = this.products.get(id);
    return product?.isActive ? product : undefined;
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.featured === true && p.isActive === true);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      ...insertProduct,
      id,
      description: insertProduct.description ?? null,
      subcategory: insertProduct.subcategory ?? null,
      grade: insertProduct.grade ?? null,
      weight: insertProduct.weight ?? null,
      wholesalePrice: insertProduct.wholesalePrice ?? null,
      minOrderQty: insertProduct.minOrderQty ?? null,
      maxOrderQty: insertProduct.maxOrderQty ?? null,
      shelfLifeDays: insertProduct.shelfLifeDays ?? null,
      temperatureRange: insertProduct.temperatureRange ?? null,
      image: insertProduct.image ?? null,
      isActive: insertProduct.isActive ?? true,
      featured: insertProduct.featured ?? false,
      organic: insertProduct.organic ?? false,
      substitutes: insertProduct.substitutes ?? [],
      createdAt: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) {
      return undefined;
    }
    const updatedProduct = { ...product, ...updates };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  // Platform Config
  async getPlatformConfig(): Promise<Record<string, any>> {
    return { ...this.platformConfig };
  }

  async setPlatformConfig(config: Record<string, any>): Promise<Record<string, any>> {
    this.platformConfig = { ...this.platformConfig, ...config };
    return { ...this.platformConfig };
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = {
      ...insertOrder,
      id,
      userId: insertOrder.userId ?? null,
      type: insertOrder.type ?? "household",
      customerPhone: insertOrder.customerPhone ?? null,
      deliveryLatitude: insertOrder.deliveryLatitude ?? null,
      deliveryLongitude: insertOrder.deliveryLongitude ?? null,
      serviceAreaId: insertOrder.serviceAreaId ?? null,
      hubId: insertOrder.hubId ?? null,
      deliveryFee: insertOrder.deliveryFee ?? null,
      deliveryTimeSlot: insertOrder.deliveryTimeSlot ?? null,
      promisedDelivery: insertOrder.promisedDelivery ?? null,
      actualDelivery: insertOrder.actualDelivery ?? null,
      paymentMethod: insertOrder.paymentMethod ?? null,
      specialInstructions: insertOrder.specialInstructions ?? null,
      subtotal: insertOrder.subtotal || insertOrder.total,
      status: "pending",
      slaStatus: "on_time",
      paymentStatus: "pending",
      createdAt: new Date(),
    };
    this.orders.set(id, order);
    return order;
  }
}

import { DbStorage } from './db-storage';
export const storage = new DbStorage();
