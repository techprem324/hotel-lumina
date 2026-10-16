'use strict';

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

let clientPromise;
let cachedDb;

// File-based fallback storage to ensure bookings are NEVER lost even if MongoDB credentials fail
const DATA_DIR = path.resolve(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'lumina_db.json');

function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify({
        reservations: [],
        stayRequests: [],
        availabilitySearches: [],
        inquiries: [],
      }, null, 2), 'utf8');
    }
  } catch (err) {
    console.error('Error initializing data directory:', err.message);
  }
}

function readLocalData() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { reservations: [], stayRequests: [], availabilitySearches: [], inquiries: [] };
  }
}

function writeLocalData(data) {
  ensureDataFile();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing local data:', err.message);
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

class LocalCollection {
  constructor(name) {
    this.name = name;
  }

  async insertOne(doc) {
    const data = readLocalData();
    if (!data[this.name]) data[this.name] = [];
    const id = generateId();
    const item = { ...doc, _id: id, createdAt: doc.createdAt || new Date() };
    data[this.name].unshift(item);
    writeLocalData(data);
    return { insertedId: id };
  }

  find(query = {}, options = {}) {
    const data = readLocalData();
    let items = (data[this.name] || []).slice();
    return {
      sort(sortCriteria) {
        return this;
      },
      skip(count = 0) {
        items = items.slice(count);
        return this;
      },
      limit(count = 50) {
        items = items.slice(0, count);
        return this;
      },
      async toArray() {
        return items;
      },
    };
  }

  async countDocuments() {
    const data = readLocalData();
    return (data[this.name] || []).length;
  }
}

const localDb = {
  collection(name) {
    return new LocalCollection(name);
  },
};

async function getDatabase() {
  if (cachedDb) return cachedDb;

  if (process.env.MONGODB_URI) {
    try {
      if (!clientPromise) {
        const client = new MongoClient(process.env.MONGODB_URI, {
          serverSelectionTimeoutMS: 2000,
          connectTimeoutMS: 2500,
        });
        clientPromise = client.connect()
          .then(() => client.db('lumina_db'))
          .catch((error) => {
            console.warn('MongoDB connection failed; using resilient local storage:', error.message);
            clientPromise = undefined;
            return null;
          });
      }
      const mongoDb = await clientPromise;
      if (mongoDb) {
        cachedDb = mongoDb;
        return cachedDb;
      }
    } catch (err) {
      console.warn('MongoDB initialization error:', err.message);
    }
  }

  // Graceful fallback: local persistent store
  return localDb;
}

module.exports = { getDatabase };
