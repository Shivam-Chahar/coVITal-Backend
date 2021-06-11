const {User, validateUser} = require('../models/users');
const express = require('express');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../middlewares/auth');
const multer = require('multer');
const fs = require('fs');
const router = express.Router();


router.post('/register', upload.single('profilePicture') ,async (req, res)=> {
    const {error} = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let newUser = await User.findOne({email: req.body.email});
    if (newUser) return res.status(400).send("User email already registered");

    const salt = await bcrypt.genSalt(10);
    newUser = new User({
        firstName: req.body.firstName,
        lastName:req.body.lastName,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password, salt),
        accountCreatedOn: Date.now(),
        profilePicturePath:checkPicture()
    })
    function checkPicture(){
        if(req.file !== undefined)
            return req.file.filename;
        else return null
    }

    await newUser.save();
    const token = newUser.generateAuthToken();
    res.header("x-auth-token",token).send( _.pick(newUser, ["name","actualName","email","accountCreatedOn"]) );
})



module.exports = router