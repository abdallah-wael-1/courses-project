const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const httpStatus = require('./utils/httpStatus');

const app = express();

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://your-frontend.vercel.app', 
      /\.vercel\.app$/,
      /\.netlify\.app$/
    ];
    

    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

app.use(cors(corsOptions)); 
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const coursesRouter = require('./routes/courses.route');
const usersRouter = require('./routes/users.route');
const enrollmentsRouter = require('./routes/enrollments.route');

app.use('/api/courses', coursesRouter);
app.use('/api/users', usersRouter);
app.use('/api/enrollments', enrollmentsRouter);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'CoursesApp API',
    status: 'running',
    endpoints: {
      health: '/api/health',
      courses: '/api/courses',
      users: '/api/users',
      enrollments: '/api/enrollments'
    }
  });
});

// 404 handler
app.use((req, res, next) => {
  console.log(' 404 - Route not found:', req.method, req.originalUrl);
  return res.status(404).json({
    status: httpStatus.ERROR, 
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error(' Server Error:', error);
  res.status(error.statusCode || 500).json({
    status: error.statusText || httpStatus.ERROR, 
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => { 
  console.log(` Server is running on port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  if (process.env.NODE_ENV === 'development') {
    console.log(` API URL: http://localhost:${PORT}/api`);
    console.log(` Uploads: http://localhost:${PORT}/uploads`);
  }
});