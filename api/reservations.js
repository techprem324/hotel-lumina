const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db('lumina_db');
  cachedDb = db;
  return db;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const db = await connectToDatabase();

    if (req.method === 'GET') {
      const list = await db.collection('reservations').find().sort({ createdAt: -1 }).toArray();
      return res.status(200).json({ success: true, count: list.length, reservations: list });
    }

    if (req.method === 'POST') {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      if (!data.name || !data.email || !data.phone || !data.guests || !data.date || !data.time) {
        return res.status(400).json({ success: false, error: 'Missing required reservation fields.' });
      }

      const reservation = {
        name: String(data.name).trim(),
        email: String(data.email).trim(),
        phone: String(data.phone).trim(),
        guests: String(data.guests),
        date: String(data.date),
        time: String(data.time),
        requests: String(data.requests || '').trim(),
        createdAt: new Date(),
        status: 'confirmed'
      };

      const result = await db.collection('reservations').insertOne(reservation);
      return res.status(201).json({
        success: true,
        message: 'Reservation booked successfully!',
        bookingId: result.insertedId,
        reservation
      });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
};
