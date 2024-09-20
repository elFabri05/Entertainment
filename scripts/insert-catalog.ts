const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

async function main() {
  const uri = process.env.MONGODB_URI || '';
  const dbName = process.env.MONGODB_DB || 'entertainment_dev';

  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected successfully to server");

    const database = client.db(dbName);
    console.log(`Using database: ${dbName}`);

    const collection = database.collection("catalog");

    // Possible file paths
    const possiblePaths = [
      path.join(process.cwd(), 'data', 'catalog.json'),
      path.join(process.cwd(), 'catalog.json'),
      path.join(process.cwd(), 'src', 'data', 'catalog.json'),
      path.join(process.cwd(), 'scripts', 'catalog.json'), // Added scripts folder
      path.join(__dirname, 'catalog.json'), // This will look in the same directory as the script
      // Add any other possible paths here
    ];

    let dataPath;
    for (const p of possiblePaths) {
      console.log(`Checking for file at: ${p}`);
      if (fs.existsSync(p)) {
        dataPath = p;
        break;
      }
    }

    if (!dataPath) {
      console.log('Current working directory:', process.cwd());
      console.log('Script directory:', __dirname);
      console.log('Directory contents of script folder:', fs.readdirSync(__dirname));
      throw new Error('catalog.json file not found. Please ensure it exists in one of the checked locations.');
    }

    console.log(`Reading data from: ${dataPath}`);
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    // Insert the documents
    const result = await collection.insertMany(data);
    console.log(`${result.insertedCount} documents were inserted`);

    // Verify insertion by querying a document
    const query = { title: "Beyond Earth" };
    const movie = await collection.findOne(query);
    console.log("Sample document:");
    console.log(JSON.stringify(movie, null, 2));

    // Count total documents
    const count = await collection.countDocuments();
    console.log(`Total documents in collection: ${count}`);

  } finally {
    await client.close();
  }
}

main().catch(console.error);