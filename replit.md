# Unified Software Access Portal

## Overview

This is a full-stack web application that provides a unified portal for accessing multiple enterprise software tools. The application is built with a React frontend using shadcn/ui components and a Node.js/Express backend with PostgreSQL database. It features user authentication and a dashboard that serves as a gateway to various enterprise applications including Custom Portal, Asset Lifecycle Management (ALM), Service Desk, and Enterprise Performance Management (EPM).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tool**
- **React 18** with TypeScript for the UI layer
- **Vite** as the build tool and development server
- **Wouter** for client-side routing (lightweight alternative to React Router)

**UI Component System**
- **shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS v4** for styling with custom theme configuration
- **Framer Motion** for animations and transitions
- **Lucide React** for iconography

**State Management**
- **TanStack Query (React Query)** for server state management and data fetching
- **React Hook Form** with Zod resolvers for form validation
- Custom AuthContext for authentication state management

**Design Decisions**
- Component-based architecture with reusable UI primitives in `client/src/components/ui/`
- Page-based routing structure in `client/src/pages/`
- Custom path aliases (`@/`, `@shared/`, `@assets/`) for clean imports
- Protected routes using HOC pattern to enforce authentication
- Responsive design with mobile-first approach

### Backend Architecture

**Server Framework**
- **Express.js** for HTTP server and API routing
- **Node.js** with ES modules (type: "module" in package.json)
- **TypeScript** for type safety across the entire codebase

**Authentication & Session Management**
- **Passport.js** with Local Strategy for username/password authentication
- **express-session** for session management
- **bcrypt** for password hashing (10 salt rounds)
- Session cookies configured with security flags (httpOnly, sameSite)
- Middleware-based route protection with `requireAuth` function

**Role-Based Access Control (RBAC)**
- Frontend RBAC context provider in `client/src/lib/rbac.tsx`
- `useRBAC` hook provides `hasPermission`, `isAdmin`, and `permissions` for permission checking
- Menu items in ALM sidebar are filtered based on user's role permissions using hierarchical inheritance
- Hierarchical permission inheritance: parent permissions grant access to child items (e.g., `alm.lifecycle.acquisition` grants access to `alm.lifecycle.acquisition.purchase-order`)
- Excluded parent permissions that don't cascade: `alm`, `alm.access`, `alm.dashboard` (prevents privilege escalation from broad app-level tokens)
- Backend `requireAdmin` middleware protects all admin API routes (`/api/users/*`, `/api/roles/*`)
- Admin access granted to users with username "admin", role name "admin", or specific permissions (`admin.user-master`, `admin.role-master`)
- New `/api/auth/permissions` endpoint returns current user's permissions (accessible to all authenticated users)
- Supports wildcard `"*"` permission for admin users

**Database Layer**
- **Drizzle ORM** for type-safe database queries
- Schema-first approach with Zod validation
- Database schema defined in `shared/schema.ts` for code sharing between client and server
- Neon serverless driver for PostgreSQL connections
- Migration system via drizzle-kit

**API Structure**
- RESTful API endpoints under `/api/` prefix
- Authentication endpoints: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/user`
- Request validation using Zod schemas
- Standardized error handling with proper HTTP status codes

**Build & Deployment**
- Custom build script using esbuild for server bundling
- Selective dependency bundling (allowlist pattern) to optimize cold start times
- Static file serving for production builds
- Separate development and production configurations

### Data Storage

**Database**
- **PostgreSQL** as the primary database (via Neon serverless)
- Connection managed through environment variable `DATABASE_URL`
- Database schema includes:
  - Users table with UUID primary keys, username, hashed password, email, fullName, roleId, isActive, and timestamps
  - Roles table with UUID primary keys, name, description, permissions (JSON array), isActive, and timestamps
  - Username uniqueness constraint
  - Role name uniqueness constraint
  - Automatic UUID generation using PostgreSQL's `gen_random_uuid()`

### Administration Features

**User Master** (`/admin/users`)
- Full CRUD operations for user management
- Role assignment to users
- User activation/deactivation
- Password management with secure hashing (bcrypt)
- Search and filter capabilities

**Role Master** (`/admin/roles`)
- Full CRUD operations for role management
- Menu permission configuration using centralized menu system

### Asset Lifecycle Management (ALM) Module

**Dashboard System** (`/apps/alm`)
The ALM module features 6 comprehensive dashboards with KPI cards and metrics:

- **Overview Dashboard** (`/apps/alm`) - Total assets, compliance rate, asset value, critical alerts, asset distribution by category, health status, upcoming renewals, recent activities
- **Hardware Asset Dashboard** (`/apps/alm/dashboard/hardware`) - Device counts by type (laptops, desktops, monitors, mobile, printers), lifecycle distribution, warranty status, vendor breakdown, locations, maintenance schedule, depreciation summary
- **Software Asset Dashboard** (`/apps/alm/dashboard/software`) - License count and compliance, utilization by category, license types, top software by spend, upcoming renewals, compliance alerts, version distribution, cost optimization opportunities
- **CIO Dashboard** (`/apps/alm/dashboard/cio`) - Strategic IT view with digital maturity score, technology roadmap alignment, tech stack health, digital transformation KPIs, risk and compliance summary
- **CFO Dashboard** (`/apps/alm/dashboard/cfo`) - Financial view with IT investment, ROI, cost savings, budget variance, spend by category, depreciation, cost optimization, CapEx vs OpEx, budget forecast, vendor spend
- **COO Dashboard** (`/apps/alm/dashboard/coo`) - Operational view with asset utilization, deployment time, SLA compliance, maintenance efficiency, work orders, service levels, asset health, inventory status, resource allocation

**Design Patterns**
- Reusable KPICard component for consistent metric display
- Color-coded status indicators (green/yellow/red) for health and urgency
- Progress bars for utilization and distribution visualization
- Responsive grid layouts adapting to screen size
- Dark mode support with appropriate color tokens
- Role activation/deactivation
- Permissions stored as JSON array

**Menu Configuration**
- Centralized menu configuration in `client/src/lib/menu-config.ts`
- Hierarchical menu structure supporting nested items
- Used for role-based permission assignment

**Security Settings** (`/admin/security`)
- Password policy configuration (minimum length, uppercase, lowercase, numbers, special characters)
- Session timeout management (in minutes)
- Multi-factor authentication (MFA) settings with enforcement options
- IP restriction management with allowed and blocked IP lists
- Account lockout settings (max attempts, lockout duration)
- All settings protected by admin-only access

**Audit Logs** (`/admin/audit-logs`)
- Comprehensive activity tracking for security-critical actions
- Categories: authentication, security, user management, system, data changes
- Filterable by username, action, category, resource type, status, and date range
- Pagination support for large log sets
- Automatic logging of login attempts, user changes, role changes, and security settings updates
- Cleanup functionality for old logs (admin-only)

**Notification Settings** (`/admin/notifications`)
- Push notification configuration with VAPID key management
- Admin-only VAPID key generation and status checking via `/api/push/vapid-status` and `/api/push/generate-vapid-keys`
- VAPID keys stored as environment variables (VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT) for security
- Test push notification functionality for verifying configuration
- In-app notification channel configuration
- Event-based notification triggers (user created, deleted, password changes, role changes, login events)
- Push subscription management with active subscription display

**In-App Notifications**
- NotificationBell component (`client/src/components/NotificationBell.tsx`) with dropdown popover showing recent notifications
- Available on all main pages: Dashboard, Custom Portal, Asset Lifecycle Management, Service Desk, and EPM
- Shows unread notification count badge
- Supports marking notifications as read (individually or all at once)
- Notification types: tickets, assets, licenses, users
- Currently uses mock data - ready for backend integration

**Admin Credentials**
- Default admin user: username `admin`, password `P@ssw0rd@123`

**Schema Design**
- Type-safe schema definitions using Drizzle ORM
- Zod schemas derived from database schema for runtime validation
- SafeUser type that omits password field for API responses
- Shared types between frontend and backend via `shared/` directory

### External Dependencies

**Third-Party UI Libraries**
- **Radix UI** - Unstyled, accessible component primitives (accordion, dialog, dropdown, select, tabs, tooltip, etc.)
- **shadcn/ui** - Pre-built components based on Radix UI
- **Framer Motion** - Animation library for UI transitions
- **Lucide React** - Icon library

**Database & ORM**
- **@neondatabase/serverless** - Neon PostgreSQL serverless driver
- **Drizzle ORM** - TypeScript ORM with drizzle-kit for migrations
- **drizzle-zod** - Zod schema generation from Drizzle schemas

**Authentication & Security**
- **Passport.js** - Authentication middleware
- **passport-local** - Local username/password strategy
- **bcrypt** - Password hashing
- **express-session** - Session management
- **otplib** - TOTP (Time-based One-Time Password) generation for MFA
- **qrcode** - QR code generation for authenticator app setup

### Multi-Factor Authentication (MFA)

**TOTP Implementation**
- Users can enable MFA in their account settings
- Uses TOTP (Time-based One-Time Password) compatible with authenticator apps (Google Authenticator, Authy, etc.)
- MFA setup generates a QR code that users scan with their authenticator app
- Setup requires immediate verification with a valid code before enabling

**MFA Endpoints**
- `GET /api/auth/mfa/status` - Check if MFA is enabled for current user
- `POST /api/auth/mfa/setup` - Generate new MFA secret and QR code
- `POST /api/auth/mfa/verify-setup` - Verify code and enable MFA
- `POST /api/auth/mfa/disable` - Disable MFA (requires valid code)
- `POST /api/auth/mfa/verify` - Verify MFA code during login

**Security Features**
- Failed login attempts tracked for both password and MFA failures
- Account lockout after configurable number of failed attempts (default: 5)
- Lockout duration configurable via security settings (default: 30 minutes)
- Password policy enforcement with configurable requirements (min length, uppercase, lowercase, numbers, special characters)
- MFA secret excluded from SafeUser type to prevent exposure

**Login Flow with MFA**
1. User submits username/password
2. If credentials valid and MFA enabled, server returns `{ requiresMfa: true, userId }`
3. Frontend shows MFA code input
4. User enters code from authenticator app
5. If valid, session created and user logged in

**Development Tools**
- **Vite** plugins:
  - `@vitejs/plugin-react` - React Fast Refresh
  - `@tailwindcss/vite` - Tailwind CSS v4 integration
  - `@replit/vite-plugin-runtime-error-modal` - Error overlay
  - `@replit/vite-plugin-cartographer` - Replit-specific tooling (dev only)
  - `@replit/vite-plugin-dev-banner` - Dev environment banner (dev only)
- Custom `vite-plugin-meta-images.ts` - Updates OpenGraph meta tags for Replit deployments

**Form Management**
- **React Hook Form** - Form state management
- **@hookform/resolvers** - Validation resolvers including Zod
- **Zod** - Schema validation
- **zod-validation-error** - User-friendly validation error messages

**Utilities**
- **clsx** & **tailwind-merge** - Conditional className utilities
- **class-variance-authority** - Component variant management
- **date-fns** - Date manipulation utilities
- **nanoid** - Unique ID generation