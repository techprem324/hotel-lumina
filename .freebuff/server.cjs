require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const http = require('http');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 8123;
const ROOT = path.join(__dirname, '..');

let db = null;
let client = null;

// Connect to MongoDB Atlas
async function connectDB() {
  if (db) return db;
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db('lumina_db');
    console.log('✅ Connected securely to MongoDB Atlas (lumina_db)');
    return db;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    return null;
  }
}

// Ensure initial connection attempt
connectDB();

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const urlPath = req.url.split('?')[0];

  // API endpoint: POST /api/reservations
  if (req.method === 'POST' && urlPath === '/api/reservations') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        if (!data.name || !data.email || !data.phone || !data.guests || !data.date || !data.time) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Missing required reservation fields.' }));
          return;
        }

        const database = await connectDB();
        if (!database) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Database connection failure.' }));
          return;
        }

        const reservation = {
          name: data.name.trim(),
          email: data.email.trim(),
          phone: data.phone.trim(),
          guests: data.guests,
          date: data.date,
          time: data.time,
          requests: (data.requests || '').trim(),
          createdAt: new Date(),
          status: 'confirmed'
        };

        const result = await database.collection('reservations').insertOne(reservation);
        
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Reservation booked successfully!',
          bookingId: result.insertedId,
          reservation
        }));
      } catch (err) {
        console.error('Reservation error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Failed to process reservation.' }));
      }
    });
    return;
  }

  // API endpoint: GET /api/reservations
  if (req.method === 'GET' && urlPath === '/api/reservations') {
    try {
      const database = await connectDB();
      if (!database) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Database unavailable' }));
        return;
      }
      const list = await database.collection('reservations').find().sort({ createdAt: -1 }).toArray();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, count: list.length, reservations: list }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // API endpoint: POST /api/contact
  if (req.method === 'POST' && urlPath === '/api/contact') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const database = await connectDB();
        if (!database) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Database unavailable' }));
          return;
        }

        const inquiry = {
          name: (data.name || '').trim(),
          email: (data.email || '').trim(),
          phone: (data.phone || '').trim(),
          subject: (data.subject || '').trim(),
          message: (data.message || '').trim(),
          createdAt: new Date()
        };

        const result = await database.collection('inquiries').insertOne(inquiry);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Message sent successfully!', inquiryId: result.insertedId }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Failed to record message.' }));
      }
    });
    return;
  }

  // Static File Server
  let file = path.join(ROOT, decodeURIComponent(urlPath));
  if (file.endsWith('/') || file.endsWith(path.sep)) file += 'index.html';
  if (!file.startsWith(ROOT)) {
    res.writeHead(403).end();
    return;
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404).end('404 Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 LUMINA Server with MongoDB running at http://127.0.0.1:${PORT}`);
});
