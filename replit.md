# ID Card Generator System

## Overview

This is a full-stack web application for generating and managing student ID cards. The system provides a comprehensive solution for educational institutions to create, customize, and print professional ID cards. It features a React frontend with a modern UI, an Express.js backend API, and PostgreSQL database integration using Drizzle ORM.

The application includes student management, template customization, card design tools, and print queue management with support for bulk operations and Excel imports.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack React Query for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API with CRUD operations
- **File Upload**: Multer for handling image and Excel file uploads
- **Session Management**: Express sessions with PostgreSQL store
- **Error Handling**: Centralized error handling middleware
- **Development**: Hot module replacement with Vite integration

### Database Layer
- **Database**: PostgreSQL with connection pooling
- **ORM**: Drizzle ORM for type-safe database operations
- **Connection**: Neon serverless PostgreSQL adapter with WebSocket support
- **Schema**: Structured tables for students, templates, print jobs, and settings
- **Migrations**: Drizzle Kit for database schema management

### Core Data Models
- **Students**: Complete student profiles with personal information, photos, and academic details
- **Templates**: Customizable ID card templates with JSON-based design configurations
- **Print Jobs**: Queue system for managing card printing with status tracking
- **Settings**: Application configuration and preferences

### Design System
- **Components**: Modular shadcn/ui components with consistent styling
- **Theme**: CSS custom properties for easy theme customization
- **Typography**: Multiple font families (Inter, DM Sans, Fira Code, Geist Mono)
- **Icons**: Lucide React icon library
- **Responsive**: Mobile-first responsive design approach

### File Management
- **Photo Storage**: Local file system storage for student photos
- **Upload Processing**: Image validation and optimization
- **Excel Import**: CSV parsing for bulk student data import
- **PDF Generation**: jsPDF for generating printable ID cards

### Security & Validation
- **Input Validation**: Zod schemas for type-safe data validation
- **File Type Validation**: Strict file type checking for uploads
- **SQL Injection Protection**: Parameterized queries through Drizzle ORM
- **Type Safety**: End-to-end TypeScript for compile-time error prevention

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **WebSocket Support**: Real-time database connections via ws library

### UI & Design Libraries
- **Radix UI**: Accessible component primitives for complex UI components
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Lucide React**: Comprehensive icon library
- **Class Variance Authority**: Component variant management

### Development Tools
- **Replit Integration**: Custom Vite plugins for Replit development environment
- **TypeScript**: Static type checking across the entire stack
- **ESBuild**: Fast JavaScript bundling for production builds
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

### File Processing
- **Multer**: Multipart form data handling for file uploads
- **CSV Parse**: Excel and CSV file parsing for data import
- **jsPDF**: Client-side PDF generation for ID cards
- **UUID**: Unique identifier generation for database records

### Runtime & Utilities
- **Date-fns**: Date manipulation and formatting utilities
- **CLSX & Tailwind Merge**: Conditional CSS class composition
- **React Hook Form**: Performant form state management
- **TanStack React Query**: Server state synchronization and caching