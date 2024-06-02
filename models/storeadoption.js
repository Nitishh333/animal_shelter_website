const mongoose = require("mongoose");

const animalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },

  breed: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
 

 
  description: {
    type: String,
    required: true
  },

  image:{
    data:Buffer,
    contentType:String
  }

});

const Animal = mongoose.model("Animal", animalSchema);

module.exports = Animal;
