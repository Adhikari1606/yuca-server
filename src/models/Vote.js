const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema(
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
      unique: true,
      index: true,
    },
    ip: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    votes: [
      {
        categoryId: String,
        categoryName: String,
        nomineeId: String,
        nomineeName: String,
        nomineePurpose: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Vote', voteSchema);
