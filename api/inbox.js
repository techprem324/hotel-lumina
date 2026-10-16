const { getDatabase } = require('../lib/database');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Token');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  // Simple token protection – set ADMIN_TOKEN env var
  const adminToken = process.env.ADMIN_TOKEN;
  if (adminToken) {
    const provided = req.headers['x-admin-token'] || '';
    if (provided !== adminToken) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
  }

  try {
    const db = await getDatabase();
    if (!db) {
      return res.status(503).json({ success: false, error: 'Database unavailable.' });
    }

    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 200);
    const skip = Math.max(parseInt(url.searchParams.get('skip') || '0', 10), 0);
    const type = url.searchParams.get('type'); // 'table' | 'stay' | 'availability' | 'contact'

    const results = {};

    if (!type || type === 'table') {
      results.reservations = await db.collection('reservations')
        .find({}, { projection: { _id: 1, name: 1, email: 1, phone: 1, date: 1, time: 1, guests: 1, seatingPreference: 1, requests: 1, createdAt: 1, status: 1 } })
        .sort({ createdAt: -1 }).limit(limit).skip(skip).toArray();
    }

    if (!type || type === 'stay') {
      results.stayRequests = await db.collection('stayRequests')
        .find({}, { projection: { _id: 1, name: 1, email: 1, phone: 1, roomType: 1, checkIn: 1, checkOut: 1, guests: 1, rooms: 1, requests: 1, createdAt: 1, status: 1 } })
        .sort({ createdAt: -1 }).limit(limit).skip(skip).toArray();
    }

    if (!type || type === 'availability') {
      results.availabilitySearches = await db.collection('availabilitySearches')
        .find({}, { projection: { _id: 1, name: 1, email: 1, phone: 1, roomType: 1, checkIn: 1, checkOut: 1, guests: 1, message: 1, createdAt: 1 } })
        .sort({ createdAt: -1 }).limit(limit).skip(skip).toArray();
    }

    if (!type || type === 'contact') {
      results.inquiries = await db.collection('inquiries')
        .find({}, { projection: { _id: 1, name: 1, email: 1, phone: 1, subject: 1, message: 1, createdAt: 1 } })
        .sort({ createdAt: -1 }).limit(limit).skip(skip).toArray();
    }

    // Serialize ObjectId to string
    for (const key of Object.keys(results)) {
      results[key] = results[key].map((doc) => ({ ...doc, _id: doc._id.toString() }));
    }

    const totalCounts = {};
    if (!type || type === 'table') totalCounts.reservations = await db.collection('reservations').countDocuments();
    if (!type || type === 'stay') totalCounts.stayRequests = await db.collection('stayRequests').countDocuments();
    if (!type || type === 'availability') totalCounts.availabilitySearches = await db.collection('availabilitySearches').countDocuments();
    if (!type || type === 'contact') totalCounts.inquiries = await db.collection('inquiries').countDocuments();

    return res.status(200).json({ success: true, data: results, totals: totalCounts, limit, skip });
  } catch (error) {
    console.error('Inbox API error:', error);
    return res.status(500).json({ success: false, error: 'Unable to retrieve inbox data.' });
  }
};
