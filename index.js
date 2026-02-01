const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const httpStatus = require('./utils/httpStatus');
const mongoose = require('mongoose');
const path = require('path')

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const coursesRouter = require('./routes/courses.route');
const usersRouter = require('./routes/users.route');

app.use('/api/courses', coursesRouter);
app.use('/api/users', usersRouter);

app.use((req, res, next) => {
    return res.status(404).json({status: httpStatus.ERROR, message: "this resource is not available"});
});

app.use((error, req, res, next) => {
    res.status(error.statusCode || 500).json({status: error.statusText || httpStatus.ERROR, message: error.message, data: null});
})

app.listen(process.env.PORT || 5000, () => {
    console.log("Server is running on port 5000");
});