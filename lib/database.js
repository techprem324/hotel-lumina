'use strict';

const { MongoClient } = require('mongodb');

let clientPromise;
let cachedDb;

async function getDatabase() {
  if (cachedDb) return cachedDb;
  if (!process.env.MONGODB_URI) return null;

  if (!clientPromise) {
    const client = new MongoClient(process.env.MONGODB_URI);
    clientPromise = client.connect().then(() => client.db('lumina_db')).catch((error) => {
      clientPromise = undefined;
      throw error;
    });
  }

  cachedDb = await clientPromise;
  return cachedDb;
}

module.exports = { getDatabase };
