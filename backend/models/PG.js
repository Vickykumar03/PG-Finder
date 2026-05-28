const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: String,
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const pgSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'PG name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  address: {
    street: { type: String, required: true },
    area: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  type: {
    type: String,
    enum: ['boys', 'girls', 'coed'],
    required: true,
  },
  roomTypes: [
    {
      type: {
        type: String,
        enum: ['single', 'double', 'triple', 'dormitory'],
      },
      price: Number,
      available: { type: Boolean, default: true },
      amenities: [String],
    },
  ],
  price: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
  },
  amenities: {
    wifi: { type: Boolean, default: false },
    ac: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
    laundry: { type: Boolean, default: false },
    meals: { type: Boolean, default: false },
    security: { type: Boolean, default: false },
    powerBackup: { type: Boolean, default: false },
    gym: { type: Boolean, default: false },
    cctv: { type: Boolean, default: false },
    hotWater: { type: Boolean, default: false },
  },
  images: [String],
  nearbyPlaces: [
    {
      name: String,
      placeType: String, // college, hospital, market etc
      distance: String,
    },
  ],
  rules: [String],
  contactPhone: { type: String, required: true },
  contactEmail: String,
  isVerified: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  reviews: [reviewSchema],
  rating: {
    type: Number,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create 2dsphere index for geospatial queries
pgSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('PG', pgSchema);
