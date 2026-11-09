const mongoose = require('mongoose');

/**
 * Redacts database credentials for secure, production-safe logging
 * @param {string} uri - The MongoDB connection URI
 * @returns {string} Sanitized URI
 */
function sanitizeMongoUri(uri) {
  if (!uri) return '[empty URI]';
  return uri.replace(/(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@/, '$1$2:****@');
}

/**
 * Connect to MongoDB Atlas (or local MongoDB in development)
 * @param {number} retries - Number of connection attempts before failing
 * @param {number} delay - Delay between retries in milliseconds
 */
const connectDB = async (retries = 5, delay = 3000) => {
  let uri = process.env.MONGODB_URI;

  if (!uri) {
    const errorMsg = '❌ FATAL: MONGODB_URI environment variable is not defined. Please configure MONGODB_URI in Render dashboard or .env file.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  uri = uri.trim();
  const targetDbName = process.env.DB_NAME || 'kaya';
  const isLocal = uri.includes('127.0.0.1') || uri.includes('localhost');

  // If URI does not include a database name before query string (e.g. mongodb.net/ or mongodb.net/?...)
  // ensure the target database name is explicitly present in the URI path so Mongoose never defaults to 'test'.
  if (/mongodb(?:\+srv)?:\/\/[^/]+\/?(\?.*)?$/.test(uri)) {
    const match = uri.match(/^(mongodb(?:\+srv)?:\/\/[^/?]+)(\/?)(.*)$/);
    if (match) {
      const base = match[1];
      const rest = match[3] || '';
      const query = rest.startsWith('?') ? rest : (rest ? '?' + rest : '');
      uri = `${base}/${targetDbName}${query}`;
    }
  }

  // Handle Mongoose connection events
  mongoose.connection.on('connected', () => {
    console.log(`✅ MongoDB connected successfully to: ${mongoose.connection.host} (Active Database: '${mongoose.connection.name}')`);
  });

  mongoose.connection.on('error', (err) => {
    console.error(`❌ MongoDB connection error:`, err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn(`⚠️ MongoDB connection disconnected.`);
  });

  const connectOptions = {
    serverSelectionTimeoutMS: 15000,
    dbName: targetDbName,
  };

  // Enforce IPv4 only for local mongod instances to prevent IPv6 loopback binding issues;
  // Never pass family: 4 for remote mongodb+srv:// Atlas URIs to prevent OpenSSL TLS alert 80.
  if (isLocal) {
    connectOptions.family = 4;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`📡 Connecting to MongoDB: ${sanitizeMongoUri(uri)} (Database: '${targetDbName}') [Attempt ${attempt}/${retries}]...`);
      await mongoose.connect(uri, connectOptions);
      return mongoose.connection;
    } catch (error) {
      console.warn(`⚠️ MongoDB connection attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt < retries) {
        console.log(`   Retrying in ${delay / 1000}s...`);
        await new Promise((res) => setTimeout(res, delay));
      } else {
        console.error('❌ FATAL: Could not establish connection to MongoDB Atlas after maximum retries.');
        throw error;
      }
    }
  }
};

module.exports = connectDB;
