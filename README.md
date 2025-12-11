# 🌍 WhereToGo: A Scalable Discovery & Booking Engine

**WhereToGo** is a robust, full-stack platform engineered to bridge the gap between business owners and explorers. It is not just a listing app; it is a comprehensively orchestrated system featuring role-based access control (RBAC), automated data pipelines, and a secure, type-safe architecture.

Built with the modern **MERN Stack** and **TypeScript**, this project adheres to strict **MVC principles** and **Clean Architecture**, ensuring scalability, maintainability, and security.

-----

## 🏛️ Architectural Principles & Orchestration

This system was architected with three core pillars: **Security**, **Scalability**, and **User Experience**.

### 1\. Separation of Concerns (MVC Pattern)

The backend is strictly decoupled into **Models** (Data Layer), **Controllers** (Business Logic), and **Routes** (API Endpoints). This orchestration allows for modular development where business logic never leaks into the HTTP layer.

### 2\. Role-Based Access Control (RBAC) Orchestration

We implemented a granular permission system that governs the data flow based on user intent:

  * **Admins:** Have sovereign control over the system (User management, Listing approval/rejection, content moderation).
  * **Owners:** Can submit listings (Draft/Pending state), edit approved listings (triggering re-approval workflows), and manage their business profile.
  * **Users:** Read-only access with interactive features like Favorites and History tracking.

### 3\. Defensive Security Strategy

Security is not an afterthought; it is woven into the middleware chain:

  * **NoSQL Injection Prevention:** Utilized `express-mongo-sanitize` to strip data of prohibited characters (`$`, `.`) preventing operator injection.
  * **Stateless Authentication:** Implemented **JWT (JSON Web Tokens)** for scalable, session-less authentication.
  * **Password Hardening:** Users' credentials are securely hashed using **Bcrypt** with salt rounds before ever touching the database.

### 4\. Data Enrichment Pipeline

Instead of relying solely on manual entry, the system integrates **Apify**. This acts as an automated ETL (Extract, Transform, Load) pipeline that scrapes, normalizes, and enriches the database with real-world location data, ensuring high-quality content from day one.

-----

## 🛠️ Technology Stack

### Client-Side (The Experience)

  * **Core:** React.js (Vite) + TypeScript for strict type safety and compile-time error catching.
  * **State & Async Management:** **TanStack Query (React Query)** for efficient server-state management, caching, and optimistic UI updates.
  * **UI/UX:**
      * **Tailwind CSS:** For rapid, utility-first styling.
      * **Shadcn UI:** For accessible, robust, and composable component primitives.
      * **React Hot Toast:** For non-intrusive, contextual user feedback.
  * **Forms:** **React Hook Form** for performant, uncontrolled form validation.
  * **Internationalization:** **i18next** for full English/Arabic bidirectional support (LTR/RTL).

### Server-Side (The Logic)

  * **Runtime:** Node.js & Express.js.
  * **Database:** MongoDB (Atlas) for flexible, document-oriented data storage.
  * **Logging:** **Morgan** for HTTP request logging and observability.
  * **File Handling:** **Multer** for efficient multipart form-data processing (Image Uploads).
  * **External Services:** **Apify** for location intelligence.

-----

## 📂 System Structure

The codebase follows a Monorepo-style structure for unified versioning.

```bash
├── Client/                 # Frontend SPA
│   ├── src/
│   │   ├── components/ui   # Reusable Shadcn primitives
│   │   ├── contexts/       # Global Auth State (Context API)
│   │   ├── hooks/          # Custom hooks (useAuth, useToast)
│   │   ├── lib/            # Utilities (i18n, formatting)
│   │   └── pages/          # View logic (Dashboard, Listings, Auth)
│
├── Server/                 # Backend API
│   ├── config/             # DB Connection & Cloudinary config
│   ├── controllers/        # Business Logic (Auth, Listing, User)
│   ├── middlewares/        # Guards (Auth, Role, Sanitize)
│   ├── models/             # Mongoose Schemas
│   └── routes/             # API Endpoint Definitions
```

-----

## 🚀 Key Features

### 🔐 Authentication & Security

  * Secure Sign Up/Sign In flows with JWT.
  * Protected Routes wrapper (`ProtectedRoute.tsx`) that intercepts unauthorized access on the client side.
  * Server-side middleware verification of tokens and roles.

### 🏢 Dashboard & Management

  * **Unified Dashboard:** A single dynamic interface that adapts UI elements based on the user's role (Admin vs. Owner).
  * **Listing Lifecycle:**
    1.  Owner submits listing → Status: `Pending`.
    2.  Admin reviews → Actions: `Approve` or `Reject` (with feedback note).
    3.  Owner edits active listing → Status reverts to `Pending` (Quality Control).

### 🌍 Discovery & interaction

  * Advanced filtering by Category, City, and Price Level.
  * "Favorites" system with immediate UI feedback.
  * Browsing history tracking.

-----

## ⚡ Getting Started

### Prerequisites

  * Node.js (v18+)
  * MongoDB URI
  * Apify API Key (Optional for scraping)

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/yourusername/wheretogo.git
    cd wheretogo
    ```

2.  **Install Dependencies (Root, Client, and Server)**

    ```bash
    cd Client && npm install
    cd ../Server && npm install
    ```

3.  **Environment Configuration**
    Create `.env` files in both `Client` and `Server` directories following the `.env.example`.

    **Server .env:**

    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_secure_secret
    NODE_ENV=development
    ```

    **Client .env:**

    ```env
    VITE_API_BASE_URL=http://localhost:5000/api
    ```

4.  **Run the System**

      * **Backend:** `cd Server && npm run dev`
      * **Frontend:** `cd Client && npm run dev`
