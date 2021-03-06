const express = require('express');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const User = require('../../models/Users');
const keys = require('../../config/keys');
const validateRegisterInput = require('../../validation/register');

const router = express.Router();

// @route   GET api/users/test
// @desc    Test route users
// @access  Public route

router.get('/test', (req, res) => res.json({
    msg: 'Users works'
}));

router.post('/register', (req, res) => {
    const {errors, isValid} = validateRegisterInput(req.body);

    if (!isValid){
        return res.status(400).json(errors);
    }


    User.findOne({ email: req.body.email })
        .then(user => {
            if(user){
                return res.status(400).json({
                    email: 'Email already exists'
                });
            } else {
                const avatar = gravatar.url(req.body.email, {
                    s: '200',
                    r: 'pg',
                    d: 'mm'
                });

                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    avatar,
                    password: req.body.password,
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err));
                    });
                });
            }
        });
});

router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({email})
        .then(user => {
            if(!user){
                return res.status(404).json({
                    email: 'User not found'
                });
            }

            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if(isMatch){
                        const payload = {
                            id: user.id,
                            name: user.name,
                            avatar: user.avatar,
                        };

                        jwt.sign(payload, keys.secretOrKey, {expiresIn: 3600}, (err, token) => {
                            res.json({
                                success: true,
                                token: 'Bearer '+ token,
                            });
                        });
                        // return res.json({message: 'Success'});
                    } else {
                        return res.status(400).json({password: 'Password is incorrect'});
                    }
                });
        });
});

// @route GET api/users/current
// @desc Return current user
// @access Private
router.get('/current',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
    return res.json(req.user);
});

module.exports = router;