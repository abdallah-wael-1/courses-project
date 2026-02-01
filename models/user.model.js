const mongoose = require('mongoose');
const validator = require('validator');
const userRoles = require('../utils/userRoles');
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        validate: [validator.isEmail, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: true
    },
    token : {
        type: String,
    },
    role: {
    type: String,
    enum: [userRoles.USER, userRoles.ADMIN, userRoles.MANAGER],
    default: userRoles.USER
    },
    avatar : {
    type : String,
    default : 'uploads/profile.png'  
}
});

const User = mongoose.model('User', userSchema);

module.exports = User;
