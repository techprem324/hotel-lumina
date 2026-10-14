'use strict';

const DEFAULT_NOTIFICATION_EMAIL = 'kumar02premsri@gmail.com';
const DEFAULT_FROM_EMAIL = 'LUMINA Bookings <onboarding@resend.dev>';

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

async function sendBookingNotification({ kind, bookingId, details }) {
  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.BOOKING_NOTIFICATION_EMAIL || DEFAULT_NOTIFICATION_EMAIL;
  const sender = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL;
  if (!apiKey) return { sent: false, reason: 'Email notifications are not configured (RESEND_API_KEY is missing).' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient) || /[\r\n]/.test(sender)) {
    return { sent: false, reason: 'Email notification recipient or sender configuration is invalid.' };
  }

  const label = kind === 'stay' ? 'Stay request' : 'Table reservation request';
  const lines = [
    `${label} ${bookingId ? `#${bookingId}` : ''}`.trim(),
    '',
    `Name: ${details.name}`,
    `Email: ${details.email}`,
    `Phone: ${details.phone}`,
    ...(kind === 'stay'
      ? [
          `Room: ${details.roomType}`,
          `Check-in: ${details.checkIn}`,
          `Check-out: ${details.checkOut}`,
          `Guests: ${details.guests}`,
          `Rooms: ${details.rooms}`,
        ]
      : [
          `Date: ${details.date}`,
          `Time: ${details.time}`,
          `Guests: ${details.guests}`,
          `Seating preference: ${details.seatingPreference}`,
        ]),
    ...(details.requests ? ['', `Special requests: ${details.requests}`] : []),
  ];
  const text = lines.join('\n');
  const html = `<pre style="font:15px/1.6 Arial,sans-serif;white-space:pre-wrap">${escapeHtml(text)}</pre>`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: sender,
        to: [recipient],
        subject: `LUMINA ${label}${bookingId ? ` #${bookingId}` : ''}`,
        text,
        html,
        reply_to: details.email,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.error(`Booking email provider returned HTTP ${response.status}.`);
      return { sent: false, reason: 'Email provider rejected the notification.' };
    }
    return { sent: true };
  } catch (error) {
    console.error('Booking email delivery failed:', error);
    return { sent: false, reason: 'Email delivery failed.' };
  }
}

module.exports = { sendBookingNotification };
