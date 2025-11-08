// Setup Cosmos DB - Create database and containers
const fs = require('fs');
const path = require('path');

// Load environment variables
const settingsPath = path.join(__dirname, 'local.settings.json');
if (fs.existsSync(settingsPath)) {
  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  Object.assign(process.env, settings.Values);
}

const { CosmosClient } = require('@azure/cosmos');

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = 'classroom-booking';

const client = new CosmosClient({ endpoint, key });

async function setupCosmosDB() {
  try {
    console.log('\n🔧 Setting up Azure Cosmos DB...\n');
    console.log(`Endpoint: ${endpoint}`);
    console.log(`Database: ${databaseId}\n`);

    // Create database
    console.log('📦 Creating database...');
    const { database } = await client.databases.createIfNotExists({ id: databaseId });
    console.log(`  ✓ Database "${databaseId}" ready\n`);

    // Create rooms container
    console.log('📦 Creating "rooms" container...');
    await database.containers.createIfNotExists({
      id: 'rooms',
      partitionKey: { paths: ['/building'] }
    });
    console.log('  ✓ Container "rooms" ready (partition key: /building)\n');

    // Create bookings container
    console.log('📦 Creating "bookings" container...');
    await database.containers.createIfNotExists({
      id: 'bookings',
      partitionKey: { paths: ['/id'] }
    });
    console.log('  ✓ Container "bookings" ready (partition key: /id)\n');

    console.log('✅ Cosmos DB setup completed successfully!\n');
    console.log('Next step: Run "node seed-db.js" to populate with sample data\n');

  } catch (error) {
    console.error('\n❌ Error setting up Cosmos DB:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

setupCosmosDB();
