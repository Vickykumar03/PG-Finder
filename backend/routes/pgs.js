const express = require('express');
const router = express.Router();
const PG = require('../models/PG');
const { protect, ownerOnly } = require('../middleware/auth');

// @route   GET /api/pgs/nearby
// Query: lat, lng, radius (meters, default 5000), type, minPrice, maxPrice, amenities
router.get('/nearby', async (req, res) => {
  try {
    const {
      lat,
      lng,
      radius = 5000,
      type,
      minPrice,
      maxPrice,
      amenities,
      page = 1,
      limit = 10,
    } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
    }

    // Hard cap: never exceed 20km regardless of what frontend sends
    const safeRadius = Math.min(parseInt(radius) || 5000, 20000);

    const matchStage = { isAvailable: true };
    if (type) matchStage.type = type;
    if (minPrice) matchStage['price.min'] = { $gte: parseInt(minPrice) };
    if (maxPrice) matchStage['price.max'] = { $lte: parseInt(maxPrice) };
    if (amenities) {
      amenities.split(',').forEach((a) => {
        matchStage[`amenities.${a.trim()}`] = true;
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Use $geoNear aggregation — required when sorting by distance
    const pgs = await PG.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          distanceField: 'distanceMeters',
          maxDistance: safeRadius,
          spherical: true,
          query: matchStage,
        },
      },
      { $skip: skip },
      { $limit: parseInt(limit) },
    ]);

    // Populate owner manually (aggregate doesn't support .populate())
    await PG.populate(pgs, { path: 'owner', select: 'name phone email' });

    // Convert distanceMeters → km
    const pgsWithDistance = pgs.map((pg) => ({
      ...pg,
      distance: parseFloat((pg.distanceMeters / 1000).toFixed(2)),
    }));

    res.json({
      success: true,
      count: pgsWithDistance.length,
      data: pgsWithDistance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/pgs
router.get('/', async (req, res) => {
  try {
    const { city, type, minPrice, maxPrice, page = 1, limit = 12 } = req.query;
    const query = { isAvailable: true };

    if (city) query['address.city'] = new RegExp(city, 'i');
    if (type) query.type = type;
    if (minPrice || maxPrice) {
      if (minPrice) query['price.min'] = { $gte: parseInt(minPrice) };
      if (maxPrice) query['price.max'] = { $lte: parseInt(maxPrice) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const pgs = await PG.find(query)
      .populate('owner', 'name phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await PG.countDocuments(query);

    res.json({
      success: true,
      count: pgs.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      data: pgs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/pgs/:id
router.get('/:id', async (req, res) => {
  try {
    const pg = await PG.findById(req.params.id).populate('owner', 'name phone email');
    if (!pg) return res.status(404).json({ success: false, message: 'PG not found' });
    res.json({ success: true, data: pg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/pgs
router.post('/', protect, ownerOnly, async (req, res) => {
  try {
    const pgData = { ...req.body, owner: req.user._id };
    const pg = await PG.create(pgData);
    res.status(201).json({ success: true, data: pg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/pgs/:id
router.put('/:id', protect, ownerOnly, async (req, res) => {
  try {
    const pg = await PG.findById(req.params.id);
    if (!pg) return res.status(404).json({ success: false, message: 'PG not found' });
    if (pg.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const updated = await PG.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/pgs/:id
router.delete('/:id', protect, ownerOnly, async (req, res) => {
  try {
    const pg = await PG.findById(req.params.id);
    if (!pg) return res.status(404).json({ success: false, message: 'PG not found' });
    if (pg.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await pg.deleteOne();
    res.json({ success: true, message: 'PG deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/pgs/:id/reviews
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const pg = await PG.findById(req.params.id);
    if (!pg) return res.status(404).json({ success: false, message: 'PG not found' });

    const alreadyReviewed = pg.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'PG already reviewed' });
    }

    const review = { user: req.user._id, userName: req.user.name, rating: Number(rating), comment };
    pg.reviews.push(review);
    pg.totalReviews = pg.reviews.length;
    pg.rating = pg.reviews.reduce((acc, r) => acc + r.rating, 0) / pg.reviews.length;
    await pg.save();

    res.status(201).json({ success: true, message: 'Review added', data: pg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/pgs/owner/my-pgs
router.get('/owner/my-pgs', protect, ownerOnly, async (req, res) => {
  try {
    const pgs = await PG.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: pgs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Haversine distance formula
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

module.exports = router;