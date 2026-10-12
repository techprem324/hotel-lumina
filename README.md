# LUMINA — Celestial Fine Dining Platform
 
> Where royal culinary masterpieces meet cutting-edge automation.
 
[![Live Vercel Platform](https://img.shields.io/badge/Vercel-Live%20Platform-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://hotel-lumina-m.vercel.app/)
 
**Live Demo:** [Lumina Live Platform](https://hotel-lumina-m.vercel.app/)
 
---
 
## Overview
 
LUMINA is a multi-page fine-dining website with table reservations and a host desk inquiry form. The frontend is served from Vercel's edge network, and bookings and inquiries are stored in MongoDB Atlas through serverless API routes.
 
---
 
## Architecture
 
```mermaid
flowchart LR
    A["Guest Browser"] --> B["Static Frontend<br/>HTML5 / CSS3 / JS"]
    B -->|POST /api/reservations| C["Serverless Function"]
    B -->|POST /api/contact| D["Serverless Function"]
    C --> E[("MongoDB Atlas<br/>reservations")]
    D --> F[("MongoDB Atlas<br/>inquiries")]
```
 
**Reservation flow:** the guest selects date, time, party size and seating zone, then submits the form. The API stores the booking in MongoDB and returns a booking reference. If the database is offline, a local reference is returned as a fallback.
 
---
 
## Tech Stack
 
| Layer | Technology |
| :--- | :--- |
| Frontend | HTML5, CSS3, ES6+ JavaScript |
| Typography | Google Fonts (Playfair Display, Inter) |
| Backend | Vercel Serverless Functions (Node.js) |
| Local Server | Node.js (`server.js`) |
| Database | MongoDB Atlas |
| Assets | SVG vectors, Unsplash CDN with image fallbacks |
 
---
 
## Pages
 
| Page | File | Features |
| :--- | :--- | :--- |
| Home | `index.html` | Hero carousel, signature cuisines, VIP seating map, reservation widget |
| Menu | `menu.html` | Live search, category tabs, dietary filters (Veg, Halal, GF), spice meters, wine pairings |
| Gallery | `gallery.html` | 360° venue photos with lightbox viewer |
| Contact | `contact.html` | Inquiry form, phone, opening hours, valet and dress code FAQ |
 
---
 
## API Reference
 
| Endpoint | Method | Input | Response |
| :--- | :--- | :--- | :--- |
| `/api/reservations` | `POST` | `name`, `email`, `phone`, `guests`, `date`, `time`, `requests` | `{ success, bookingId, reservation }` |
| `/api/reservations` | `GET` | None | `{ success, count, reservations }` |
| `/api/contact` | `POST` | `name`, `email`, `phone`, `subject`, `message` | `{ success, inquiryId }` |
 
---
 
## Environment Variables
 
| Variable | Description | Example |
| :--- | :--- | :--- |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/lumina_db` |
| `PORT` | Local server port | `8123` |
 
---
 
## Getting Started
 
```bash
git clone https://github.com/techprem324/hotel-lumina.git
cd hotel-lumina
npm install
npm start   # runs on port 8123
```
 
---
 
## License
 
Created for **LUMINA Fine Dining & Lounge** — All Rights Reserved.
