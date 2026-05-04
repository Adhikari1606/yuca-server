const mongoose = require('mongoose');

const nominationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['feature-film', 'short-film', 'video-song'],
    },
    contentName: {
      type: String,
      required: true,
      trim: true,
    },
    contentUrl: {
      type: String,
      required: true,
      trim: true,
    },
    releaseYear: {
      type: String,
      required: true,
    },
    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    zipCode: {
      type: String,
      required: true,
      trim: true,
    },
    consent: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Nomination', nominationSchema);
