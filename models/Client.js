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
  clientcontactno: {
    type: [Number]
  },
  clientemail: {
    type: [String],
    required: true
  },
  logo: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  },
  address: [
    {
      line1: {
        type: String,
        required: true
      },
      line2: {
        type: String
      },
      line3: {
        type: String
      },
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      country: {
        type: String,
        default: 'India'
      },
      pin: {
        type: Number,
        required: true
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
        required: true,
        unique: true
      }
    }
  ]
});

module.exports = Client = mongoose.model('client', ClientSchema);
