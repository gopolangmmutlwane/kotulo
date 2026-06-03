import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import multer from "multer";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    fieldSize: 10 * 1024 * 1024, // 10MB limit for form fields
  },
  dest: 'uploads/' // Temporary storage location
});

// Increase body size limits for regular JSON and form data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Export upload middleware for use in routes
export { upload };

// Session configuration
const PgSession = connectPgSimple(session);
app.use(
  session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      tableName: "session",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "kotulo-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

// Platform configuration middleware (will be set by registerRoutes)
const checkPlatformSettings = (req: Request, res: Response, next: NextFunction) => {
  // Get platform config from global scope
  const platformConfig = (global as any).platformConfig;
  
  // Only check if platform config is available
  if (platformConfig && platformConfig.general) {
    // Check maintenance mode (except for admin routes and login)
    if (platformConfig.general.maintenanceMode && 
        !req.path.startsWith('/api/admin') && 
        !req.path.startsWith('/api/auth/login')) {
      return res.status(503).json({ 
        message: "Platform is currently under maintenance. Please try again later.",
        maintenanceMode: true
      });
    }
  }
  next();
};

app.use(checkPlatformSettings);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

async function ensureAdminExists() {
  try {
    const { storage } = await import("./storage");
    const { hashPassword } = await import("./auth");
    const adminEmail = process.env.ADMIN_EMAIL || "gopolang@kotulo.co.za";
    const adminPassword = process.env.ADMIN_PASSWORD || "KotuloFarm@25";
    const adminName = process.env.ADMIN_NAME || "Kotulo";
    const existing = await storage.getUserByEmail(adminEmail);
    if (!existing) {
      const hashed = await hashPassword(adminPassword);
      await storage.createUser({
        email: adminEmail,
        name: adminName,
        password: hashed,
        role: "admin",
        isActive: true,
        emailVerified: true,
        approvalStatus: "approved",
      } as any);
      console.log("? Admin account created automatically");
    } else if (existing.role !== "admin") {
      await storage.updateUser(existing.id, { role: "admin" });
      console.log("? Admin role restored");
    } else {
      console.log("? Admin account OK");
    }
  } catch (err) {
    console.error("? Admin setup error:", err);
  }
}

(async () => {
  await ensureAdminExists();
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Serve the app on the port specified in the environment variable PORT
  // Default to 5000 if not specified.
  // This serves both the API and the client.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
