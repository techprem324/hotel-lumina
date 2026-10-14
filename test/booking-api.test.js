const test = require('node:test');
const assert = require('node:assert/strict');

const database = require('../lib/database');
const notifications = require('../lib/booking-notification');

let insertedCollection;
let insertedRecord;
let nextNotificationResult = { sent: true };
const notificationCalls = [];

database.getDatabase = async () => ({
  collection(name) {
    return {
      async insertOne(record) {
        insertedCollection = name;
        insertedRecord = record;
        return { insertedId: { toString: () => 'booking-test-123' } };
      },
    };
  },
});
notifications.sendBookingNotification = async (notification) => {
  notificationCalls.push(notification);
  return nextNotificationResult;
};

const reservationHandler = require('../api/reservations');
const stayHandler = require('../api/stays');

const dateString = (offset) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
};

function responseRecorder() {
  return {
    statusCode: 200,
    payload: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
    setHeader() {},
    end() {},
  };
}

test('stores a valid table booking, then sends the owner notification', async () => {
  insertedCollection = undefined;
  notificationCalls.length = 0;
  nextNotificationResult = { sent: true };
  const res = responseRecorder();

  await reservationHandler({
    method: 'POST',
    body: {
      name: 'Guest Name',
      email: 'guest@example.com',
      phone: '+91 98765 43210',
      guests: '2',
      date: dateString(1),
      time: '19:00',
      seatingPreference: 'Window table',
    },
  }, res);

  assert.equal(res.statusCode, 201);
  assert.equal(insertedCollection, 'reservations');
  assert.equal(insertedRecord.status, 'pending');
  assert.equal(res.payload.notificationSent, true);
  assert.equal(notificationCalls[0].details.seatingPreference, 'Window table');
});

test('stores a valid stay request and labels a failed email alert clearly', async () => {
  notificationCalls.length = 0;
  nextNotificationResult = { sent: false, reason: 'Email notifications are not configured.' };
  const res = responseRecorder();

  await stayHandler({
    method: 'POST',
    body: {
      name: 'Guest Name',
      email: 'guest@example.com',
      phone: '+91 98765 43210',
      roomType: 'Classic Room',
      checkIn: dateString(1),
      checkOut: dateString(2),
      guests: '2',
      rooms: '1',
    },
  }, res);

  assert.equal(res.statusCode, 201);
  assert.equal(insertedCollection, 'stayRequests');
  assert.equal(insertedRecord.status, 'pending');
  assert.equal(res.payload.notificationSent, false);
  assert.match(res.payload.message, /saved, but the email notification could not be sent/);
  assert.equal(notificationCalls[0].kind, 'stay');
});

test('rejects invalid booking fields without saving or emailing', async () => {
  notificationCalls.length = 0;
  const res = responseRecorder();

  await reservationHandler({ method: 'POST', body: { name: 'Guest Name' } }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.payload.success, false);
  assert.equal(notificationCalls.length, 0);
});
