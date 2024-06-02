const mongoose = require('mongoose');

const adoptionformSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  message: {
    type: String
  },
  animal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Animal' 
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Adoption = mongoose.model('Adoption', adoptionformSchema);

module.exports = Adoption;
