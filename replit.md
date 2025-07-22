# Church Memory Verse App

## Overview

This is a React-based mobile web application designed for church memory verse management. It's built with a modern TypeScript stack using React, Express, and Drizzle ORM, designed specifically for mobile devices with a focus on Korean church communities. The app allows users to view weekly memory verses for different age groups, upload Excel files containing verse data, and browse a calendar of events and verses.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Animation**: Framer Motion for smooth transitions and interactions
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Development**: tsx for TypeScript execution in development
- **Production**: esbuild for bundling the server code

### Mobile-First Design
The application is specifically designed as a mobile web app with:
- Fixed max-width container (max-w-md) for mobile-like experience
- Bottom navigation pattern
- Touch-friendly interactions
- Responsive design optimized for smaller screens

## Key Components

### Data Models
The application manages two primary data types defined in the shared schema:
- **Verses**: Memory verses with date, text, reference, age group, and additional info
- **Events**: Church events with date, title, description, and age group
- **Age Groups**: Three categories - kindergarten, elementary, and youth

### Storage Strategy
- **Local Storage**: Primary data storage using browser localStorage
- **Excel Upload**: XLSX parsing for bulk data import
- **Database Ready**: Drizzle ORM configured for PostgreSQL (currently unused)

### Page Structure
1. **Home Page**: Dashboard showing weekly verses overview and Excel upload
2. **Calendar Page**: Monthly calendar view with events and verses
3. **Age Group Pages**: Dedicated pages for each age group showing weekly verses
4. **404 Page**: Error handling for invalid routes

### Core Features
- **Weekly Verse Display**: Shows last week, current week, and next week verses
- **Excel Data Import**: Bulk upload of verses and events via XLSX files
- **Calendar Integration**: Monthly calendar with events and verse indicators
- **Age Group Filtering**: Separate views for different age demographics
- **Responsive Navigation**: Bottom navigation bar for mobile experience

## Data Flow

### Client-Side Data Management
1. **Local Storage**: All data persisted in browser localStorage
2. **Query Caching**: TanStack Query provides intelligent caching and synchronization
3. **Real-time Updates**: Data invalidation triggers automatic UI updates
4. **Offline Capability**: Local storage enables offline functionality

### Excel Import Process
1. User uploads XLSX file through ExcelUploader component
2. XLSX library parses file content
3. Data is validated and structured according to schema
4. Parsed data is saved to localStorage
5. Query cache is invalidated to trigger UI updates

### Date-based Logic
- Weeks run Sunday to Saturday
- Automatic calculation of last/current/next week ranges
- Date filtering for calendar views and verse assignments

## External Dependencies

### Core Libraries
- **React Ecosystem**: React, React DOM, React Hook Form
- **Routing**: wouter for lightweight routing
- **State Management**: @tanstack/react-query for server state
- **UI Components**: Extensive Radix UI primitives
- **Styling**: Tailwind CSS, class-variance-authority, clsx
- **Animation**: framer-motion for interactions
- **Data Parsing**: xlsx for Excel file processing
- **Date Handling**: date-fns for date manipulation

### Development Tools
- **Build**: Vite with React plugin
- **TypeScript**: Full TypeScript support with strict mode
- **Linting**: ESLint configuration (implied by tsconfig)
- **Database**: Drizzle ORM with PostgreSQL support (configured but not actively used)

### Replit Integration
- Custom Vite plugins for Replit environment
- Runtime error overlay for development
- Cartographer plugin for Replit-specific features

## Deployment Strategy

### Development Environment
- **Server**: Express.js serving both API and static files
- **Hot Reload**: Vite development server with HMR
- **File Watching**: tsx for TypeScript file watching
- **Error Handling**: Runtime error overlays and logging

### Production Build
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: esbuild bundles Express server to `dist/index.js`
- **Static Serving**: Express serves built React app in production
- **Environment**: NODE_ENV-based configuration switching

### Database Configuration
- Drizzle ORM configured for PostgreSQL with migrations
- Schema defined in shared directory for type safety
- Currently using localStorage, but database-ready for future scaling
- Migration system in place with `db:push` command

The application is designed to be easily deployable on Replit with minimal configuration, using environment variables for database connection when needed.