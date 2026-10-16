'use strict';

const DEFAULT_NOTIFICATION_EMAIL = 'kumar02premsri@gmail.com';
const DEFAULT_FROM_EMAIL = 'LUMINA Hotel <onboarding@resend.dev>';
const HOTEL_PHONE = '+91 93395 20358';

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);
}

function formatDatePretty(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch { return dateStr; }
}

function buildEmailHtml({ title, subtitle, badgeColor, badgeLabel, rows, note, bookingId }) {
  const rowsHtml = rows.map(([label, value]) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f0ece4;color:#7a6a52;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;width:38%;vertical-align:top">${escapeHtml(label)}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f0ece4;color:#1a2420;font-size:15px;vertical-align:top;padding-left:12px">${escapeHtml(String(value))}</td>
    </tr>`).join('');

  const refHtml = bookingId
    ? `<p style="margin:24px 0 0;text-align:center;font-size:13px;color:#9e8e72">Reference: <strong style="color:#b8945a;letter-spacing:.1em">${escapeHtml(String(bookingId).slice(-8).toUpperCase())}</strong></p>`
    : '';

  const noteHtml = note
    ? `<p style="margin:20px 0 0;padding:14px 18px;background:#faf7f1;border-left:3px solid #d0ad78;border-radius:4px;font-size:13px;color:#5a4d3a">${escapeHtml(note)}</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#f5f2ec;font-family:'Helvetica Neue',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f5f2ec;padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
        <tr><td style="background:linear-gradient(135deg,#18221e 0%,#243028 100%);padding:36px 40px;text-align:center">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:.18em;color:#d0ad78;text-transform:uppercase;font-weight:600">LUMINA &middot; New Delhi</p>
          <h1 style="margin:0;font-size:26px;font-weight:300;color:#fff;letter-spacing:.04em">${escapeHtml(title)}</h1>
          <p style="margin:8px 0 0;font-size:14px;color:#a8c4b0;font-weight:300">${escapeHtml(subtitle)}</p>
        </td></tr>
        <tr><td style="padding:0 40px">
          <span style="display:inline-block;background:${escapeHtml(badgeColor)};color:#fff;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:6px 14px;border-radius:0 0 8px 8px">${escapeHtml(badgeLabel)}</span>
        </td></tr>
        <tr><td style="padding:28px 40px">
          <table width="100%" cellpadding="0" cellspacing="0">${rowsHtml}</table>
          ${refHtml}
          ${noteHtml}
        </td></tr>
        <tr><td style="padding:0 40px 36px;text-align:center">
          <a href="https://hotel-lumina.vercel.app/admin" style="display:inline-block;background:linear-gradient(135deg,#b8945a,#d0ad78);color:#fff;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;padding:14px 32px;border-radius:6px">Open Admin Inbox</a>
        </td></tr>
        <tr><td style="background:#f5f2ec;padding:20px 40px;text-align:center;border-top:1px solid #e8e0d2">
          <p style="margin:0;font-size:12px;color:#9e8e72">LUMINA Hotel &middot; Connaught Place, New Delhi 110001<br>Direct Concierge: ${HOTEL_PHONE} &middot; ${DEFAULT_NOTIFICATION_EMAIL}</p>
          <p style="margin:8px 0 0;font-size:11px;color:#b8a88a">Automated notification from the LUMINA booking engine.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildAdminNotificationHtml({ kind, bookingId, details }) {
  const isStay = kind === 'stay';
  const rows = [
    ['Guest', details.name],
    ['Email', details.email],
    ['Phone', details.phone],
    ...(isStay ? [
      ['Room Type', details.roomType],
      ['Check-in', formatDatePretty(details.checkIn)],
      ['Check-out', formatDatePretty(details.checkOut)],
      ['Guests', details.guests],
      ['Rooms', details.rooms],
    ] : [
      ['Date', formatDatePretty(details.date)],
      ['Time', details.time],
      ['Guests', details.guests],
      ['Seating', details.seatingPreference],
    ]),
    ...(details.requests ? [['Special Requests', details.requests]] : []),
  ];
  return buildEmailHtml({
    title: isStay ? 'New Stay Request' : 'New Table Reservation',
    subtitle: `A new ${isStay ? 'room stay' : 'table reservation'} was just submitted on LUMINA.`,
    badgeColor: isStay ? '#2d6a4f' : '#7a4419',
    badgeLabel: isStay ? 'Room Request' : 'Table Reservation',
    rows, bookingId,
  });
}

function buildAvailabilityAlertHtml({ details, alertId }) {
  const rows = [
    ['Guest Name', details.name],
    ['Email', details.email],
    ['Phone', details.phone || '—'],
    ['Room Type', details.roomType || 'Any room'],
    ['Check-in', formatDatePretty(details.checkIn)],
    ['Check-out', formatDatePretty(details.checkOut)],
    ['Guests', `${details.guests || 1} guest(s)`],
    ...(details.message ? [['Guest Note', details.message]] : []),
  ];
  return buildEmailHtml({
    title: 'Availability Search Alert',
    subtitle: 'A prospective guest searched for room availability on LUMINA.',
    badgeColor: '#1a5276',
    badgeLabel: 'Availability Search',
    rows,
    bookingId: alertId,
    note: `Contact this guest immediately at ${details.phone || details.email} to confirm available dates and secure the reservation.`,
  });
}

async function sendBookingNotification({ kind, bookingId, details }) {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.BOOKING_NOTIFICATION_EMAIL || DEFAULT_NOTIFICATION_EMAIL;
  const from = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL;

  if (!apiKey) {
    return { sent: false, reason: 'Email notifications are not configured (RESEND_API_KEY is missing).' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail) || /[\r\n]/.test(from)) {
    return { sent: false, reason: 'Email notification recipient or sender configuration is invalid.' };
  }

  const isStay = kind === 'stay';
  const label = isStay ? 'Stay request' : 'Table reservation request';
  const shortRef = bookingId ? ` #${String(bookingId).slice(-8).toUpperCase()}` : '';

  const plainLines = [
    `LUMINA ${label}${shortRef}`.trim(),
    '',
    `Name: ${details.name}`,
    `Email: ${details.email}`,
    `Phone: ${details.phone}`,
    ...(isStay ? [
      `Room: ${details.roomType}`,
      `Check-in: ${details.checkIn}`,
      `Check-out: ${details.checkOut}`,
      `Guests: ${details.guests}`,
      `Rooms: ${details.rooms}`,
    ] : [
      `Date: ${details.date}`,
      `Time: ${details.time}`,
      `Guests: ${details.guests}`,
      `Seating preference: ${details.seatingPreference}`,
    ]),
    ...(details.requests ? ['', `Special requests: ${details.requests}`] : []),
  ];

  const html = buildAdminNotificationHtml({ kind, bookingId, details });

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [adminEmail],
        reply_to: details.email,
        subject: `LUMINA ${label}${shortRef}`,
        text: plainLines.join('\n'),
        html,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response || !response.ok) {
      const status = response ? response.status : 'unknown';
      console.error(`Booking email provider returned HTTP ${status}.`);
      return { sent: false, reason: 'Email provider rejected the notification.' };
    }

    return { sent: true };
  } catch (error) {
    console.error('Booking email delivery failed:', error);
    return { sent: false, reason: 'Email delivery failed.' };
  }
}

async function sendAvailabilityAlert({ details, alertId }) {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.BOOKING_NOTIFICATION_EMAIL || DEFAULT_NOTIFICATION_EMAIL;
  const from = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL;

  if (!apiKey) {
    return { sent: false, reason: 'Email notifications are not configured (RESEND_API_KEY is missing).' };
  }

  const plainLines = [
    `LUMINA Availability Search Alert${alertId ? ` #${String(alertId).slice(-8).toUpperCase()}` : ''}`,
    '',
    `Guest: ${details.name}`,
    `Email: ${details.email}`,
    `Phone: ${details.phone || '—'}`,
    `Room: ${details.roomType || 'Any room'}`,
    `Check-in: ${details.checkIn}`,
    `Check-out: ${details.checkOut}`,
    `Guests: ${details.guests || 1}`,
    ...(details.message ? ['', `Note: ${details.message}`] : []),
  ];

  const html = buildAvailabilityAlertHtml({ details, alertId });

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [adminEmail],
        reply_to: details.email,
        subject: `LUMINA Availability Search from ${details.name}`,
        text: plainLines.join('\n'),
        html,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response || !response.ok) {
      return { sent: false, reason: 'Email provider rejected the notification.' };
    }

    return { sent: true };
  } catch (error) {
    console.error('Availability alert email failed:', error);
    return { sent: false, reason: 'Email delivery failed.' };
  }
}

module.exports = { sendBookingNotification, sendAvailabilityAlert };
