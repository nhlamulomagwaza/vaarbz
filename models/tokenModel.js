//DECLARE MODEL VARIABLES
const mongoose = require('mongoose');



//SETTING UP SCHEMA

const tokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
});


//EXPORT SCHEMA

module.exports = mongoose.model('Token', tokenSchema);