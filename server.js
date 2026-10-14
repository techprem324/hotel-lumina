require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const { getDatabase } = require('./lib/database');
const { sendBookingNotification } = require('./lib/booking-notification');
const { normalizeTableReservation, normalizeStayRequest } = require('./lib/booking-validation');

const PORT = process.env.PORT || 8123;
const ROOT = __dirname;
const MAX_BODY_LENGTH = 1024 * 1024;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

const PAGES = {
  '/': 'index.html',
  '/about': 'about.html',
  '/stay': 'stay.html',
  '/menu': 'menu.html',
  '/gallery': 'gallery.html',
  '/contact': 'contact.html',
  '/reserve': 'reserve.html',
  '/book': 'reserve.html',
};

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    let tooLarge = false;
    req.on('data', (chunk) => {
      if (tooLarge) return;
      body += chunk.toString();
      if (body.length > MAX_BODY_LENGTH) {
        tooLarge = true;
        body = '';
      }
    });
    req.on('end', () => {
      if (tooLarge) {
        const error = new Error('Request body too large.');
        error.statusCode = 413;
        reject(error);
        return;
      }
      try {
        const parsed = JSON.parse(body);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          const error = new Error('Invalid request body.');
          error.statusCode = 400;
          reject(error);
          return;
        }
        resolve(parsed);
      } catch (error) {
        error.statusCode = 400;
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

async function handleBooking(req, res, kind) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { success: false, error: 'Method Not Allowed' });
    return;
  }

  let data;
  try {
    data = await readJsonBody(req);
  } catch (error) {
    sendJson(res, error.statusCode || 400, { success: false, error: error.message });
    return;
  }

  const booking = kind === 'table'
    ? normalizeTableReservation(data)
    : normalizeStayRequest(data);
  if (!booking) {
    sendJson(res, 400, {
      success: false,
      error: kind === 'table'
        ? 'Please provide valid reservation details.'
        : 'Please provide valid stay request details.',
    });
    return;
  }

  try {
    const db = await getDatabase();
    if (!db) {
      sendJson(res, 503, {
        success: false,
        error: 'Online booking is temporarily unavailable. Please call our concierge.',
      });
      return;
    }

    const collection = kind === 'table' ? 'reservations' : 'stayRequests';
    const record = { ...booking, createdAt: new Date(), status: 'pending' };
    const result = await db.collection(collection).insertOne(record);
    const bookingId = result.insertedId.toString();
    const notification = await sendBookingNotification({ kind, bookingId, details: booking });
    sendJson(res, 201, {
      success: true,
      message: notification.sent
        ? `${kind === 'table' ? 'Reservation' : 'Stay'} request received and email notification sent.`
        : `${kind === 'table' ? 'Reservation' : 'Stay'} request saved, but the email notification could not be sent.`,
      bookingId,
      notificationSent: notification.sent,
      ...(notification.sent ? {} : { notificationWarning: notification.reason }),
    });
  } catch (error) {
    console.error(`${kind} booking error:`, error);
    sendJson(res, 500, { success: false, error: 'Unable to save your request. Please try again.' });
  }
}

async function handleContact(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { success: false, error: 'Method Not Allowed' });
    return;
  }

  let data;
  try {
    data = await readJsonBody(req);
  } catch (error) {
    sendJson(res, error.statusCode || 400, { success: false, error: error.message });
    return;
  }

  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
  const phone = typeof data.phone === 'string' ? data.phone.trim() : '';
  const subject = typeof data.subject === 'string' ? data.subject.trim() : '';
  const message = typeof data.message === 'string' ? data.message.trim() : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      || name.length > 100 || (name && name.length < 2)
      || subject.length < 3 || subject.length > 120
      || message.length < 3 || message.length > 3000 || phone.length > 30) {
    sendJson(res, 400, { success: false, error: 'Please provide valid contact details and a message.' });
    return;
  }

  try {
    const db = await getDatabase();
    if (!db) {
      sendJson(res, 503, {
        success: false,
        error: 'Messaging is temporarily unavailable. Please contact our concierge by phone.',
      });
      return;
    }
    const result = await db.collection('inquiries').insertOne({
      name, email, phone, subject, message, createdAt: new Date(),
    });
    sendJson(res, 201, {
      success: true,
      message: 'Message received. Our team will be in touch.',
      inquiryId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error('Contact request error:', error);
    sendJson(res, 500, { success: false, error: 'Unable to save your message. Please try again.' });
  }
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent((req.url || '/').split('?')[0]);
  } catch {
    res.writeHead(400).end('Bad Request');
    return;
  }

  if (pathname === '/api/reservations') {
    await handleBooking(req, res, 'table');
    return;
  }
  if (pathname === '/api/stays') {
    await handleBooking(req, res, 'stay');
    return;
  }
  if (pathname === '/api/contact') {
    await handleContact(req, res);
    return;
  }

  const fileName = PAGES[pathname] || pathname.replace(/^\/+/, '');
  const filePath = path.resolve(ROOT, fileName);
  if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404).end('404 Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(filePath)] || 'application/octet-stream' });
    res.end(content);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`LUMINA server ready at http://127.0.0.1:${PORT}`);
});
