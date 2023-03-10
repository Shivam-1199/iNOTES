const express = require('express');
const router = express.Router(); 
const User =require('../models/User')
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');


const JWT_SECRET = 'Shivamyouarer$ocking'

//Route 1: Create a User using: POST "/api/auth/createuser". No login required
router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({min : 3}),
    body('email', 'Eneter a valid email').isEmail(),
    body('password', 'Password must be atleat 5 characters').isLength({min : 5}),
] , async (req, res)=>{
    let success = false;
    // if there are errors return the bad request and errors
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({success, errors: errors.array()});
    }
    // check whether the user with this email exists already 
    try{
    let user = await User.findOne({email: req.body.email});
    if (user){
        return res.status(400).json({error: "Sorry a user with this email already exists"})
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);
    // create a new user
    user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email, 
    }); 
    const data = {
        user:{
            id: user.id
        }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);

    success = true;
    res.json({success, authtoken})
    // res.json(user)
    // .then(user => res.json(user))
    // catch errors
    } catch (error){
        console.error(error.mesaage);
        res.status(500).send("Internal server error occured");
    }
})


//Route 2: Authenticate a User using: POST "/api/auth/login". No login required

router.post('/login', [
    body('email', 'Eneter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
] , async (req, res)=>{
    let success = false;
    // if there are errors return the bad request and errors
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const {email, password} = req.body;
    try{
        let user = await User.findOne({email});
        if(!user){
            return res.status(400).json({error: "Please try to login with correct credentials"});
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if(!passwordCompare){
            success = false;
            return res.status(400).json({success, error: "Please try to login with correct credentials"});
        }

        const data = {
            user:{
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({success, authtoken})

    }catch (error){
        console.error(error.mesaage);
        res.status(500).send("Internal server error occured");        
    }

});

//Route 3: Get loggedin User details using: POST "/api/auth/getuser". login required
router.post('/getuser', fetchuser , async (req, res)=>{
    try{
        userId = req.user.id;
        const user = await User.findById(userId).select("-password")
        res.send(user)
    }catch (error){
        console.error(error.mesaage);
        res.status(500).send("Internal server error occured");        
    }
})

module.exports = router
