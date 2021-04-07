const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar')
const User = require('../models/User')
const config = require('config')

// @route   POST api/users/register
// @desc    users users
// @access  Public
router.post('/register', [check('name', 'name is required').not().isEmpty(),
check('email', 'Please include a valid email').isEmail(),
check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { name, email, password } = req.body;

        try {
            // see if the user exists
            const emailExists = await User.findOne({ email })

            if (emailExists)
                return res.status(400).json({ errors: [{ msg: 'User already exists' }] })

            // // get avatar
            const avatar = gravatar.url(email, {
                protocol: 'http',
                s: '200'
            })
            user = new User({
                name, email, avatar, password
            })

            //bcrypt the password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);//it will create the hashed password and save to user
            await user.save()

            //return jsonwebtoken
            const payload = {
                user: {
                    id: user.id
                }
            }

            jwt.sign(
                payload,
                config.get('jwtSecret'),
                { expiresIn: 3600000 },/**for production it should be 36000 */
                (err, token) => {
                    if (err) throw err;

                    res.json({ token })
                })
        } catch (error) {
            res.status(500).send('Server error')
        }
    })

// @route   POST api/login
// @desc    authenticate users and get token
// @access  Public

router.post(
    "/login",
    [
        check("email", "Please include a valid email").isEmail(),
        check("password", "password is required").exists(),
    ],

    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            // see if the user exists
            const user = await User.findOne({ email });

            if (!user)
                return res
                    .status(400)
                    .json({ errors: [{ msg: "Invalid credentials" }] });

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch)
                // we can say the password is wrong but then all the users could know we have the user with the given email
                return res
                    .status(400)
                    .json({ errors: [{ msg: "Invalid credentials" }] });

            const payload = {
                user: {
                    id: user.id,
                },
            };

            jwt.sign(
                payload,
                config.get("jwtSecret"),
                { expiresIn: 3600000000 },
                /**for production it should be 36000 */
                (err, token) => {
                    if (err) throw err;

                    res.json({ token });
                }
            );
        } catch (error) {
            res.status(500).send("Server error");
        }
    }
);

module.exports = router;
