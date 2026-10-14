const { getDatabase } = require('../lib/database');
const { normalizeTableReservation } = require('../lib/booking-validation');
const { sendBookingNotification } = require('../lib/booking-notification');

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
    return res.status(400).json({ success: false, error: 'Invalid reservation details.' });
  }

  const reservation = normalizeTableReservation(data);
  if (!reservation) {
    return res.status(400).json({ success: false, error: 'Please provide valid reservation details.' });
  }

  try {
    const db = await getDatabase();
    if (!db) {
      return res.status(503).json({
        success: false,
        error: 'Online booking is temporarily unavailable. Please call our concierge.',
      });
    }

    const record = { ...reservation, createdAt: new Date(), status: 'pending' };
    const result = await db.collection('reservations').insertOne(record);
    const bookingId = result.insertedId.toString();
    const notification = await sendBookingNotification({ kind: 'table', bookingId, details: reservation });
    return res.status(201).json({
      success: true,
      message: notification.sent
        ? 'Reservation request received and email notification sent.'
        : 'Reservation request saved, but the email notification could not be sent.',
      bookingId,
      notificationSent: notification.sent,
      ...(notification.sent ? {} : { notificationWarning: notification.reason }),
      reservation: record,
    });
  } catch (error) {
    console.error('Reservation API error:', error);
    return res.status(500).json({ success: false, error: 'Unable to save your request. Please try again.' });
  }
};
