const { getDatabase } = require('../lib/database');
const { sendAvailabilityAlert } = require('../lib/booking-notification');

// Validate a date string YYYY-MM-DD
function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

function isTodayOrLater(value) {
  return isValidDate(value) && value >= new Date().toISOString().slice(0, 10);
}

const ROOM_TYPES = new Set(['Classic Room', 'Deluxe Room', 'LUMINA Suite', '']);

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
    return res.status(400).json({ success: false, error: 'Invalid request body.' });
  }

  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
  const phone = typeof data.phone === 'string' ? data.phone.trim() : '';
  const roomType = typeof data.roomType === 'string' ? data.roomType.trim() : '';
  const checkIn = typeof data.checkIn === 'string' ? data.checkIn.trim() : '';
  const checkOut = typeof data.checkOut === 'string' ? data.checkOut.trim() : '';
  const message = typeof data.message === 'string' ? data.message.trim().slice(0, 500) : '';
  const guests = Number(data.guests) || 1;

  if (name.length < 2 || name.length > 100) {
    return res.status(400).json({ success: false, error: 'Please provide a valid name.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
  }
  if (!isTodayOrLater(checkIn)) {
    return res.status(400).json({ success: false, error: 'Please provide a valid check-in date.' });
  }
  if (!isValidDate(checkOut) || checkOut <= checkIn) {
    return res.status(400).json({ success: false, error: 'Check-out must be after check-in.' });
  }
  if (!ROOM_TYPES.has(roomType)) {
    return res.status(400).json({ success: false, error: 'Please select a valid room type.' });
  }

  const details = { name, email, phone, roomType: roomType || 'Any room', checkIn, checkOut, guests, message };

  try {
    const db = await getDatabase();
    let alertId = null;

    if (db) {
      const record = { ...details, createdAt: new Date(), type: 'availability_search' };
      const result = await db.collection('availabilitySearches').insertOne(record);
      alertId = result.insertedId.toString();
    }

    const notification = await sendAvailabilityAlert({ details, alertId });

    return res.status(200).json({
      success: true,
      message: notification.sent
        ? 'Availability search recorded. Our team has been notified and will contact you about available rooms.'
        : 'Availability search recorded. Our team will review your request shortly.',
      alertId,
      notificationSent: notification.sent,
      ...(notification.sent ? {} : { notificationWarning: notification.reason }),
    });
  } catch (error) {
    console.error('Availability search error:', error);
    return res.status(500).json({ success: false, error: 'Unable to process your request. Please try again.' });
  }
};
