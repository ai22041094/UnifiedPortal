# Unified Software Access Portal

## Overview
This full-stack web application provides a unified portal for accessing multiple enterprise software tools, including Custom Portal, Asset Lifecycle Management (ALM), Service Desk, and Enterprise Performance Management (EPM). It features user authentication, a dashboard, and robust administration capabilities for user, role, security, and license management. The project aims to streamline access and management of various enterprise applications through a single, secure gateway.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework:** React 18 with TypeScript.
- **Build Tool:** Vite.
- **UI:** shadcn/ui component library (Radix UI primitives) and Tailwind CSS v4 for styling.
- **State Management:** TanStack Query for server state, React Hook Form with Zod for form validation, and a custom AuthContext.
- **Routing:** Wouter for client-side routing.
- **Animations:** Framer Motion.
- **Icons:** Lucide React.
- **Design:** Component-based, page-based routing, custom path aliases, protected routes, and responsive design.

### Backend
- **Framework:** Node.js with Express.js and TypeScript.
- **Authentication:** Passport.js with Local Strategy, `express-session` for session management, and bcrypt for password hashing.
- **Authorization:** Role-Based Access Control (RBAC) with hierarchical permission inheritance, implemented via Passport.js and custom middleware. Includes `requireAdmin` for administrative routes.
- **Database ORM:** Drizzle ORM with Neon serverless driver for PostgreSQL. Schema-first approach with Zod validation.
- **API:** RESTful endpoints, Zod for request validation, and standardized error handling.
- **Build:** Custom esbuild script for server bundling.

### Data Storage
- **Database:** PostgreSQL (via Neon serverless).
- **Schema:** Includes `Users` (UUID, username, password, email, role, activity status), `Roles` (UUID, name, permissions as JSON array), and `license_info` tables.

### Key Features
- **Admin Features:** User Master (CRUD, role assignment, activation, password management), Role Master (CRUD, menu permission config), Security Settings (password policy, session timeout, MFA, IP restrictions, account lockout), Audit Logs (activity tracking, filtering, cleanup), and Notification Settings (push notifications, in-app channels).
- **Asset Lifecycle Management (ALM) Module:** Features six dashboards (Overview, Hardware, Software, CIO, CFO, COO) with KPIs, metrics, and data visualizations.
- **License Management System:** Controls access to modules (Custom Portal, ALM, Service Desk, EPM) based on validated license keys. Integrates with an external license server.
- **Multi-Factor Authentication (MFA):** TOTP implementation with QR code setup, verification, and disabling. Integrated into login flow and protected by security features like account lockout.
- **In-App Notifications:** Real-time notifications for various events, displayed via a NotificationBell component.

## External Dependencies

### UI/Frontend Libraries
- Radix UI (component primitives)
- shadcn/ui (UI components)
- Framer Motion (animations)
- Lucide React (icons)
- Tailwind CSS v4

### Database & ORM
- @neondatabase/serverless (PostgreSQL driver)
- Drizzle ORM
- drizzle-zod (Zod schema generation)

### Authentication & Security
- Passport.js
- passport-local
- bcrypt
- express-session
- otplib (TOTP generation for MFA)
- qrcode (QR code generation for MFA)

### Form Management & Validation
- React Hook Form
- @hookform/resolvers
- Zod
- zod-validation-error

### Utilities
- clsx & tailwind-merge
- class-variance-authority
- date-fns
- nanoid

## Test License Keys
For testing license functionality, use the test endpoint `/api/test/license/validate`:

| License Key | Modules Included |
|-------------|-----------------|
| `TEST-ALL-MODULES-2025` | All modules (Custom Portal, ALM, Service Desk, EPM) |
| `TEST-PORTAL-ONLY-2025` | Custom Portal only |
| `TEST-ALM-ONLY-2025` | Asset Management only |
| `TEST-SD-ONLY-2025` | Service Desk only |
| `TEST-EPM-ONLY-2025` | EPM only |
| `TEST-EXPIRED-2024` | Expired license (for testing expiry) |

**Note:** Set `LICENSE_SERVER_URL` to your app's URL (e.g., the Replit domain) + `/api/test/license` to use these test keys.