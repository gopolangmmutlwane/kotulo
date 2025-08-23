# Overview

FarmFresh SA is a marketplace platform connecting South African farmers directly with consumers for fresh produce. The application allows users to browse and purchase fresh vegetables, quality meat, and dairy products from verified local farmers. The platform features farmer profiles, product catalogs with categories, shopping cart functionality, and an order management system.

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
- **Schema Design**: Relational schema with tables for farmers, products, users, and orders
- **Migrations**: Drizzle-kit for database schema migrations and version control
- **Current Implementation**: In-memory storage for development with seeded sample data
- **Production Ready**: PostgreSQL configuration via Neon Database serverless connection

## External Dependencies
- **Database**: Neon Database (PostgreSQL) for production data persistence
- **UI Framework**: Radix UI for accessible component primitives
- **Form Handling**: React Hook Form with Zod for validation and type safety
- **Payment Processing**: Placeholder implementation ready for integration (no active payment provider)
- **Image Hosting**: Placeholder URLs using external services for product and farmer images
- **Fonts**: Google Fonts integration for typography (Architects Daughter, DM Sans, Fira Code, Geist Mono)
- **Development**: Replit-specific plugins for runtime error handling and development environment integration