# LUMINA — Celestial Fine Dining Platform

A modern, ultra-luxurious, and responsive multi-page web application designed for **LUMINA**, an elite fine-dining establishment serving Royal Awadhi & Mughlai, Contemporary European, Pan-Asian Haute Cuisine, Artisanal Patisserie, and Bespoke Mixology.

---

## 🌐 Live Public Deployment

The live application is hosted globally on Vercel Edge Infrastructure:

👉 **Live Public URL**: [https://ht-gules.vercel.app](https://ht-gules.vercel.app)

---

## 🌟 Architectural Features & Highlights

### 1. 🏛️ Multi-Page Luxury Experience
* **Home (`index.html`)**: Cinematic Hero Banner, "Three Decades of Culinary Mastery" Story, 5 Master Cuisine Disciplines, Signature Dish Showcase, Table Reservation Form, Gallery Preview, Reviews, Multi-Location Salons, and Footer.
* **Menu (`menu.html`)**: Full categorized menu (Appetizers, Royal Mughlai, European, Pan-Asian, Artisanal Breads, Desserts, Mixology) with live search, dietary filters (*Veg*, *Non-Veg*, *Halal*, *Gluten-Free*, *Chef's Special*), spice meters, and wine pairing advice.
* **Gallery (`gallery.html`)**: Interactive 360° architectural gallery showcasing the Grand Imperial Dining Hall, Sunset Alfresco Terrace, The Velvet Bar, Private Vaults, and Live Kitchen, complete with full-screen Lightbox image viewer.
* **Contact (`contact.html`)**: Host desk contact form, direct hotline, operational hours breakdown, white-glove valet guidelines, dress code rules, and interactive FAQ accordion.

### 2. ⚡ Serverless API & Dual-Mode Backend
* **Vercel Serverless Functions (`/api/*`)**:
  * `POST /api/reservations`: Processes guest table bookings, validates party size, date/time, seating area, and stores records securely in **MongoDB Atlas** (`lumina_db.reservations`).
  * `GET /api/reservations`: Retrieves confirmed reservation ledgers for management inspection.
  * `POST /api/contact`: Processes guest inquiries and saves records in `lumina_db.inquiries`.
* **Local Node.js Engine (`server.js`)**: Standalone local HTTP server with MongoDB Atlas auto-reconnection and static asset serving on port 8123.

### 3. 🎨 Design Aesthetics & Typography
* **Color Palette**: Obsidian Charcoal (`#0B0B0F`), Signature Warm Gold (`#D4AF37`), Luxury Bronze (`#C59963`), and Champagne Velvet.
* **Typography**: *Playfair Display* & *Cormorant Garamond* for serif headers paired with *Inter* and *Montserrat* for body text.
* **Interactive UI**: Glassmorphic cards, gold shimmer CTA buttons, dynamic scroll progress indicators, and toast notifications.

---

## 📁 Repository Directory Structure

```
d:/ht/
├── index.html                    # Homepage (Hero, Story, Cuisines, Signatures, Booking)
├── menu.html                     # Full Menu Explorer with Live Search & Dietary Filters
├── gallery.html                  # 360° Architectural Ambiance Gallery with Lightbox Viewer
├── contact.html                  # Host Desk Contact Form & Interactive FAQ Accordion
├── favicon.svg                   # Brand Favicon Insignia
├── robots.txt                    # Search Engine Crawler Directives
├── sitemap.xml                   # Search Engine Indexing Sitemap
├── package.json                  # Scripts & Unified Dependencies
├── vercel.json                   # Vercel Production Deployment Settings
├── server.js                     # Local Node.js HTTP Server & MongoDB Integration
├── css/
│   └── styles.css                # Custom Luxury Styling, Glassmorphism, Gold Gradients
├── js/
│   ├── main.js                   # Navigation, Modal Handlers, Lightbox & Mobile Drawer
│   ├── reservation.js            # Table Reservation Form Validation & API Dispatch
│   └── menu.js                   # Real-Time Menu Search & Filter Engine
└── api/
    ├── reservations.js           # Serverless API Endpoint for Table Bookings
    └── contact.js                # Serverless API Endpoint for Concierge Inquiries
```

---

## 🛠️ Local Development Setup

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org) (v18+) installed.

### 2. Installation
```bash
# Navigate to the project directory
cd d:/ht

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file at the root of `d:/ht`:
```env
PORT=8123
MONGODB_URI=mongodb+srv://anshusrvstva78kumar99_db_user:Wg8Vyer8TSEsgMev@cluster0.olk9657.mongodb.net/lumina_db?retryWrites=true&w=majority
```

### 4. Running the Application
* **Start Local Development Server**:
  ```bash
  npm start
  ```
  Open your browser to `http://localhost:8123` to interact with the live website.

---

## 🚀 Vercel Production Deployment

To publish updates to Vercel:

```bash
# Trigger production deployment via Vercel CLI
npx vercel --prod
```

Or connect the repository directly in your **[Vercel Dashboard](https://vercel.com/new)**. Vercel automatically detects `vercel.json` and builds the static pages alongside serverless API functions in `/api`.

---

## 📜 License & Credits

Created for **LUMINA Fine Dining & Lounge** — All Rights Reserved.
