const test = require('node:test');
const assert = require('node:assert/strict');
const { sendBookingNotification } = require('../lib/booking-notification');

const originalApiKey = process.env.RESEND_API_KEY;
const originalRecipient = process.env.BOOKING_NOTIFICATION_EMAIL;
const originalSender = process.env.RESEND_FROM_EMAIL;
const originalFetch = global.fetch;

test.after(() => {
  if (originalApiKey === undefined) delete process.env.RESEND_API_KEY;
  else process.env.RESEND_API_KEY = originalApiKey;
  if (originalRecipient === undefined) delete process.env.BOOKING_NOTIFICATION_EMAIL;
  else process.env.BOOKING_NOTIFICATION_EMAIL = originalRecipient;
  if (originalSender === undefined) delete process.env.RESEND_FROM_EMAIL;
  else process.env.RESEND_FROM_EMAIL = originalSender;
  global.fetch = originalFetch;
});

test('reports missing email credentials without attempting delivery', async () => {
  delete process.env.RESEND_API_KEY;
  let attempted = false;
  global.fetch = async () => {
    attempted = true;
    throw new Error('Unexpected email call');
  };

  const result = await sendBookingNotification({
    kind: 'table',
    bookingId: 'test-123',
    details: { name: 'Test Guest', email: 'guest@example.com', phone: '1234567890' },
  });

  assert.equal(result.sent, false);
  assert.match(result.reason, /RESEND_API_KEY/);
  assert.equal(attempted, false);
});

test('sends a table request notification to the configured owner inbox', async () => {
  process.env.RESEND_API_KEY = 'unit-test-key';
  process.env.BOOKING_NOTIFICATION_EMAIL = 'owner@example.com';
  process.env.RESEND_FROM_EMAIL = 'LUMINA <bookings@example.com>';
  let request;
  global.fetch = async (url, options) => {
    request = { url, options, body: JSON.parse(options.body) };
    return { ok: true, status: 200 };
  };

  const result = await sendBookingNotification({
    kind: 'table',
    bookingId: 'table-123',
    details: {
      name: 'Guest',
      email: 'guest@example.com',
      phone: '+91 98765 43210',
      date: '2026-10-20',
      time: '19:00',
      guests: 2,
      seatingPreference: 'Window table',
      requests: '<script>alert(1)</script>',
    },
  });

  assert.equal(result.sent, true);
  assert.equal(request.url, 'https://api.resend.com/emails');
  assert.equal(request.options.headers.Authorization, 'Bearer unit-test-key');
  assert.deepEqual(request.body.to, ['owner@example.com']);
  assert.equal(request.body.reply_to, 'guest@example.com');
  assert.match(request.body.text, /Window table/);
  assert.doesNotMatch(request.body.html, /<script>/);
  assert.match(request.body.html, /&lt;script&gt;/);
});

test('reports provider failures without treating the notification as sent', async () => {
  process.env.RESEND_API_KEY = 'unit-test-key';
  global.fetch = async () => ({ ok: false, status: 403 });

  const result = await sendBookingNotification({
    kind: 'stay',
    bookingId: 'stay-123',
    details: { name: 'Guest', email: 'guest@example.com', phone: '1234567890' },
  });

  assert.equal(result.sent, false);
  assert.match(result.reason, /provider rejected/);
});
