//DECLARE MODEL VARIABLES
const mongoose = require('mongoose');



//SETTING UP SCHEMA
const refreshTokenSchema = new mongoose.Schema({
  refreshToken: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  createdAt: { type: Date, default: Date.now, expires: '7d' }, // Refresh token expires after 7 days
});


const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
//EXPORT SCHEMA
module.exports = RefreshToken;