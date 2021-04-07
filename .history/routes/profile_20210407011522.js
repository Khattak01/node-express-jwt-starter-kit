const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const { check, validationResult } = require("express-validator");

const Profile = require("../models/Profile");
const User = require("../models/User");

// @route   GET api/profile/me
// @desc    get the current user profile
// @access  Private
// router.get('/test', (req, res) => res.json({ msg: 'Profile Works' }));

router.get("/me", auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id,
        }).populate("user", ["name", "avatar"]); //populate methode will bring the array of properties from user

        if (!profile)
            return res.status(400).json({ msg: "There is no profile for this user" });

        res.json(profile)
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Server error");
    }
});

// @route   POST api/profile
// @desc    create or update the user profile
// @access  Private
router.post(
    "/",
    [
        auth,
        [
            check("cnic", "cnic is required").not().isEmpty(),
            check("contact", "contact is required").not().isEmpty(),
            check("district", "district is required").not().isEmpty(),
            check("city", "city is required").not().isEmpty(),
            check("address", "address is required").not().isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const {
            cnic,
            contact,
            contactType,
            address,
            district,
            city,
            dob
        } = req.body;

        const profileField = { detailInfo: {} };
        const user = await User.findById(req.user.id)

        profileField.user = req.user.id;
        profileField.name = user.name;
        profileField.email = user.email;

        if (cnic) profileField.cnic = cnic;
        if (contact) profileField.contact = contact;

        if (contactType) profileField.detailInfo.contactType = contactType;
        if (address) profileField.detailInfo.address = address;
        if (district) profileField.detailInfo.district = district;
        if (city) profileField.detailInfo.city = city;
        if (dob) profileField.detailInfo.dob = dob;


        try {
            let profile = await Profile.findOne({ user: req.user.id });
            // console.log("TRY in")
            if (profile) {
                //update
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileField },
                    { new: true }
                );
                return res.json(profile);
            }
            //Create
            // console.log("Create profile")
            profile = new Profile(profileField);
            await profile.save();

            res.send(profile);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Server error");
        }
    }
);

// @route   GET api/profile
// @desc    get all profile profile
// @access  Public

router.get("/", async (req, res) => {
    try {
        const profiles = await Profile.find().populate("user", ["name", "avater"]);
        res.json(profiles);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

// @route   GET api/profile/user/:user_id
// @desc    get the profile by id
// @access  Public

router.get("/user/:user_id", async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.params.user_id,
        }).populate("user", ["name", "avater"]);
        if (!profile) return res.status(400).send({ msg: "Profile not found" });

        res.json(profile);
    } catch (error) {
        console.error(error.message);
        if (error.kind == "ObjectId") {
            return res.status(400).send("Profile not found");
        }
        res.status(500).send("Server error");
    }
});

// @route   DELETE api/profile/
// @desc    delete the user profile
// @access  private

router.delete("/", auth, async (req, res) => {
    try {
        //remove the profile
        await Profile.findOneAndRemove({
            user: req.user.id,
        });
        //remove the user
        await User.findOneAndRemove({
            _id: req.user.id,
        });

        res.json({ msg: "user deleted" });
    } catch (error) {
        console.error(error.message);
        if (error.kind == "ObjectId") {
            return res.status(400).send("Profile not found");
        }
        res.status(500).send("Server error");
    }
});

module.exports = router;

