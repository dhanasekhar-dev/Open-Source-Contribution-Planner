const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  languages: {
    type: [String],
    default: [],
  },
  skills: {
    type: [String],
    default: [],
  },
  experienceLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', ''],
    default: '',
  },
  interests: {
    type: [String],
    default: [],
  },
  availableHours: {
    type: String,
    default: '',
  },
  avatar: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
