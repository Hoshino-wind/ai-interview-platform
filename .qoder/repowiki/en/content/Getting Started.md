# Getting Started

<cite>
**Referenced Files in This Document**
- [package.json](file://smartview-portal/package.json)
- [README.md](file://smartview-portal/README.md)
- [next.config.mjs](file://smartview-portal/next.config.mjs)
- [tailwind.config.ts](file://smartview-portal/tailwind.config.ts)
- [postcss.config.mjs](file://smartview-portal/postcss.config.mjs)
- [.eslintrc.json](file://smartview-portal/.eslintrc.json)
- [tsconfig.json](file://smartview-portal/tsconfig.json)
- [next-env.d.ts](file://smartview-portal/next-env.d.ts)
- [src/app/layout.tsx](file://smartview-portal/src/app/layout.tsx)
- [src/app/page.tsx](file://smartview-portal/src/app/page.tsx)
- [src/app/globals.css](file://smartview-portal/src/app/globals.css)
- [src/lib/constants.ts](file://smartview-portal/src/lib/constants.ts)
- [src/lib/utils.ts](file://smartview-portal/src/lib/utils.ts)
- [src/lib/api.ts](file://smartview-portal/src/lib/api.ts)
- [src/contexts/AuthContext.tsx](file://smartview-portal/src/contexts/AuthContext.tsx)
- [src/components/layout/Header.tsx](file://smartview-portal/src/components/layout/Header.tsx)
- [src/components/ui/Button.tsx](file://smartview-portal/src/components/ui/Button.tsx)
- [src/components/home/HeroSection.tsx](file://smartview-portal/src/components/home/HeroSection.tsx)
- [src/components/home/FeaturesOverview.tsx](file://smartview-portal/src/components/home/FeaturesOverview.tsx)
- [smartview-server/package.json](file://smartview-server/package.json)
- [smartview-server/README.md](file://smartview-server/README.md)
- [smartview-server/src/main.ts](file://smartview-server/src/main.ts)
- [smartview-server/src/app.module.ts](file://smartview-server/src/app.module.ts)
- [smartview-server/src/auth/auth.service.ts](file://smartview-server/src/auth/auth.service.ts)
- [smartview-server/docker-compose.yml](file://smartview-server/docker-compose.yml)
- [smartview-server/prisma/schema.prisma](file://smartview-server/prisma/schema.prisma)
</cite>

## Update Summary
**Changes Made**
- Added comprehensive backend server setup documentation for smartview-server microservice
- Updated prerequisites to include PostgreSQL and Redis dependencies
- Enhanced development workflow to cover dual-service architecture
- Added database setup and configuration instructions
- Updated project structure to reflect microservices architecture
- Added environment configuration and deployment considerations

## Table of Contents
1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Development Workflow](#development-workflow)
5. [Project Structure](#project-structure)
6. [Key Configuration Files](#key-configuration-files)
7. [Essential Commands](#essential-commands)
8. [Local Development Walkthrough](#local-development-walkthrough)
9. [Build and Deployment](#build-and-deployment)
10. [Troubleshooting](#troubleshooting)
11. [Verification Checklist](#verification-checklist)
12. [Conclusion](#conclusion)

## Introduction
SmartView Portal is a modern microservices web application built with Next.js App Router for the frontend and NestJS for the backend. The platform consists of two separate services: smartview-portal (frontend) and smartview-server (backend), connected through RESTful APIs. This guide helps you set up the complete development environment, run both services locally, explore the microservices architecture, and prepare for building or deploying the application.

## Prerequisites
- **Node.js**: The frontend requires Node.js 18+ for Next.js 14.x compatibility. The backend requires Node.js 16+ for NestJS compatibility.
- **Database**: PostgreSQL 16+ for data persistence and Redis 7+ for caching and session management.
- **Package manager**: You can use npm, yarn, pnpm, or bun as per your preference.
- **Operating system**: macOS, Linux, or Windows with a terminal or command prompt.
- **Docker**: Optional but recommended for easy database setup using docker-compose.

**Section sources**
- [smartview-portal/package.json:18](file://smartview-portal/package.json#L18)
- [smartview-server/package.json:22-40](file://smartview-server/package.json#L22-L40)
- [smartview-server/docker-compose.yml:3-21](file://smartview-server/docker-compose.yml#L3-L21)

## Installation
Follow these steps to install dependencies and prepare your environment:

### Database Setup (Recommended)
1. Install Docker Desktop or Docker Engine
2. Navigate to the smartview-server directory
3. Start the database services:
   ```bash
   docker-compose up -d
   ```
4. Verify services are running:
   ```bash
   docker-compose ps
   ```

### Backend Service Setup
1. Open a terminal in the repository root
2. Navigate to the smartview-server directory
3. Install backend dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```
4. Configure environment variables (create `.env` file):
   ```
   DATABASE_URL=postgresql://smartview:smartview123@localhost:5433/smartview?schema=public
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-refresh-secret-key
   JWT_EXPIRES_IN=1h
   JWT_REFRESH_EXPIRES_IN=7d
   PORT=3001
   ```
5. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
6. Seed the database (optional):
   ```bash
   npx prisma db seed
   ```

### Frontend Service Setup
1. Open a new terminal tab/window
2. Navigate to the smartview-portal directory
3. Install frontend dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

**Section sources**
- [smartview-server/README.md:28-32](file://smartview-server/README.md#L28-L32)
- [smartview-server/docker-compose.yml:1-26](file://smartview-server/docker-compose.yml#L1-L26)
- [smartview-server/prisma/schema.prisma:1-334](file://smartview-server/prisma/schema.prisma#L1-L334)

## Development Workflow
The SmartView platform operates as a microservices architecture with two separate services:

### Dual-Service Development
- **Backend Service**: Start the NestJS server on port 3001
- **Frontend Service**: Start the Next.js client on port 3000
- **API Proxy**: Next.js automatically proxies API requests from `/api` to the backend

### Development Commands
1. **Terminal 1** - Start backend service:
   ```bash
   cd smartview-server
   npm run start:dev
   ```
2. **Terminal 2** - Start frontend service:
   ```bash
   cd smartview-portal
   npm run dev
   ```

### Service Architecture
```mermaid
graph TB
subgraph "SmartView Platform"
subgraph "Frontend Services"
A[smartview-portal<br/>Next.js 14.x]
B[Client API Layer<br/>Axios + Interceptors]
C[Authentication Context<br/>React Context]
end
subgraph "Backend Services"
D[smartview-server<br/>NestJS 11.x]
E[REST API Controllers]
F[Database Layer<br/>Prisma ORM]
end
subgraph "Infrastructure"
G[PostgreSQL 16+]
H[Redis 7+]
I[JWT Tokens]
end
end
A --> B
B --> E
E --> F
F --> G
F --> H
C --> A
C --> B
```

**Diagram sources**
- [smartview-portal/src/lib/api.ts:28-35](file://smartview-portal/src/lib/api.ts#L28-L35)
- [smartview-portal/next.config.mjs:3-10](file://smartview-portal/next.config.mjs#L3-L10)
- [smartview-server/src/main.ts:8-35](file://smartview-server/src/main.ts#L8-L35)
- [smartview-server/src/app.module.ts:15-33](file://smartview-server/src/app.module.ts#L15-L33)

**Section sources**
- [smartview-server/src/main.ts:8-35](file://smartview-server/src/main.ts#L8-L35)
- [smartview-portal/next.config.mjs:3-10](file://smartview-portal/next.config.mjs#L3-L10)
- [smartview-portal/src/lib/api.ts:28-35](file://smartview-portal/src/lib/api.ts#L28-L35)

## Project Structure
SmartView Platform follows a microservices architecture with clear separation between frontend and backend:

### Frontend Structure (smartview-portal)
- **Application shell and routing**: src/app with Next.js App Router
- **Reusable components**: src/components organized by feature
- **Shared utilities**: src/lib for API clients and constants
- **Authentication context**: src/contexts for user state management
- **Global styles**: Tailwind CSS configuration and custom CSS

### Backend Structure (smartview-server)
- **Application modules**: Feature-based NestJS modules
- **Database schema**: Prisma ORM schema definition
- **API controllers**: REST endpoints for each domain
- **Business logic**: Services implementing platform features
- **Security**: JWT authentication and authorization

```mermaid
graph TB
subgraph "smartview-portal/"
A[src/app/] --> A1[layout.tsx]
A --> A2[page.tsx]
A --> A3[globals.css]
B[src/components/] --> B1[layout/]
B --> B2[ui/]
B --> B3[home/]
C[src/lib/] --> C1[api.ts]
C --> C2[constants.ts]
D[src/contexts/] --> D1[AuthContext.tsx]
end
subgraph "smartview-server/"
E[src/] --> E1[auth/]
E --> E2[users/]
E --> E3[questions/]
E --> E4[exams/]
E --> E5[interviews/]
E --> E6[applications/]
E --> E7[sandbox/]
E --> E8[scoring/]
F[prisma/] --> F1[schema.prisma]
F --> F2[migrations/]
G[docker-compose.yml]
end
```

**Diagram sources**
- [src/app/layout.tsx:19-34](file://smartview-portal/src/app/layout.tsx#L19-L34)
- [src/lib/api.ts:130-409](file://smartview-portal/src/lib/api.ts#L130-L409)
- [src/contexts/AuthContext.tsx:52-206](file://smartview-portal/src/contexts/AuthContext.tsx#L52-L206)
- [smartview-server/src/app.module.ts:15-33](file://smartview-server/src/app.module.ts#L15-L33)
- [smartview-server/prisma/schema.prisma:77-333](file://smartview-server/prisma/schema.prisma#L77-L333)

**Section sources**
- [smartview-portal/src/app/layout.tsx:19-34](file://smartview-portal/src/app/layout.tsx#L19-L34)
- [smartview-portal/src/lib/api.ts:130-409](file://smartview-portal/src/lib/api.ts#L130-L409)
- [smartview-portal/src/contexts/AuthContext.tsx:52-206](file://smartview-portal/src/contexts/AuthContext.tsx#L52-L206)
- [smartview-server/src/app.module.ts:15-33](file://smartview-server/src/app.module.ts#L15-L33)
- [smartview-server/prisma/schema.prisma:77-333](file://smartview-server/prisma/schema.prisma#L77-L333)

## Key Configuration Files
### Frontend Configuration
- **next.config.mjs**: API proxy configuration for development
- **tailwind.config.ts**: Design system and theme configuration
- **postcss.config.mjs**: CSS processing pipeline
- **tsconfig.json**: TypeScript compiler options
- **.eslintrc.json**: Code quality and style enforcement

### Backend Configuration
- **src/main.ts**: Application bootstrap and middleware configuration
- **src/app.module.ts**: Feature module registration
- **docker-compose.yml**: Database service orchestration
- **prisma/schema.prisma**: Database schema definition

**Section sources**
- [smartview-portal/next.config.mjs:1-14](file://smartview-portal/next.config.mjs#L1-L14)
- [smartview-portal/tailwind.config.ts:1-20](file://smartview-portal/tailwind.config.ts#L1-L20)
- [smartview-portal/postcss.config.mjs:1-9](file://smartview-portal/postcss.config.mjs#L1-L9)
- [smartview-portal/tsconfig.json:1-27](file://smartview-portal/tsconfig.json#L1-L27)
- [smartview-portal/.eslintrc.json:1-4](file://smartview-portal/.eslintrc.json#L1-L4)
- [smartview-server/src/main.ts:8-35](file://smartview-server/src/main.ts#L8-L35)
- [smartview-server/src/app.module.ts:15-33](file://smartview-server/src/app.module.ts#L15-L33)
- [smartview-server/docker-compose.yml:1-26](file://smartview-server/docker-compose.yml#L1-L26)
- [smartview-server/prisma/schema.prisma:1-334](file://smartview-server/prisma/schema.prisma#L1-L334)

## Essential Commands
### Frontend Commands
- **Development**: `npm run dev` - Start Next.js development server
- **Build**: `npm run build` - Create production build
- **Start**: `npm run start` - Serve production build
- **Lint**: `npm run lint` - Run TypeScript and ESLint checks

### Backend Commands
- **Development**: `npm run start:dev` - Start NestJS in watch mode
- **Production**: `npm run start:prod` - Start production server
- **Build**: `npm run build` - Compile TypeScript to JavaScript
- **Tests**: `npm run test` - Run unit tests
- **Database**: `npx prisma migrate dev` - Apply migrations

### Database Commands
- **Start Services**: `docker-compose up -d`
- **Stop Services**: `docker-compose down`
- **View Logs**: `docker-compose logs -f`

**Section sources**
- [smartview-portal/package.json:5-10](file://smartview-portal/package.json#L5-L10)
- [smartview-server/package.json:8-21](file://smartview-server/package.json#L8-L21)
- [smartview-server/README.md:30-58](file://smartview-server/README.md#L30-L58)

## Local Development Walkthrough
### Initial Setup
1. **Start Database Services**:
   ```bash
   cd smartview-server
   docker-compose up -d
   ```
2. **Setup Backend**:
   ```bash
   cd smartview-server
   npm install
   npx prisma migrate dev
   npx prisma db seed
   ```
3. **Start Backend Server**:
   ```bash
   npm run start:dev
   ```

### Frontend Development
1. **Start Frontend Server**:
   ```bash
   cd ../smartview-portal
   npm run dev
   ```
2. **Access Application**:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend: [http://localhost:3001](http://localhost:3001)
   - API Proxy: [http://localhost:3000/api](http://localhost:3000/api)

### Authentication Flow
```mermaid
sequenceDiagram
participant Client as "Frontend Client"
participant AuthCtx as "Auth Context"
participant API as "API Client"
participant Server as "Backend Server"
participant DB as "Database"
Client->>AuthCtx : User submits login form
AuthCtx->>API : authApi.login(email, password)
API->>Server : POST /api/auth/login
Server->>DB : Verify credentials
DB-->>Server : User data + hashed password
Server->>Server : Compare passwords
Server-->>API : JWT tokens + user info
API-->>AuthCtx : AuthResponse
AuthCtx->>AuthCtx : Store tokens in localStorage
AuthCtx-->>Client : Redirect to dashboard
```

**Diagram sources**
- [smartview-portal/src/contexts/AuthContext.tsx:115-131](file://smartview-portal/src/contexts/AuthContext.tsx#L115-L131)
- [smartview-portal/src/lib/api.ts:131-148](file://smartview-portal/src/lib/api.ts#L131-L148)
- [smartview-server/src/auth/auth.service.ts:82-115](file://smartview-server/src/auth/auth.service.ts#L82-L115)

**Section sources**
- [smartview-portal/src/contexts/AuthContext.tsx:115-131](file://smartview-portal/src/contexts/AuthContext.tsx#L115-L131)
- [smartview-portal/src/lib/api.ts:131-148](file://smartview-portal/src/lib/api.ts#L131-L148)
- [smartview-server/src/auth/auth.service.ts:82-115](file://smartview-server/src/auth/auth.service.ts#L82-L115)

## Build and Deployment
### Production Build Process
1. **Frontend Build**:
   ```bash
   cd smartview-portal
   npm run build
   npm run start
   ```

2. **Backend Build**:
   ```bash
   cd smartview-server
   npm run build
   npm run start:prod
   ```

### Environment Configuration
Create `.env` files for both services:

**Backend .env**:
```
DATABASE_URL=postgresql://user:password@host:5432/dbname?schema=public
JWT_SECRET=your-production-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=2h
JWT_REFRESH_EXPIRES_IN=7d
PORT=3001
```

**Frontend .env.local**:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=production
```

### Deployment Architecture
```mermaid
flowchart TD
subgraph "Development"
A[Local Development] --> B[Next.js Dev Server]
A --> C[NestJS Dev Server]
end
subgraph "Staging"
D[Staging Environment] --> E[Frontend Build]
D --> F[Backend Build]
E --> G[Vercel Deployment]
F --> H[AWS/ECS Deployment]
end
subgraph "Production"
I[Production Environment] --> J[Frontend CDN]
I --> K[Backend API Gateway]
I --> L[Database Cluster]
I --> M[Redis Cache]
end
```

**Diagram sources**
- [smartview-portal/README.md:32-37](file://smartview-portal/README.md#L32-L37)
- [smartview-server/README.md:60-71](file://smartview-server/README.md#L60-L71)

**Section sources**
- [smartview-portal/README.md:32-37](file://smartview-portal/README.md#L32-L37)
- [smartview-server/README.md:60-71](file://smartview-server/README.md#L60-L71)

## Troubleshooting
### Common Issues and Solutions

#### Database Connection Problems
- **Issue**: Cannot connect to PostgreSQL
- **Solution**: Verify docker-compose is running and check connection string
  ```bash
  docker-compose ps
  docker-compose logs postgres
  ```

#### API Proxy Issues
- **Issue**: Frontend cannot reach backend API
- **Solution**: Check Next.js rewrite configuration
  ```bash
  # Verify in next.config.mjs
  # Should proxy /api to localhost:3001
  ```

#### Authentication Problems
- **Issue**: Login fails or tokens expire
- **Solution**: Check JWT secrets and expiration settings
  ```bash
  # Verify environment variables
  # Check token refresh logic in AuthContext
  ```

#### CORS Issues
- **Issue**: Frontend blocked by CORS policy
- **Solution**: Verify backend CORS configuration
  ```bash
  # Check src/main.ts CORS settings
  # Should allow http://localhost:3000
  ```

**Section sources**
- [smartview-server/docker-compose.yml:8-11](file://smartview-server/docker-compose.yml#L8-L11)
- [smartview-portal/next.config.mjs:3-10](file://smartview-portal/next.config.mjs#L3-L10)
- [smartview-portal/src/contexts/AuthContext.tsx:98-113](file://smartview-portal/src/contexts/AuthContext.tsx#L98-L113)
- [smartview-server/src/main.ts:12-17](file://smartview-server/src/main.ts#L12-L17)

## Verification Checklist
### Development Environment
- [ ] PostgreSQL and Redis services are running
- [ ] Database migrations applied successfully
- [ ] Backend service starts without errors
- [ ] Frontend service starts without errors
- [ ] API proxy configured correctly
- [ ] Authentication flow works properly

### Application Functionality
- [ ] Homepage loads with all sections
- [ ] Navigation works across different routes
- [ ] Authentication state persists
- [ ] API requests are properly proxied
- [ ] Responsive design works on mobile devices
- [ ] ESLint and TypeScript checks pass

### Database Integration
- [ ] User registration creates database records
- [ ] JWT tokens are generated and validated
- [ ] Data seeding completed successfully
- [ ] Prisma queries execute without errors

**Section sources**
- [smartview-server/docker-compose.yml:1-26](file://smartview-server/docker-compose.yml#L1-L26)
- [smartview-portal/src/contexts/AuthContext.tsx:59-96](file://smartview-portal/src/contexts/AuthContext.tsx#L59-L96)
- [smartview-portal/src/lib/api.ts:131-148](file://smartview-portal/src/lib/api.ts#L131-L148)
- [smartview-server/src/auth/auth.service.ts:41-80](file://smartview-server/src/auth/auth.service.ts#L41-L80)

## Conclusion
You now have the essentials to set up, run, and iterate on the SmartView Platform microservices architecture. The platform consists of two separate but interconnected services: smartview-portal (Next.js frontend) and smartview-server (NestJS backend). 

Key aspects of the microservices setup:
- **Separation of Concerns**: Clear distinction between frontend UI and backend business logic
- **API Communication**: Frontend communicates with backend through RESTful APIs with automatic proxying
- **Database Management**: Centralized PostgreSQL database with Prisma ORM for type-safe operations
- **Authentication**: JWT-based authentication with token refresh capabilities
- **Development Workflow**: Independent development of both services with coordinated API access

Explore the components, customize content, implement new features, and prepare for scaling the platform. The microservices architecture provides flexibility for independent deployment, scaling, and technology evolution of each service.

For deeper insights into Next.js and NestJS best practices, refer to the official documentation links provided in the respective README files.