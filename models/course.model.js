const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
    enum: ['Development', 'Design', 'Business', 'Marketing', 'IT & Software', 'Data Science', 'Other'],
    default: 'Other',
  },
    level: {
        type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
    default: 'All Levels',
  },
  duration: {
    type: Number, 
    required: true,
    min: 0,
  },
  instructor: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    default: 'uploads/courses/default-course.jpg',
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  studentsCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  tags: [{
    type: String,
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

module.exports = mongoose.model('Course', courseSchema);