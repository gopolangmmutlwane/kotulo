import { type Farmer, type InsertFarmer, type Product, type InsertProduct, type Order, type InsertOrder, type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Farmers
  getFarmers(): Promise<Farmer[]>;
  getFarmer(id: string): Promise<Farmer | undefined>;
  createFarmer(farmer: InsertFarmer): Promise<Farmer>;
  
  // Products
  getProducts(category?: string, farmerId?: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getFeaturedProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
}

export class MemStorage implements IStorage {
  private farmers: Map<string, Farmer>;
  private products: Map<string, Product>;
  private users: Map<string, User>;
  private orders: Map<string, Order>;

  constructor() {
    this.farmers = new Map();
    this.products = new Map();
    this.users = new Map();
    this.orders = new Map();
    
    // Seed with sample data
    this.seedData();
  }

  private seedData() {
    // Sample farmers
    const farmer1: Farmer = {
      id: "farmer-1",
      name: "Thabo Mthembu",
      email: "thabo@organicfarm.co.za",
      phone: "+27 82 123 4567",
      location: "Johannesburg",
      province: "Gauteng",
      description: "Organic vegetable farming for over 15 years",
      farmType: "Organic Vegetable Farm",
      rating: "4.8",
      reviewCount: 124,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      verified: 1,
      createdAt: new Date(),
    };

    const farmer2: Farmer = {
      id: "farmer-2",
      name: "Sarah van der Merwe",
      email: "sarah@stellenbosch-dairy.co.za",
      phone: "+27 84 987 6543",
      location: "Stellenbosch",
      province: "Western Cape",
      description: "Family-owned dairy and livestock farm",
      farmType: "Dairy & Livestock Farm",
      rating: "4.9",
      reviewCount: 89,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      verified: 1,
      createdAt: new Date(),
    };

    const farmer3: Farmer = {
      id: "farmer-3",
      name: "Pieter Botha",
      email: "pieter@freestatefarm.co.za",
      phone: "+27 83 456 7890",
      location: "Bloemfontein",
      province: "Free State",
      description: "Mixed farming with vegetables and livestock",
      farmType: "Mixed Farming",
      rating: "4.6",
      reviewCount: 67,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      verified: 1,
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
        price: "25.00",
        unit: "kg",
        stock: 50,
        image: "https://images.unsplash.com/photo-1546470427-e26264cd4d9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        featured: 1,
        organic: 1,
        createdAt: new Date(),
      },
      {
        id: "product-2",
        farmerId: "farmer2",
        name: "Grass-Fed Beef",
        description: "Premium grass-fed beef cuts from our pasture-raised cattle",
        category: "meat",
        price: "180.00",
        unit: "kg",
        stock: 20,
        image: "https://images.unsplash.com/photo-1615962830150-bd3b5bc09ad4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        featured: 1,
        organic: 0,
        createdAt: new Date(),
      },
      {
        id: "product-3",
        farmerId: "farmer-2",
        name: "Farm Fresh Milk",
        description: "Raw milk from our grass-fed cows, delivered daily",
        category: "dairy",
        price: "18.00",
        unit: "L",
        stock: 100,
        image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        featured: 1,
        organic: 1,
        createdAt: new Date(),
      },
      {
        id: "product-4",
        farmerId: "farmer-3",
        name: "Mixed Vegetables Box",
        description: "Seasonal mix of fresh vegetables including peppers, cabbage, and carrots",
        category: "vegetables",
        price: "35.00",
        unit: "box",
        stock: 30,
        image: "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        featured: 1,
        organic: 0,
        createdAt: new Date(),
      },
      {
        id: "product-5",
        farmerId: "farmer-1",
        name: "Organic Spinach",
        description: "Fresh organic spinach leaves, rich in nutrients",
        category: "vegetables",
        price: "15.00",
        unit: "kg",
        stock: 40,
        image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        featured: 0,
        organic: 1,
        createdAt: new Date(),
      },
      {
        id: "product-6",
        farmerId: "farmer-2",
        name: "Fresh Cheese",
        description: "Artisanal cheese made from our farm's milk",
        category: "dairy",
        price: "45.00",
        unit: "kg",
        stock: 25,
        image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        featured: 0,
        organic: 1,
        createdAt: new Date(),
      },
    ];

    products.forEach(product => this.products.set(product.id, product));
  }

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
      rating: "0",
      reviewCount: 0,
      verified: 0,
      createdAt: new Date(),
      description: insertFarmer.description || null,
      phone: insertFarmer.phone || null,
      avatar: insertFarmer.avatar || null,
    };
    this.farmers.set(id, farmer);
    return farmer;
  }

  async getProducts(category?: string, farmerId?: string): Promise<Product[]> {
    let products = Array.from(this.products.values());
    
    if (category) {
      products = products.filter(p => p.category === category);
    }
    
    if (farmerId) {
      products = products.filter(p => p.farmerId === farmerId);
    }
    
    return products;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.featured === 1);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      ...insertProduct,
      id,
      createdAt: new Date(),
      description: insertProduct.description || null,
      image: insertProduct.image || null,
      stock: insertProduct.stock || null,
      featured: insertProduct.featured || null,
      organic: insertProduct.organic || null,
    };
    this.products.set(id, product);
    return product;
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
      createdAt: new Date(),
      phone: insertUser.phone || null,
      address: insertUser.address || null,
    };
    this.users.set(id, user);
    return user;
  }

  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = {
      ...insertOrder,
      id,
      status: "pending",
      createdAt: new Date(),
      userId: insertOrder.userId || null,
      customerPhone: insertOrder.customerPhone || null,
    };
    this.orders.set(id, order);
    return order;
  }
}

export const storage = new MemStorage();
