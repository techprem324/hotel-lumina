# 🌟 LUMINA — Celestial Fine Dining Platform

> **Where Royal Culinary Masterpieces Meet Cutting-Edge Automation**

[![Live Vercel Platform](https://img.shields.io/badge/Vercel-Live%20Platform-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://hotel-lumina-m.vercel.app/)

---

## 🌐 Production Live Deployment

👉 **[Lumina Live Platform](https://hotel-lumina-m.vercel.app/)**

---

## 📊 System Architecture & Workflow

```mermaid
flowchart TD
    subgraph Client ["FOH Client Layer"]
        A["🌐 Guest Browser"] -->|Navigates Pages| B["📄 Multi-Page HTML5 / CSS3 / JS"]
        B --> C["📅 Table Reservation Form"]
        B --> D["📩 Host Desk Inquiry Form"]
    end

    subgraph Edge ["Vercel Edge Platform"]
        B -->|Static CDN Hosting| E["⚡ Vercel Edge Network"]
        C -->|POST /api/reservations| F["λ Serverless Booking Function"]
        D -->|POST /api/contact| G["λ Serverless Contact Function"]
    end

    subgraph Database ["Cloud Database Layer"]
        F -->|Bson Insert| H[("🍃 MongoDB Atlas<br/>lumina_db.reservations")]
        G -->|Bson Insert| I[("🍃 MongoDB Atlas<br/>lumina_db.inquiries")]
    end
```

---

## 🔁 Reservation & Order Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Guest as 👤 Diner
    participant UI as 🖥️ Lumina Client UI
    participant API as ⚡ Vercel API (/api/reservations)
    participant DB as 🍃 MongoDB Atlas (lumina_db)

    Guest->>UI: Select Date, Time, Party & Seating Zone
    Guest->>UI: Submit Booking Request
    UI->>API: POST /api/reservations (JSON Payload)
    alt MongoDB Online
        API->>DB: insertOne(reservation)
        DB-->>API: { insertedId }
        API-->>UI: 201 Created (Booking Ref #ID)
    else DB Offline Fallback
        API-->>UI: 201 Created (Local Booking Ref)
    end
    UI-->>Guest: 🎉 Interactive Confirmation & Ref Badge
```

---

## 💻 Tech Stack Summary

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | HTML5, CSS3, ES6+ JS | Multi-page, glassmorphic UI, responsive layouts |
| **Typography** | Google Fonts (*Playfair Display*, *Inter*) | Premium fine-dining serif & sans-serif fonts |
| **Edge Serverless** | Vercel Serverless Functions | Node.js microservices for API routes |
| **Local Engine** | Node.js (`server.js`) | Standalone HTTP server for offline testing |
| **Database** | MongoDB Atlas | Cloud NoSQL persistence for reservations & inquiries |
| **Icons & Assets** | SVG Vectors & Unsplash HD CDN | High-res culinary photography with safe image fallbacks |

---

## 🗺️ Page Routes & Features

| Page | File | Core Functionality |
| :--- | :--- | :--- |
| **Home** | `index.html` | Hero carousel, 5 Master Cuisines, Chef's Signatures, VIP Seating Map, Reservation Widget |
| **Menu** | `menu.html` | Live search, category tabs, dietary filter pills (*Veg*, *Halal*, *GF*), spice meters, wine pairings |
| **Gallery** | `gallery.html` | 360° architectural photos (Dining Hall, Alfresco, Velvet Bar, Salons) with Lightbox viewer |
| **Contact** | `contact.html` | Host desk form, direct phone, operating hours, valet parking policy, dress code FAQ accordion |

---

## 🔌 API Endpoints Reference

| Endpoint | Method | Input Parameters | Output Response |
| :--- | :--- | :--- | :--- |
| `/api/reservations` | `POST` | `name`, `email`, `phone`, `guests`, `date`, `time`, `requests` | `{ success: true, bookingId, reservation }` |
| `/api/reservations` | `GET` | None | `{ success: true, count, reservations: [] }` |
| `/api/contact` | `POST` | `name`, `email`, `phone`, `subject`, `message` | `{ success: true, inquiryId }` |

---

## 🔑 Environment Variables Configuration

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `MONGODB_URI` | MongoDB Atlas Connection String | `mongodb+srv://user:pass@cluster.mongodb.net/lumina_db` |
| `PORT` | Local Server Port | `8123` |

---

## ⚡ Local Setup Commands

```bash
# 1. Clone repository
git clone https://github.com/techprem324/hotel-lumina.git
cd hotel-lumina

# 2. Install dependencies
npm install

# 3. Start local development server (Port 8123)
npm start
```

---

## 📜 License

Created for **LUMINA Fine Dining & Lounge** — All Rights Reserved.
