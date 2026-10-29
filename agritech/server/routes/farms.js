const Farm = require('../models/Farm');
const geocode = require('../utils/geo');
const { ownerCrud } = require('../utils/crud');

module.exports = ownerCrud(Farm, {
  // Best effort: look up coordinates from village/state so weather works automatically
  beforeSave: async (req, body, existing) => {
    const village = body.village ?? existing?.village;
    const state = body.state ?? existing?.state;
    const hasCoords = body.lat != null && body.lat !== '' && body.lon != null && body.lon !== '';
    if (!hasCoords && (village || state)) {
      try {
        const g = await geocode([village, state].filter(Boolean).join(', '));
        if (g) {
          body.lat = g.lat;
          body.lon = g.lon;
        }
      } catch (e) {
        /* offline - ignore */
      }
    }
    if (body.lat === '') delete body.lat;
    if (body.lon === '') delete body.lon;
    if (body.areaAcres === '') delete body.areaAcres;
  },
});
