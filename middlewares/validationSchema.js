const { body, validationResult } = require('express-validator');
const appError = require('../utils/appError');
const httpStatus = require('../utils/httpStatus');

const validationSchema = () => {
    return [
        body('title')
          .notEmpty()
          .withMessage("title is required")
          .isLength({ min: 2 })
          .withMessage("title at least 2 char"),
    
        body('price')
          .notEmpty()
          .withMessage("price is required"),
        
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const error = appError.create(errors.array(), 400, httpStatus.FAIL);
                return next(error);
            }
            next();
        }
    ];
}

module.exports = { validationSchema };