const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  division: {
    type: String
  },
  vertical: {
    type: String
  },
  contactno: {
    type: Number
  },
  email: {
    type: String
  },
  address: [
    {
      line1: {
        type: String
      },
      line2: {
        type: String
      },
      city: {
        type: String
      },
      state: {
        type: String
      },
      country: {
        type: String,
        default: 'India'
      },
      pin: {
        type: Number
      },
      gstin: {
        type: String
      }
    }
  ],
  contactperson: [
    {
      firstname: {
        type: String,
        required: true
      },
      lastname: {
        type: String,
        required: true
      },
      designation: {
        type: String
      },
      contactno: {
        type: [Number],
        required: true
      },
      email: {
        type: [String],
        required: true
      }
    }
  ],
  logo: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Client = mongoose.model('client', ClientSchema);
