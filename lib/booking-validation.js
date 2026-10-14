'use strict';

const SEATING_PREFERENCES = new Set([
  'Main dining room',
  'Window table',
  'Garden terrace',
  'Private dining',
  'No preference',
]);

const ROOM_TYPES = new Set(['Classic Room', 'Deluxe Room', 'LUMINA Suite']);
const DINING_TIMES = new Set(['12:00', '13:00', '14:00', '18:00', '19:00', '20:00', '21:00', '22:00']);

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isTodayOrLater(value) {
  return isValidDate(value) && value >= new Date().toISOString().slice(0, 10);
}

function validContact(name, email, phone) {
  return name.length >= 2 && name.length <= 100
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    && /^[+\d][\d\s().-]{6,24}$/.test(phone);
}

function normalizeTableReservation(data) {
  const name = text(data.name);
  const email = text(data.email).toLowerCase();
  const phone = text(data.phone);
  const date = text(data.date);
  const time = text(data.time);
  const seatingPreference = text(data.seatingPreference);
  const requests = text(data.requests);
  const guests = Number(data.guests);

  if (!validContact(name, email, phone)
      || !Number.isInteger(guests) || guests < 1 || guests > 8
      || !isTodayOrLater(date) || !DINING_TIMES.has(time)
      || !SEATING_PREFERENCES.has(seatingPreference)
      || requests.length > 1000) {
    return null;
  }

  return { name, email, phone, guests, date, time, seatingPreference, requests };
}

function normalizeStayRequest(data) {
  const name = text(data.name);
  const email = text(data.email).toLowerCase();
  const phone = text(data.phone);
  const roomType = text(data.roomType);
  const checkIn = text(data.checkIn);
  const checkOut = text(data.checkOut);
  const requests = text(data.requests);
  const guests = Number(data.guests);
  const rooms = Number(data.rooms);

  if (!validContact(name, email, phone)
      || !ROOM_TYPES.has(roomType)
      || !isTodayOrLater(checkIn) || !isValidDate(checkOut) || checkOut <= checkIn
      || !Number.isInteger(guests) || guests < 1 || guests > 6
      || !Number.isInteger(rooms) || rooms < 1 || rooms > 5
      || requests.length > 1000) {
    return null;
  }

  return { name, email, phone, roomType, checkIn, checkOut, guests, rooms, requests };
}

module.exports = { normalizeTableReservation, normalizeStayRequest };
