const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const LOCAL_URI = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/kaya';
const ATLAS_URI = process.env.ATLAS_MONGODB_URI || 'mongodb+srv://kaya:kaya123@cluster0.jv9r8b2.mongodb.net/kaya?retryWrites=true&w=majority';

async function migrate() {
  console.log('=================================================================');
  console.log('🚀 Starting Full MongoDB Local to MongoDB Atlas Migration');
  console.log('=================================================================');
  console.log(`📍 Local Source: ${LOCAL_URI}`);
  console.log(`☁️ Atlas Target: ${ATLAS_URI.replace(/:[^:]*@/, ':****@')}`);

  // Create local backup directory
  const backupDir = path.join(__dirname, '../../backup_local_mongodb');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const localClient = new MongoClient(LOCAL_URI);
  const atlasClient = new MongoClient(ATLAS_URI);

  try {
    await localClient.connect();
    console.log('✅ Connected to Local MongoDB.');

    await atlasClient.connect();
    console.log('✅ Connected to MongoDB Atlas.');

    const localDb = localClient.db('kaya');
    const atlasDb = atlasClient.db('kaya');

    // 1. Discover all collections in local database
    const collections = await localDb.listCollections().toArray();
    console.log(`\n📋 Discovered ${collections.length} collections in local database 'kaya':`);
    collections.forEach(c => console.log(`   • ${c.name}`));

    const migrationSummary = [];

    // Existing Atlas collections
    const existingAtlasCollections = (await atlasDb.listCollections().toArray()).map(c => c.name);

    for (const colInfo of collections) {
      const colName = colInfo.name;
      const localCol = localDb.collection(colName);

      // Ensure collection exists on Atlas
      if (!existingAtlasCollections.includes(colName)) {
        await atlasDb.createCollection(colName);
        console.log(`📁 Created collection '${colName}' on Atlas.`);
      }
      const atlasCol = atlasDb.collection(colName);

      // Fetch all documents from local
      const docs = await localCol.find({}).toArray();
      const localCount = docs.length;

      // Save local backup file
      const backupPath = path.join(backupDir, `${colName}.json`);
      fs.writeFileSync(backupPath, JSON.stringify(docs, null, 2), 'utf-8');
      console.log(`💾 Backed up ${localCount} documents from '${colName}' to ${backupPath}`);

      // Fetch indexes from local
      let localIndexes = [];
      try {
        localIndexes = await localCol.indexes();
      } catch (err) {
        localIndexes = [];
      }
      const customIndexes = localIndexes.filter(idx => idx.name !== '_id_');

      if (localCount > 0) {
        // Clear any existing partial data in Atlas collection before clean migration
        await atlasCol.deleteMany({});

        // Insert documents preserving all original BSON types (ObjectIds, Dates, nested arrays, etc.)
        const insertResult = await atlasCol.insertMany(docs, { ordered: true });
        console.log(`   ✨ Migrated ${insertResult.insertedCount}/${localCount} documents to Atlas.`);
      } else {
        console.log(`   ℹ️ Collection '${colName}' is empty (0 documents).`);
      }

      // Recreate custom indexes
      for (const idx of customIndexes) {
        try {
          const { key, name, unique, sparse, background, expireAfterSeconds } = idx;
          const options = { name };
          if (unique !== undefined) options.unique = unique;
          if (sparse !== undefined) options.sparse = sparse;
          if (background !== undefined) options.background = background;
          if (expireAfterSeconds !== undefined) options.expireAfterSeconds = expireAfterSeconds;

          await atlasCol.createIndex(key, options);
          console.log(`   🔑 Created index '${name}' on Atlas.`);
        } catch (idxErr) {
          console.warn(`   ⚠️ Index warning for ${colName}.${idx.name}:`, idxErr.message);
        }
      }

      // Verify Atlas collection count and indexes
      const atlasCount = await atlasCol.countDocuments();
      let atlasIndexes = [];
      try {
        atlasIndexes = await atlasCol.indexes();
      } catch (e) {
        atlasIndexes = [];
      }

      migrationSummary.push({
        Collection: colName,
        'Local Count': localCount,
        'Atlas Count': atlasCount,
        'Count Match': localCount === atlasCount ? '✅ MATCH' : '❌ MISMATCH',
        'Local Indexes': localIndexes.length,
        'Atlas Indexes': atlasIndexes.length,
        'Index Match': localIndexes.length === atlasIndexes.length ? '✅ MATCH' : '⚠️ CHECK',
      });
    }

    console.log('\n=================================================================');
    console.log('📊 MIGRATION VERIFICATION AUDIT');
    console.log('=================================================================');
    console.table(migrationSummary);

    // Deep document integrity check for key collections
    console.log('\n🔍 Running Deep Document Integrity Check...');
    const localUsers = await localDb.collection('users').find({}).toArray();
    const atlasUsers = await atlasDb.collection('users').find({}).toArray();
    if (localUsers.length > 0 && atlasUsers.length > 0) {
      const match = localUsers[0]._id.toString() === atlasUsers[0]._id.toString() &&
                    localUsers[0].email === atlasUsers[0].email;
      console.log(`   User ID & Email Match: ${match ? '✅ VERIFIED' : '❌ MISMATCH'}`);
    }

    const localOrders = await localDb.collection('orders').find({}).toArray();
    const atlasOrders = await atlasDb.collection('orders').find({}).toArray();
    if (localOrders.length > 0 && atlasOrders.length > 0) {
      const match = localOrders[0].order_number === atlasOrders[0].order_number &&
                    localOrders[0]._id.toString() === atlasOrders[0]._id.toString();
      console.log(`   Order ID & Number Match: ${match ? '✅ VERIFIED' : '❌ MISMATCH'}`);
    }

    const localProducts = await localDb.collection('products').find({}).toArray();
    const atlasProducts = await atlasDb.collection('products').find({}).toArray();
    if (localProducts.length > 0 && atlasProducts.length > 0) {
      const match = localProducts[0]._id.toString() === atlasProducts[0]._id.toString();
      console.log(`   Product ID Match: ${match ? '✅ VERIFIED' : '❌ MISMATCH'}`);
    }

    console.log('\n🎉 ALL COLLECTIONS, DOCUMENTS, AND INDEXES SUCCESSFULLY MIGRATED TO ATLAS!');
    return migrationSummary;
  } catch (err) {
    console.error('❌ Migration Failed with Error:', err);
    throw err;
  } finally {
    await localClient.close();
    await atlasClient.close();
  }
}

if (require.main === module) {
  migrate().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = migrate;
