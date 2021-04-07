const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const User = require("../models/User");

// @route   GET api/auth/
// @desc    auth route
// @access  Public

router.get("/", auth, async (req, res) => {
    try {

        let user = await User.findById(req.user.id).select("-password");
        //send the user info without password
        //we can access the user since we have set it in auth middleware
        if (!user)
            return res.status(403).json({ msg: "invalid token" })
        res.json(user);
    } catch (error) {
        res.status(500).json({ msg: "server error" });
    }
});


module.exports = router;
