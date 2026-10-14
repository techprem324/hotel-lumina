const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeTableReservation, normalizeStayRequest } = require('../lib/booking-validation');

const dateString = (offset) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
};

const tableRequest = (overrides = {}) => ({
  name: 'Aarav Mehta',
  email: 'aarav@example.com',
  phone: '+91 98765 43210',
  guests: '4',
  date: dateString(1),
  time: '19:00',
  seatingPreference: 'Window table',
  requests: '',
  ...overrides,
});

const stayRequest = (overrides = {}) => ({
  name: 'Aarav Mehta',
  email: 'aarav@example.com',
  phone: '+91 98765 43210',
  roomType: 'Deluxe Room',
  checkIn: dateString(1),
  checkOut: dateString(3),
  guests: '2',
  rooms: '1',
  requests: '',
  ...overrides,
});

test('normalizes a valid table request with a selected seating preference', () => {
  const request = normalizeTableReservation(tableRequest());
  assert.equal(request.guests, 4);
  assert.equal(request.seatingPreference, 'Window table');
  assert.equal(request.email, 'aarav@example.com');
});

test('rejects table requests with invalid party size or seating preference', () => {
  assert.equal(normalizeTableReservation(tableRequest({ guests: '9' })), null);
  assert.equal(normalizeTableReservation(tableRequest({ seatingPreference: 'Rooftop' })), null);
  assert.equal(normalizeTableReservation(tableRequest({ date: '2026-02-30' })), null);
});

test('rejects past table dates', () => {
  assert.equal(normalizeTableReservation(tableRequest({ date: dateString(-1) })), null);
});

test('normalizes a valid hotel stay request', () => {
  const request = normalizeStayRequest(stayRequest());
  assert.equal(request.roomType, 'Deluxe Room');
  assert.equal(request.guests, 2);
  assert.equal(request.rooms, 1);
});

test('rejects invalid stay dates, room types and quantities', () => {
  assert.equal(normalizeStayRequest(stayRequest({ checkOut: dateString(1) })), null);
  assert.equal(normalizeStayRequest(stayRequest({ roomType: 'Penthouse' })), null);
  assert.equal(normalizeStayRequest(stayRequest({ rooms: '0' })), null);
  assert.equal(normalizeStayRequest(stayRequest({ checkIn: dateString(-1) })), null);
});
