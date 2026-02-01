const asyncWrapper = require('../middlewares/async-wrapper');
const User = require('../models/user.model');
const httpStatus = require('../utils/httpStatus');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const generateJWT = require('../utils/generateJWT');

const getAllUsers = asyncWrapper ( async (req, res) => {

    console.log(req.headers);
    const query = req.query
    const limit = query.limit || 10;
    const page = query.page || 1;
    const skip = (page - 1) * limit;
    const users = await User.find( {} ,  {"__v" : false , password : false }).limit(limit).skip(skip);
    res.json({status : httpStatus.SUCCESS , data : users});
})

const register = asyncWrapper ( async (req , res) => {
    const {firstName , lastName , email , password , role} = req.body;

    const oldUser = await User.findOne({email : email});
    
    if (oldUser) {
        return res.status(400).json({status : httpStatus.FAIL , message : "User already exists"});
    }

    // Pass hashing
    const hashedPassword = await bcrypt.hash(password , 10 ,  )  
    const newUser = new User ({
        firstName, 
        lastName, 
        email, 
        password : hashedPassword,
        role,
        avatar : req.file.filename
    });

    // generate JWT token
    const token = await generateJWT({email : newUser.email ,id : newUser._id, role: newUser.role});
    console.log("Token :" ,token);
    newUser.token = token;


    await newUser.save();
    res.status(201).json({status : httpStatus.SUCCESS , data : newUser});
});

const login = asyncWrapper ( async (req, res) => {
    const {email , password} = req.body;
    if (!email && !password) {
        return res.status(400).json({status : httpStatus.FAIL , message : "Please enter email and password"});
    }

    const user = await User.findOne({email : email});
    
    if (!user) {
        return res.status(400).json({status : httpStatus.ERROR , message : "User Not Found"});
    }

    const matchedPassword = await bcrypt.compare(password , user.password);

    if (user && matchedPassword) {
        const token = await generateJWT({email : user.email ,id : user._id , role: user.role});
        return res.json({status : httpStatus.SUCCESS , data : token});
    }
    else {
        return res.status(400).json({status : httpStatus.ERROR , message : "Invalid email or password"});
    }
});
;



module.exports = {
    getAllUsers,
    register,
    login
}