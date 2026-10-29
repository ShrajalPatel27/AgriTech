
require('dotenv').config();

const connectDB = require('./config/db');
const seed = require('./config/seed');

async function main() {
  try {
    await connectDB();
    await seed();

    console.log('Seed completed successfully');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

main();
