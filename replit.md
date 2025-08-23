# Overview

FarmFresh SA is a comprehensive South African farm-to-door marketplace platform that supports multiple user roles (Household Shoppers, B2B Buyers, Vendors/Farmers, Operations, Admin) with 60-minute delivery SLA capabilities. The platform features advanced B2B bulk ordering with invoicing, vendor marketplace functionality, real-time inventory management through product lots, micro-fulfillment hubs, cold-chain logistics capabilities, and geo-fenced service areas. The application is fully PWA-enabled and specifically designed for the South African market with multi-role user management and enterprise-grade logistics features.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with pages for home, products, farmer profiles, and checkout
- **State Management**: React Context API for cart management and TanStack Query for server state
- **UI Components**: Radix UI primitives with shadcn/ui components for consistent design system
- **Styling**: Tailwind CSS with custom CSS variables for theming, including farm-specific color palette
- **PWA Support**: Service worker implementation with manifest.json for progressive web app functionality

## Backend Architecture
- **Server**: Express.js with TypeScript running in development and production modes
- **API Design**: RESTful endpoints following convention `/api/{resource}` pattern
- **Route Structure**: Centralized route registration in `server/routes.ts` with modular organization
- **Storage Layer**: Abstracted storage interface (`IStorage`) with in-memory implementation for development
- **Error Handling**: Centralized error middleware with consistent JSON error responses
- **Development Tools**: Hot module replacement via Vite integration for seamless development experience

## Data Storage Solutions
- **Database ORM**: Drizzle ORM configured for PostgreSQL with type-safe schema definitions
- **Enhanced Schema**: Comprehensive relational schema supporting:
  - Multi-role user system (household, B2B, vendor, operations, admin)
  - Service areas with geo-fencing for delivery zones
  - Micro-fulfillment hubs with capacity and location tracking
  - Enhanced farmer profiles with commission rates and fulfillment preferences
  - Advanced product catalog with lots, variants, grades, and inventory tracking
  - B2B purchase orders with recurring schedules and payment terms
  - Delivery tracking with real-time location and cold-chain monitoring
  - SLA tracking and performance metrics
- **Current Implementation**: In-memory storage with comprehensive seed data
- **Production Ready**: PostgreSQL configuration via Neon Database serverless connection

## External Dependencies
- **Database**: Neon Database (PostgreSQL) for production data persistence
- **UI Framework**: Radix UI for accessible component primitives
- **Form Handling**: React Hook Form with Zod for validation and type safety
- **Payment Processing**: Placeholder implementation ready for integration (no active payment provider)
- **Image Hosting**: Placeholder URLs using external services for product and farmer images
- **Fonts**: Google Fonts integration for typography (Architects Daughter, DM Sans, Fira Code, Geist Mono)
- **Development**: Replit-specific plugins for runtime error handling and development environment integration