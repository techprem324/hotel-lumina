# LUMINA | Next-Gen Restaurant Operating System (Restaurant OS)

LUMINA is a next-generation fine dining platform that merges high-end atmospheric UI/UX design with startup-level business automation workflows. Built on the custom **Midnight Reserve** dark theme, it functions as a comprehensive Restaurant OS—combining customer-facing interfaces, interactive seat selections, AI sommeliers, and operational dashboards.

---

## 🌐 Production Live Deployment

The frontend application is deployed and live at:  
👉 **[Lumina Live Platform](https://lumina-restaurant-os.vercel.app)**

---

## 🏗️ Technical Architecture & Features Overview

Lumina Restaurant OS is designed on a modular three-tier architecture:

```
[ Frontend Client ] ──( HTTPS / WebSockets )──► [ Express API Server ] ──┬──( SQL Queries )──► [ PostgreSQL Database ]
   (Vercel SPA)                                     (Render Docker)      │                        (Supabase/Neon)
                                                                         └──( Mongoose )──────► [ MongoDB Atlas ]
                                                                                                  (Bookings Database)
```

### Architectural Modules
1. **Frontend (FOH client)**: High-performance single-page architecture built with custom HSL theme variables, SVG seating maps, and reactive Canvas background particles.
2. **Backend (API Server)**: Node.js Express server routing table bookings, inventory reorders, and CRM search queries. Handles real-time progression push alerts using **Socket.io** and automatic email notifications via **Nodemailer**.
3. **Database Layer**: Dual-persistence architecture. Uses a **PostgreSQL** schema for relational transactions (tables, menu items, orders, CRM profiles) and **MongoDB Atlas** for table booking persistence.

---

## 🌌 Key Capabilities & Features

### 1. Customer Experience (FOH)
* **Atmospheric Vibe Selector Dial**: Allows guests to rotate and align the website menu, UI accents, and atmosphere with their evening's intent (*Seductive & Moody*, *Fresh & Energizing*, *Intimate & Romantic*, *Late-Night Social*).
* **Interactive Seating Map**: An interactive vector map showing real-time table configurations. Guests can click and book their exact dining zone (Window, Main Hall, Patio, Lounge).
* **AI Virtual Sommelier**: A reserve cellar chatbot assistant that suggests matching vintage wines in real-time based on active items in the cart.
* **Shopping Cart & Checkout Integration**: Fully responsive basket drawer with mock Stripe/UPI checkout integration.

### 2. Startup Business Operations (BOH)
* **Guest CRM Profile Lookup**: Allows managers to search guest profiles by name to retrieve previous visit counts, allergen alerts, and cellar preferences.
* **Smart Waitlist Allocation**: Seating table mapping with an AI automated assignment button that text-notifies guests via SMS when their table is ready.
* **AI Demand Forecasting**: Visual chart tracking hourly peak demand to automate inventory prep and staff scheduling.
* **Supply Chain Alert Engine**: Automated alerts notifying staff when high-value reserve stock (e.g. Alba White Truffles) runs low, with a one-click restock purchase trigger.

---

## 📁 Repository Directory Structure

```
├── docs/                      # Technical Design & Specifications
│   ├── sitemap.md             # Navigation layouts & routes
│   ├── user_flows.md          # Checkout, reservation, & waitlist flows
│   ├── design_system.md       # Color tokens, typography, & states
│   ├── component_architecture.md # Next.js/React layout design
│   ├── backend_architecture.md  # Express API endpoints & Sockets
│   └── testing_strategy.md    # Security, JWT, rate-limits & CI/CD
│
├── database/                  # SQL Relational Storage Layer
│   ├── schema.sql             # PostgreSQL tables definition
│   └── seed.sql               # Seed data (items, tables, users, CRM profiles)
│
├── backend/                   # REST & Websocket API Server
│   ├── server.js              # Express API endpoints & Socket.io
│   └── Dockerfile             # Production container settings
│
├── frontend/                  # Responsive Bento Client
│   ├── index.html             # Bento layout shell
│   ├── index.css              # Custom variables & transitions
│   ├── app.js                 # Seating maps, mood filters, & socket links
│   └── vercel.json            # Vercel static routing configurations
│
└── package.json               # Root scripts & unified dependencies
```

---

## 🛠️ Local Development Setup

To run the full Lumina platform (frontend + backend API) locally:

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org) installed on your machine.

### 2. Installation & Configuration
1. Clone the repository and install dependencies at the root folder:
   ```bash
   npm install
   ```
2. Create a `.env` file at the root of the project with your database and email credentials:
   ```env
   # MongoDB Atlas Connection URI
   MONGODB_URI=mongodb+srv://anshusrvstva78kumar99_db_user:Wg8Vyer8TSEsgMev@cluster0.olk9657.mongodb.net/lumina_db?retryWrites=true&w=majority

   # Nodemailer SMTP Email Credentials (Gmail App Password)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_gmail_app_password
   ```

### 3. Run Development Servers
Open two terminal windows:

* **Start the Express API Backend (Port 5000)**:
  ```bash
  npm run dev:backend
  ```
* **Start the Frontend Web Server (Port 3000)**:
  ```bash
  npm run dev:frontend
  ```

Open your browser to `http://localhost:3000` to interact with the platform.

---

## 🚀 Live Production Deployments

The Lumina digital experience is hosted globally on edge network infrastructure:

* 🌐 **Production URL**: [https://lumina-restaurant-os.vercel.app](https://lumina-restaurant-os.vercel.app)
* 🔗 **Direct Deployment URL**: [https://lumina-restaurant-k2514m4ep-dev-prem.vercel.app](https://lumina-restaurant-k2514m4ep-dev-prem.vercel.app)
