const { getDatabase } = require('../lib/database');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  let data;
  try {
    data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ success: false, error: 'Invalid JSON request body.' });
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return res.status(400).json({ success: false, error: 'Invalid message details.' });
  }

  const inquiry = {
    name: typeof data.name === 'string' ? data.name.trim() : '',
    email: typeof data.email === 'string' ? data.email.trim().toLowerCase() : '',
    phone: typeof data.phone === 'string' ? data.phone.trim() : '',
    subject: typeof data.subject === 'string' ? data.subject.trim() : '',
    message: typeof data.message === 'string' ? data.message.trim() : '',
  };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.email)
      || inquiry.name.length > 100
      || inquiry.subject.length < 3 || inquiry.subject.length > 120
      || inquiry.message.length < 3 || inquiry.message.length > 3000
      || (inquiry.name && inquiry.name.length < 2)
      || inquiry.phone.length > 30) {
    return res.status(400).json({ success: false, error: 'Please provide valid contact details and a message.' });
  }

  try {
    const db = await getDatabase();
    if (!db) {
      return res.status(503).json({
        success: false,
        error: 'Messaging is temporarily unavailable. Please contact our concierge by phone.',
      });
    }
    const result = await db.collection('inquiries').insertOne({ ...inquiry, createdAt: new Date() });
    return res.status(201).json({
      success: true,
      message: 'Message received. Our team will be in touch.',
      inquiryId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error('Contact API error:', error);
    return res.status(500).json({ success: false, error: 'Unable to save your message. Please try again.' });
  }
};
