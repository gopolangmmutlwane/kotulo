import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, insertUserSchema, insertFarmerSchema, insertProductSchema, ProductCategory, UserRole, OrderStatus } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // === USERS ===
  // Get all users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get user by id
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Create user
  app.post("/api/users", async (req, res) => {
    try {
      const validation = insertUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid user data",
          errors: validation.error.issues 
        });
      }

      const user = await storage.createUser(validation.data);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // === SERVICE AREAS ===
  // Get all service areas
  app.get("/api/service-areas", async (req, res) => {
    try {
      const serviceAreas = await storage.getServiceAreas();
      res.json(serviceAreas);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch service areas" });
    }
  });

  // Get service area by id
  app.get("/api/service-areas/:id", async (req, res) => {
    try {
      const serviceArea = await storage.getServiceArea(req.params.id);
      if (!serviceArea) {
        return res.status(404).json({ message: "Service area not found" });
      }
      res.json(serviceArea);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch service area" });
    }
  });

  // === HUBS ===
  // Get all hubs
  app.get("/api/hubs", async (req, res) => {
    try {
      const hubs = await storage.getHubs();
      res.json(hubs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hubs" });
    }
  });

  // Get hub by id
  app.get("/api/hubs/:id", async (req, res) => {
    try {
      const hub = await storage.getHub(req.params.id);
      if (!hub) {
        return res.status(404).json({ message: "Hub not found" });
      }
      res.json(hub);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hub" });
    }
  });

  // === FARMERS ===
  // Get all farmers
  app.get("/api/farmers", async (req, res) => {
    try {
      const farmers = await storage.getFarmers();
      res.json(farmers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch farmers" });
    }
  });

  // Get farmer by id
  app.get("/api/farmers/:id", async (req, res) => {
    try {
      const farmer = await storage.getFarmer(req.params.id);
      if (!farmer) {
        return res.status(404).json({ message: "Farmer not found" });
      }
      res.json(farmer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch farmer" });
    }
  });

  // Create farmer
  app.post("/api/farmers", async (req, res) => {
    try {
      const validation = insertFarmerSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid farmer data",
          errors: validation.error.issues 
        });
      }

      const farmer = await storage.createFarmer(validation.data);
      res.status(201).json(farmer);
    } catch (error) {
      res.status(500).json({ message: "Failed to create farmer" });
    }
  });

  // Get all products with optional category and farmerId filters
  app.get("/api/products", async (req, res) => {
    try {
      const { category, farmerId } = req.query;
      
      // Validate category if provided
      if (category && !ProductCategory.safeParse(category).success) {
        return res.status(400).json({ message: "Invalid category" });
      }

      const products = await storage.getProducts(
        category as string,
        farmerId as string
      );
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Get featured products
  app.get("/api/products/featured", async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured products" });
    }
  });

  // Get product by id
  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Create product
  app.post("/api/products", async (req, res) => {
    try {
      const validation = insertProductSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid product data",
          errors: validation.error.issues 
        });
      }

      const product = await storage.createProduct(validation.data);
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // Create order
  app.post("/api/orders", async (req, res) => {
    try {
      const validation = insertOrderSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid order data",
          errors: validation.error.issues 
        });
      }

      const order = await storage.createOrder(validation.data);
      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Get order by id
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
