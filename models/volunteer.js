
const mongoose= require("mongoose");


const volunteerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

   lastname:{
    type:String
   },

    username:{
      type:String
    },

     email: {
    type: String,
    required: true,
    unique: true
  },

    gender:{
      type :String
    },

    phone: {
    type: String,
    required: true
  },
    password: {
    type: String,
    required: true
  },
  
});

const Volunteer=mongoose.model('Volunteer',volunteerSchema)


module.exports = Volunteer;
