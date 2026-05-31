import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import type { Request, Response, NextFunction } from "express";

// Extend Express Session
declare module "express-session" {
  interface SessionData {
    userId?: string;
    emailVerified?: boolean;
  }
}

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate random token for email verification and password reset
export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

// Middleware to check if user is authenticated
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

// Middleware to check if user is verified
export function requireVerified(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  if (!req.session?.emailVerified) {
    return res.status(403).json({ message: "Email verification required" });
  }
  next();
}

// Middleware to check if user has specific role
export function requireRole(allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Import storage here to avoid circular dependency
    const { storage } = await import("./storage");
    const user = await storage.getUser(req.session.userId);
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    next();
  };
}

// Middleware to check if vendor/farmer is approved
export function requireApproved(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  // This will be checked in the route handler after fetching user
  next();
}

