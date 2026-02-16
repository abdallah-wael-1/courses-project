const jwt = require('jsonwebtoken');
const httpStatus = require('../utils/httpStatus');
const appError = require('../utils/appError');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if(!authHeader) {
        const error = appError.create('token is required', 401, httpStatus.ERROR)
        return next(error);
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        

        req.currentUser = {
            id: decoded.id || decoded._id,
            _id: decoded.id || decoded._id,
            email: decoded.email,
            role: decoded.role,
            firstName: decoded.firstName,
            lastName: decoded.lastName
        };
        
        next();

    } catch (err) {
        const error = appError.create('invalid token', 401, httpStatus.ERROR)
        return next(error);
    }   
}

module.exports = verifyToken;