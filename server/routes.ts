import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import os from "os";
import { v2 as cloudinary } from "cloudinary";
import { storage } from "./storage";
import { insertOrderSchema, insertUserSchema, insertFarmerSchema, insertProductSchema, ProductCategory, UserRole, OrderStatus } from "@shared/schema";
import { z } from "zod";
import { hashPassword, comparePassword, generateToken, requireAuth } from "./auth";


export async function registerRoutes(app: Express): Promise<Server> {
  // === FILE UPLOAD CONFIGURATION ===
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Configure multer for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    }
  });

  // === FILE UPLOAD ROUTES ===
  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Upload single image
  app.post("/api/upload/image", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "kotulo/products", resource_type: "image" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.file!.buffer);
      }) as any;

      res.json({ 
        message: "File uploaded successfully",
        filePath: result.secure_url,
        filename: result.public_id
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Serve uploaded files statically
  app.use('/uploads', express.static(uploadsDir));

  // === PLATFORM CONFIGURATION ===
  // In-memory storage for platform settings (in production, use database)
  let platformConfig = {
    general: {
      platformName: "Kotulo",
      platformVersion: "2.0.1",
      maintenanceMode: false,
      allowRegistration: true,
      requireEmailVerification: true,
      defaultUserRole: "household"
    },
    payment: {
      enablePayments: true,
      paymentGateway: "stripe",
      currency: "ZAR",
      minimumOrderAmount: 100,
      maximumOrderAmount: 50000,
      commissionRate: 5,
      paymentMethods: ["credit_card", "debit_card", "bank_transfer", "cash_on_delivery"]
    },
    shipping: {
      enableShipping: true,
      freeShippingThreshold: 1000,
      defaultShippingCost: 50,
      shippingZones: ["gauteng", "western_cape", "kwazulu_natal", "mpumalanga"],
      deliveryTime: "2-3 business days",
      enableExpressDelivery: true,
      expressDeliveryCost: 100
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      orderConfirmationEmail: true,
      shippingUpdateEmail: true,
      promotionalEmails: false,
      adminAlerts: true
    },
    security: {
      enableTwoFactor: false,
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireStrongPassword: true,
      enableCaptcha: true,
      logFailedAttempts: true
    },
    marketplace: {
      enableReviews: true,
      requireApproval: true,
      allowMultipleImages: true,
      maxImagesPerProduct: 5,
      enableWishlist: true,
      enableCompare: false,
      enableChat: true
    },
    ui: {
      theme: "light",
      primaryColor: "#10b981",
      accentColor: "#3b82f6",
      logoUrl: "",
      faviconUrl: "",
      customCSS: "",
      showBranding: true,
      compactMode: false,
      showAnimations: true
    },
    business: {
      businessName: "Kotulo",
      businessEmail: "support@kotulo.co.za",
      businessPhone: "+27 12 345 6789",
      businessAddress: "123 Farm Street, Johannesburg, South Africa",
      taxNumber: "ZA123456789",
      vatRate: 15,
      businessHours: "Mon-Fri: 8AM-6PM, Sat: 8AM-2PM",
      timeZone: "Africa/Johannesburg"
    },
    integrations: {
      enableGoogleAnalytics: false,
      googleAnalyticsId: "",
      enableFacebookPixel: false,
      facebookPixelId: "",
      enableEmailService: true,
      emailServiceProvider: "sendgrid",
      enableSMSService: false,
      smsProvider: "twilio",
      enablePaymentWebhooks: false,
      webhookUrl: ""
    },
    advanced: {
      enableDebugMode: false,
      enableAPILogging: false,
      enablePerformanceMonitoring: true,
      enableErrorTracking: true,
      enableBackupAutomation: true,
      backupFrequency: "daily",
      enableCDN: false,
      cdnUrl: "",
      enableCaching: true,
      cacheTimeout: 3600
    }
  };

  // Set platform config in global scope for middleware access
  (global as any).platformConfig = platformConfig;

  // === PLATFORM CONFIGURATION API ===
  // Get platform configuration
  app.get("/api/platform/config", async (req, res) => {
    try {
      res.json(platformConfig);
    } catch (error) {
      console.error("Get platform config error:", error);
      res.status(500).json({ message: "Failed to fetch platform configuration" });
    }
  });

  // Save platform configuration (admin only)
  app.post("/api/platform/config", requireAuth, async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Check if requester is admin
      const adminUser = await storage.getUser(userId);
      if (!adminUser || adminUser.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const config = req.body;
      
      if (!config || typeof config !== 'object') {
        return res.status(400).json({ message: "Invalid configuration data" });
      }

      // Deep merge: only update the sections that are provided
      platformConfig = {
        ...platformConfig,
        ...(config.general && { general: { ...platformConfig.general, ...config.general } }),
        ...(config.payment && { payment: { ...platformConfig.payment, ...config.payment } }),
        ...(config.shipping && { shipping: { ...platformConfig.shipping, ...config.shipping } }),
        ...(config.notifications && { notifications: { ...platformConfig.notifications, ...config.notifications } }),
        ...(config.security && { security: { ...platformConfig.security, ...config.security } }),
        ...(config.marketplace && { marketplace: { ...platformConfig.marketplace, ...config.marketplace } }),
        ...(config.ui && { ui: { ...platformConfig.ui, ...config.ui } }),
        ...(config.business && { business: { ...platformConfig.business, ...config.business } }),
        ...(config.integrations && { integrations: { ...platformConfig.integrations, ...config.integrations } }),
        ...(config.advanced && { advanced: { ...platformConfig.advanced, ...config.advanced } }),
      };
      
      // Also update global config for middleware access
      (global as any).platformConfig = platformConfig;
      
      console.log("Platform configuration updated:", platformConfig);
      
      res.json({ 
        message: "Platform configuration saved successfully",
        config: platformConfig
      });
    } catch (error) {
      console.error("Save platform config error:", error);
      res.status(500).json({ message: "Failed to save platform configuration" });
    }
  });

  // === AUTHENTICATION ===
  // Signup
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, name, phone, role, businessName } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ message: "Email, password, and name are required" });
      }

      // Check if registration is allowed
      if (!platformConfig.general.allowRegistration) {
        return res.status(403).json({ 
          message: "User registration is currently disabled. Please contact support.",
          registrationDisabled: true
        });
      }

      if (password.length < platformConfig.security.passwordMinLength) {
        return res.status(400).json({ 
          message: `Password must be at least ${platformConfig.security.passwordMinLength} characters` 
        });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // Validate role
      const validRoles = ["household", "b2b", "vendor", "farmer", "operations", "admin"];
      const userRole = role || platformConfig.general.defaultUserRole;
      
      if (!validRoles.includes(userRole)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Generate email verification token
      const emailVerificationToken = generateToken();

      // Create user
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        name,
        phone: phone || null,
        role: userRole,
        businessName: businessName || null,
        businessType: userRole === "farmer" ? "farm" : userRole === "vendor" ? "vendor" : userRole === "b2b" ? "b2b" : null,
        approvalStatus: (userRole === "farmer" || userRole === "vendor" || userRole === "b2b") ? "pending" : "approved",
        emailVerified: !platformConfig.general.requireEmailVerification, // Auto-verify if not required
      });

      // TODO: Send verification email (in production, use a service like SendGrid, AWS SES, etc.)
      // For now, we'll just return the token in development
      const { password: _, ...userWithoutPassword } = user;
      
      let message = "Account created successfully. Please check your email to verify your account.";
      if (platformConfig.general.requireEmailVerification) {
        message = "Account created successfully! Please check your email to verify your account.";
      } else {
        message = "Account created successfully! Your account is ready to use.";
      }
      
      res.status(201).json({
        user: userWithoutPassword,
        message,
        needsApproval: false,
        // Only return token in development
        ...(process.env.NODE_ENV === "development" && { verificationToken: emailVerificationToken }),
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      if (!user.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      if (!user.isActive) {
        return res.status(403).json({ message: "Account is deactivated" });
      }

      // Check if email verification is required and user is not verified
      if (platformConfig.general.requireEmailVerification && !user.emailVerified) {
        return res.status(403).json({ 
          message: "Please verify your email address before logging in. Check your inbox for the verification email.",
          requiresEmailVerification: true
        });
      }

      // Update last login
      await storage.updateUser(user.id, { lastLogin: new Date() });

      // Set session
      req.session!.userId = user.id;
      req.session!.emailVerified = user.emailVerified || false;

      const { password: _, ...userWithoutPassword } = user;
      res.json({
        user: userWithoutPassword,
        message: "Login successful"
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  // Get current user
  app.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({ message: "Failed to get current user" });
    }
  });

  // Verify email
  app.post("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ message: "Verification token is required" });
      }

      const users = await storage.getUsers();
      const user = users.find((u: any) => u.emailVerificationToken === token);
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired verification token" });
      }

      await storage.updateUser(user.id, {
        emailVerified: true,
      });

      res.json({ message: "Email verified successfully" });
    } catch (error) {
      console.error("Verify email error:", error);
      res.status(500).json({ message: "Failed to verify email" });
    }
  });

  // Forgot password
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists
        return res.json({ message: "If the email exists, a reset link has been sent" });
      }

      const resetToken = generateToken();
      const resetExpires = new Date(Date.now() + 3600000); // 1 hour

      await storage.updateUser(user.id, {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      } as any);

      // In production, send email. For dev, return token.
      res.json({
        message: "Password reset email sent",
        ...(process.env.NODE_ENV === "development" && { resetToken }),
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process password reset" });
    }
  });

  // Reset password
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }

      if (newPassword.length < platformConfig.security.passwordMinLength) {
        return res.status(400).json({
          message: `Password must be at least ${platformConfig.security.passwordMinLength} characters`,
        });
      }

      const users = await storage.getUsers();
      const user = users.find(
        (u: any) => u.passwordResetToken === token && u.passwordResetExpires && new Date(u.passwordResetExpires) > new Date()
      );

      if (!user) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(user.id, {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      } as any);

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session?.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // === USERS ===
  // Get all users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      const sanitized = users.map(({ password: _, ...u }) => u);
      res.json(sanitized);
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
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
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

  // Update user
  app.patch("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Toggle user active status
  app.patch("/api/users/:id/toggle-status", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const updated = await storage.updateUser(req.params.id, { isActive: !user.isActive });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle user status" });
    }
  });

  // Approve user
  app.patch("/api/users/:id/approve", async (req, res) => {
    try {
      const updated = await storage.updateUser(req.params.id, { approvalStatus: "approved" });
      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to approve user" });
    }
  });

  // Suspend user
  app.patch("/api/users/:id/suspend", async (req, res) => {
    try {
      const updated = await storage.updateUser(req.params.id, { isActive: false });
      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to suspend user" });
    }
  });

  // Activate user
  app.patch("/api/users/:id/activate", async (req, res) => {
    try {
      const updated = await storage.updateUser(req.params.id, { isActive: true });
      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to activate user" });
    }
  });

  // Delete user
  app.delete("/api/users/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteUser(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Update user application info
  app.put("/api/user/application", requireAuth, async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { businessRegistrationNumber, taxId, businessAddress, businessDescription, documents } = req.body;

      const updated = await storage.updateUser(userId, {
        ...(businessRegistrationNumber && { businessRegistrationNumber }),
        ...(taxId && { taxId }),
        ...(businessAddress && { address: businessAddress }),
        ...(businessDescription && { businessDescription }),
        ...(documents && { applicationDocuments: documents }),
        approvalStatus: "pending",
      } as any);

      if (!updated) {
        return res.status(500).json({ message: "Failed to update application" });
      }

      const { password: _, ...userWithoutPassword } = updated;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update application error:", error);
      res.status(500).json({ message: "Failed to update application" });
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

      // Admin products approved immediately, others need review
      const userId = req.session?.userId;
      const currentUser = userId ? await storage.getUser(userId) : null;
      const isAdmin = !currentUser || currentUser?.role === "admin";
      const status = isAdmin ? "approved" : "pending";

      const product = await storage.createProduct({
        ...validation.data,
        farmerId: isAdmin ? null : validation.data.farmerId,
        status,
      } as any);
      res.status(201).json(product);
    } catch (error) {
      console.error("Create product error:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // Update product
  // Update product
  app.patch("/api/products/:id", async (req, res) => {
    try {
      // Remove fields that shouldn't be updated directly
      const { id, createdAt, farmerId, status, ...updates } = req.body;
      const product = await storage.updateProduct(req.params.id, updates);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Update product error:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  // Delete product
  app.delete("/api/products/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Get all orders
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
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

  // === SYSTEM HEALTH ROUTE ===
  app.get("/api/health", async (req, res) => {
    try {
      const uptimeSec = process.uptime();
      const days = Math.floor(uptimeSec / 86400);
      const hours = Math.floor((uptimeSec % 86400) / 3600);
      const mins = Math.floor((uptimeSec % 3600) / 60);
      const uptimeStr = days > 0
        ? `${days}d ${hours}h ${mins}m`
        : hours > 0
        ? `${hours}h ${mins}m`
        : `${mins}m`;

      const mem = process.memoryUsage();
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const memPercent = parseFloat(((usedMem / totalMem) * 100).toFixed(1));

      const cpus = os.cpus();
      const loadAvg = os.loadavg();

      // Derive per-CPU usage from idle/total ticks
      let cpuUsage = 0;
      if (cpus.length > 0) {
        const cpu = cpus[0];
        const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
        cpuUsage = total > 0 ? parseFloat((((total - cpu.times.idle) / total) * 100).toFixed(1)) : 0;
      }

      // Real DB record counts from storage
      const [users, products, orders] = await Promise.all([
        storage.getUsers(),
        storage.getProducts(),
        storage.getOrders(),
      ]);

      const startedAt = new Date(Date.now() - uptimeSec * 1000);

      res.json({
        server: {
          status: "healthy",
          uptime: uptimeStr,
          uptimeSeconds: Math.floor(uptimeSec),
          startedAt: startedAt.toISOString(),
          nodeVersion: process.version,
          platform: os.platform(),
        },
        memory: {
          usedMB: parseFloat((mem.heapUsed / 1024 / 1024).toFixed(1)),
          totalMB: parseFloat((mem.heapTotal / 1024 / 1024).toFixed(1)),
          rss: parseFloat((mem.rss / 1024 / 1024).toFixed(1)),
          systemUsedGB: parseFloat((usedMem / 1024 / 1024 / 1024).toFixed(2)),
          systemTotalGB: parseFloat((totalMem / 1024 / 1024 / 1024).toFixed(2)),
          systemFreeGB: parseFloat((freeMem / 1024 / 1024 / 1024).toFixed(2)),
          percentage: memPercent,
        },
        cpu: {
          usage: cpuUsage,
          cores: cpus.length,
          model: cpus[0]?.model || "Unknown",
          loadAverage: loadAvg.map(v => parseFloat(v.toFixed(2))),
        },
        database: {
          status: "healthy",
          type: "PostgreSQL (Neon)",
          users: users.length,
          products: products.length,
          orders: orders.length,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch system health" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
