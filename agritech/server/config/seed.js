const User = require('../models/User');
const Farm = require('../models/Farm');
const Crop = require('../models/Crop');
const Soil = require('../models/Soil');
const Resource = require('../models/Resource');
const PestAlert = require('../models/PestAlert');
const Post = require('../models/Post');

// Runs once on an empty database so the app is usable immediately
module.exports = async function seed() {
  if (await User.countDocuments()) return;
  console.log('Seeding demo data...');
  const admin = await User.create({ name: 'Admin', email: 'admin@agritech.com', password: 'Admin@123', role: 'admin' });
  const farmer = await User.create({ name: 'Ravi Kumar', email: 'farmer@agritech.com', password: 'Farmer@123', phone: '9876543210', location: 'Pune, Maharashtra' });

  const farm = await Farm.create({ owner: farmer._id, name: 'Green Valley Farm', village: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567, areaAcres: 5, soilType: 'Black', waterSource: 'Borewell' });
  const day = 86400000;
  await Crop.create([
    { owner: farmer._id, farm: farm._id, name: 'Tomato', variety: 'Pusa Ruby', areaAcres: 2, status: 'Growing', sowingDate: new Date(Date.now() - 30 * day), expectedHarvest: new Date(Date.now() + 60 * day) },
    { owner: farmer._id, farm: farm._id, name: 'Wheat', variety: 'HD-2967', areaAcres: 3, status: 'Planned', sowingDate: new Date(Date.now() + 10 * day) },
  ]);
  await Soil.create([
    { owner: farmer._id, farm: farm._id, date: new Date(Date.now() - 60 * day), ph: 5.8, nitrogen: 250, phosphorus: 14, potassium: 150, moisture: 35, organicMatter: 1.8 },
    { owner: farmer._id, farm: farm._id, date: new Date(), ph: 6.4, nitrogen: 310, phosphorus: 18, potassium: 170, moisture: 40, organicMatter: 2.4 },
  ]);

  await Resource.create([
    { name: 'Hybrid Tomato Seeds', category: 'Seeds', price: 450, unit: 'packet', stock: 100, description: 'High-yield, disease-tolerant hybrid.', createdBy: admin._id },
    { name: 'Wheat Seeds HD-2967', category: 'Seeds', price: 38, unit: 'kg', stock: 2000, description: 'Certified seeds.', createdBy: admin._id },
    { name: 'Urea (46% N)', category: 'Fertilizer', price: 266, unit: '45kg bag', stock: 300, description: 'Nitrogen fertilizer.', createdBy: admin._id },
    { name: 'DAP Fertilizer', category: 'Fertilizer', price: 1350, unit: '50kg bag', stock: 200, description: 'Phosphorus and nitrogen source.', createdBy: admin._id },
    { name: 'Neem Oil Bio-Pesticide', category: 'Pesticide', price: 320, unit: 'litre', stock: 150, description: 'Organic pest control.', createdBy: admin._id },
    { name: 'Mancozeb Fungicide', category: 'Pesticide', price: 580, unit: 'kg', stock: 90, description: 'Protects against blight and rust.', createdBy: admin._id },
    { name: 'Hand Sprayer 16L', category: 'Tools', price: 1800, unit: 'piece', stock: 40, description: 'Knapsack sprayer.', createdBy: admin._id },
    { name: 'Drip Irrigation Kit', category: 'Equipment', price: 6500, unit: 'kit (1 acre)', stock: 25, description: 'Saves up to 50% water.', createdBy: admin._id },
  ]);

  await PestAlert.create([
    { title: 'Fall Armyworm outbreak', crop: 'Maize', region: 'Maharashtra', severity: 'High', description: 'Larvae feeding on leaf whorls reported across districts.', prevention: 'Scout fields weekly, use pheromone traps, spray neem oil or recommended insecticide early.', createdBy: admin._id },
    { title: 'Late blight warning', crop: 'Tomato, Potato', region: 'All regions', severity: 'Medium', description: 'Cool, humid weather favours late blight.', prevention: 'Avoid overhead irrigation, remove infected leaves, apply mancozeb preventively.', createdBy: admin._id },
    { title: 'Whitefly in cotton', crop: 'Cotton', region: 'Gujarat, Telangana', severity: 'Medium', description: 'Whitefly populations rising; risk of leaf curl virus.', prevention: 'Use yellow sticky traps and avoid excess nitrogen.', createdBy: admin._id },
  ]);

  await Post.create({ author: farmer._id, authorName: farmer.name, title: 'Best time to sow wheat in Maharashtra?', body: 'I am planning to sow HD-2967. Any advice on the ideal sowing window and seed rate?', comments: [{ author: admin._id, authorName: 'Admin', text: 'Mid-November is ideal. Seed rate is about 100 kg/ha.' }] });

  console.log('Demo accounts -> admin@agritech.com / Admin@123   farmer@agritech.com / Farmer@123');
};
