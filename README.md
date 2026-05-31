# Kotulo - Farm-to-Door Marketplace

A comprehensive South African farm-to-door marketplace platform built with React, TypeScript, Express, and Vite.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

### Running the Development Server

**Important:** Do NOT use VS Code's "Go Live" button. This app requires a Node.js server to run.

To start the development server:

```bash
npm run dev
```

The server will start on **http://localhost:5000**

Open your browser and navigate to: `http://localhost:5000`

### Available Scripts

- `npm run dev` - Start the development server (Express + Vite)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Type check with TypeScript

### Why "Go Live" Doesn't Work

VS Code's "Go Live" (Live Server extension) is just a simple file server that:
- ❌ Cannot run Node.js/Express backend
- ❌ Cannot compile TypeScript/React
- ❌ Cannot handle API routes
- ❌ Cannot provide hot module replacement

This application requires a full Node.js development server that:
- ✅ Runs the Express backend
- ✅ Compiles and serves React with Vite
- ✅ Handles API routes (`/api/*`)
- ✅ Provides hot reloading

### Port Configuration

The app runs on port **5000** by default. You can change this by setting the `PORT` environment variable:

```bash
PORT=3000 npm run dev
```

## Project Structure

```
FarmHarvest/
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared TypeScript types
└── dist/            # Production build output
```

## Troubleshooting

If you see a directory listing instead of the app:
- Make sure you're accessing `http://localhost:5000` (not 5500)
- Ensure `npm run dev` is running in the terminal
- Check that no errors appear in the terminal output

