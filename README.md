# Honeycomb

A production-ready API boilerplate with authentication, subscription billing, and PostgreSQL persistence — built with Hono, Better Auth, Prisma, and Polar on the Bun runtime. Designed to deploy on Railway.

## Who Is This For?

- **Solo developers** who want to ship a paid API without stitching together auth, billing, and database from scratch
- **Indie hackers** building API-first products who need subscription gating out of the box
- **Backend engineers** exploring Hono, Bun, or Polar and wanting a real-world reference beyond a hello-world tutorial
- **Teams** that need a lightweight starting point for an authenticated, monetized API without a heavy framework

## Use Cases

This repo is a starting point for building **paid API products**. Fork it and replace the example endpoints with your own business logic.

- **SaaS API**: Ship a subscription-gated REST API. Users sign up, subscribe via Polar checkout, and get access to authenticated endpoints. Ideal for AI wrappers, data services, or any API-as-a-product.
- **Paid Developer Tools**: Gate premium endpoints (code generation, linting, analysis) behind a Pro subscription while keeping docs and health checks public.
- **Internal Tools with Billing**: Spin up an authenticated API with user management and payment processing already wired. Focus on your domain logic instead of auth and billing plumbing.
- **Prototype-to-Production**: Start with the single-file architecture to move fast, then extract routes and services as complexity grows. Auth, billing, and database are already integrated.

## Features

- **Hono Framework**: Fast, lightweight web framework for modern JavaScript
- **Better Auth**: Secure authentication with email/password support
- **Polar Payments**: Subscription billing with checkout, customer portal, and webhooks
- **Prisma ORM**: Type-safe database operations with PostgreSQL
- **Server-Side JSX**: No React dependency, using Hono's built-in JSX
- **Zod Validation**: Runtime type checking for forms and data
- **Subscription Gating**: Route-level access control for paid features
- **Single-File Architecture**: Streamlined development with integrated auth context

## Quick Start

```bash
# Install dependencies
bun install

# Set up database
bunx prisma generate
bunx prisma migrate dev

# Configure environment variables (see below)
cp .env.example .env

# Start development server
bun run dev
```

Visit `http://localhost:3000` to see the application.

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://...        # Railway provides this automatically

# Better Auth
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000

# Polar (payments)
POLAR_ACCESS_TOKEN=...               # From Polar dashboard -> Organization Settings -> Access Tokens
POLAR_WEBHOOK_SECRET=...             # From Polar dashboard -> Webhook endpoint config
POLAR_PRODUCT_ID=...                 # Product ID from Polar dashboard
POLAR_SERVER=sandbox                 # 'sandbox' for development, 'production' for live
```

## Available Scripts

- `bun run dev` - Start development server with hot reload
- `bun run build` - TypeScript type checking
- `bun run start` - Run production build
- `bun run db:migrate` - Run Prisma migrations
- `bun run db:push` - Push schema without migration files
- `bun run db:studio` - Open visual database browser

## Project Structure

```
src/
   index.tsx          # Main application file with routes and components
   generated/         # Prisma client (custom output location)
utils/
   auth.ts            # Better Auth + Polar configuration
prisma/
   schema.prisma      # Database schema
   migrations/        # Database migration files
```

## API Endpoints

| Endpoint           | Auth     | Description                                  |
|--------------------|----------|----------------------------------------------|
| `GET /api/health`  | None     | Public health check                          |
| `GET /api/me`      | Required | Returns user profile and subscription status |

## Authentication

The app includes complete authentication flows:

- **Sign Up**: `/signup` - Create new account with email/password
- **Sign In**: `/signin` - Authenticate existing users
- **Sign Out**: Secure session termination
- **Protected Routes**: Automatic user context in all routes via middleware

## Payments & Subscriptions

Polar handles subscription billing as a Merchant of Record (taxes, receipts, compliance):

- **Pricing**: `/#pricing` - View plans and subscribe
- **Checkout**: Form POST to `/checkout` creates a Polar checkout session
- **Dashboard**: `/dashboard` - Subscription status, management, and interactive API testing
- **Customer Portal**: `/api/auth/customer/portal` - Manage subscription via Polar
- **Webhooks**: `/api/auth/polar/webhooks` - Receives Polar events with signature verification

### Polar Setup

1. Create an account at [polar.sh](https://polar.sh)
2. Create an organization and a recurring subscription product
3. Generate an Access Token from organization settings
4. Configure a webhook endpoint pointing to `{YOUR_URL}/api/auth/polar/webhooks`
5. Add the environment variables listed above

Use `POLAR_SERVER=sandbox` during development to test purchases without real charges.

## Technology Stack

- **Runtime**: Bun
- **Framework**: Hono v4
- **Authentication**: Better Auth
- **Payments**: Polar (via `@polar-sh/better-auth` plugin)
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod
- **TypeScript**: Full type safety
- **Deployment**: Railway (zero-config)

## Architecture Notes

- All routes have access to authenticated user context via Hono middleware
- Forms post directly to Better Auth API endpoints
- Polar plugin auto-mounts checkout, portal, and webhook endpoints under `/api/auth/*`
- `requireSubscription` middleware gates paid routes by checking active subscriptions via the Polar SDK
- `checkPaidAccess` queries Polar directly (no self-fetch) for reliable subscription status
- New users automatically get a Polar customer record on signup
- Webhook handlers are stubbed with `console.log` — add business logic as needed
- CORS configured for authentication with credentials support
- Port defaults to 3000 but is configurable via `PORT` env var (Railway sets this automatically)
