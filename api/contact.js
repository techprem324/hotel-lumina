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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const db = await connectToDatabase();

    if (req.method === 'POST') {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const inquiry = {
        name: String(data.name || '').trim(),
        email: String(data.email || '').trim(),
        phone: String(data.phone || '').trim(),
        subject: String(data.subject || '').trim(),
        message: String(data.message || '').trim(),
        createdAt: new Date()
      };

      const result = await db.collection('inquiries').insertOne(inquiry);
      return res.status(201).json({ success: true, message: 'Message sent successfully!', inquiryId: result.insertedId });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('Contact API Error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
};
