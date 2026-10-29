const { Router } = require('express');
const h = require('../utils/asyncHandler');
const { protect } = require('../middleware/auth');
const Farm = require('../models/Farm');
const WeatherData = require('../models/WeatherData');
const geocode = require('../utils/geo');

const r = Router();
r.use(protect);

async function fetchForecast(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    '&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code' +
    '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max' +
    '&timezone=auto&forecast_days=7';
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error('Weather service returned an error');
  const j = await res.json();
  return {
    current: {
      temperature: j.current.temperature_2m,
      humidity: j.current.relative_humidity_2m,
      precipitation: j.current.precipitation,
      wind: j.current.wind_speed_10m,
      code: j.current.weather_code,
    },
    daily: j.daily.time.map((d, i) => ({
      date: d,
      max: j.daily.temperature_2m_max[i],
      min: j.daily.temperature_2m_min[i],
      rain: j.daily.precipitation_sum[i],
      rainProb: j.daily.precipitation_probability_max[i],
    })),
  };
}

// Automatic, rule-based pest / crop-risk alerts derived from the forecast
function advisories({ current, daily }) {
  const out = [];
  const rain3 = daily.slice(0, 3).reduce((s, d) => s + (d.rain || 0), 0);
  const rain7 = daily.reduce((s, d) => s + (d.rain || 0), 0);
  if (current.humidity >= 80 && current.temperature >= 18 && current.temperature <= 32)
    out.push({ level: 'High', title: 'Fungal disease risk', text: 'High humidity with warm temperature favours blight, rust and mildew. Inspect leaves and consider a preventive fungicide.' });
  if (current.temperature >= 36)
    out.push({ level: 'High', title: 'Heat stress and mites', text: 'Very hot weather. Irrigate in early morning or evening, mulch, and watch for spider mites and aphids.' });
  if (rain3 >= 50)
    out.push({ level: 'High', title: 'Heavy rain expected', text: 'Over 50 mm of rain in 3 days. Clear drains, delay spraying and fertilizer, and watch for root rot.' });
  if (rain7 < 2 && current.temperature >= 30)
    out.push({ level: 'Medium', title: 'Dry spell ahead', text: 'Little rain forecast this week. Plan irrigation and avoid sowing without a water source.' });
  if (current.wind >= 30)
    out.push({ level: 'Medium', title: 'Strong winds', text: 'Avoid spraying pesticides today and support tall crops.' });
  if (!out.length) out.push({ level: 'Low', title: 'No major risks', text: 'Conditions look normal for the coming days.' });
  return out;
}

// GET /api/weather/geocode?q=Pune
r.get('/geocode', h(async (req, res) => {
  const g = await geocode(req.query.q);
  if (!g) {
    res.status(404);
    throw new Error('Place not found');
  }
  res.json(g);
}));

// GET /api/weather?farmId=...  or  ?lat=..&lon=..
r.get('/', h(async (req, res) => {
  let { lat, lon, farmId } = req.query;
  let name = req.query.name;
  if (farmId) {
    const farm = await Farm.findOne(req.user.role === 'admin' ? { _id: farmId } : { _id: farmId, owner: req.user._id });
    if (!farm) {
      res.status(404);
      throw new Error('Farm not found');
    }
    lat = farm.lat;
    lon = farm.lon;
    name = farm.name;
    if (lat == null || lon == null) {
      const g = await geocode([farm.village, farm.state].filter(Boolean).join(', ')).catch(() => null);
      if (g) {
        lat = g.lat;
        lon = g.lon;
        farm.lat = lat;
        farm.lon = lon;
        await farm.save();
      }
    }
  }
  if (lat == null || lon == null || isNaN(Number(lat)) || isNaN(Number(lon))) {
    res.status(400);
    throw new Error('Location not available. Edit the farm and add a village/state or latitude and longitude.');
  }
  lat = Number(lat);
  lon = Number(lon);
  const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  let data;
  let cached = false;
  try {
    data = await fetchForecast(lat, lon);
    await WeatherData.findOneAndUpdate({ key }, { key, lat, lon, ...data, fetchedAt: new Date() }, { upsert: true });
  } catch (e) {
    const old = await WeatherData.findOne({ key });
    if (!old) {
      res.status(502);
      throw new Error('Weather service unavailable and no cached data found');
    }
    data = { current: old.current, daily: old.daily };
    cached = true;
  }
  res.json({ location: { name, lat, lon }, ...data, advisories: advisories(data), cached });
}));

module.exports = r;
