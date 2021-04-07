const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const { check, validationResult } = require("express-validator");

const Post = require("../models/Posts.js");
const User = require("../models/User.js");

// @route   GET api/posts
// @desc    Get posts
// @access  priavte
router.get('/', auth, async (req, res) => {
    try {

        const posts = await Post.find().sort({ date: -1 })
        res.json(posts)

    } catch (error) {
        console.log(error);
        res.status(500).send("Server error");
    }

});

// @route   GET api/posts/:id
// @desc    Get posts by id
// @access  priavte
router.get('/:id', auth, async (req, res) => {
    try {

        const post = await Post.findById(req.params.id)

        if (!post) return res.status(404).json({ msg: "post not found" })
        res.json(post)

    } catch (error) {
        console.log(error);

        //if pass invalid id then this line will run
        if (error.kind === "ObjectId") res.status(404).json({ msg: "post not found" })

        res.status(500).send("Server error");
    }

});

// @route   GET api/posts
// @desc    add new post 
// @access  Public
router.post(
    "/",
    [auth, [check("text", "Text is required").not().isEmpty()]],
    async (req, res) => {
        // console.log(req.user.id)
        const errors = validationResult(req);
        if (!errors) return res.status(404).json({ errors: errors.array() });

        try {
            const user = await User.findById(req.user.id).select("-password");

            // console.log("user >>> ", user)
            const newPost = new Post({
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id,
            });

            const post = await newPost.save()

            res.json(post)

        } catch (error) {
            console.log(error);
            res.status(500).send("Server error");
        }
    }
);

// @route   Delete api/posts/:id
// @desc    delete a posts by id
// @access  priavte
router.delete('/:id', auth, async (req, res) => {
    try {

        const post = await Post.findById(req.params.id)

        //check post
        if (!post) res.status(404).json({ msg: "post not found" })

        //check user
        if (post.user.toString() !== req.user.id) return res.status(401).json({ msg: "user not authorized" })

        await post.remove()

        res.json({ msg: 'post removed' })

    } catch (error) {
        console.log(error);

        //if pass invalid id then this line will run
        if (error.kind === "ObjectId") res.status(404).json({ msg: "post not found" })

        res.status(500).send("Server error");
    }

});


// @route   Put api/posts/like/:id
// @desc    like a post
// @access  priavte
router.put('/like/:id', auth, async (req, res) => {
    try {

        const post = await Post.findById(req.params.id)
        console.log(post)

        //check if the post is already liked by the user
        // if (post.likes.filter(like => like.user.toString()===req.user.id).lenght > 0) {
        if (post.likes.find(like => like.user.toString() === req.user.id)) {
            return res.status(400).json({ msg: "post already liked" })
        }

        post.likes.unshift({ user: req.user.id })//we also can use push instead of unshift

        await post.save()

        res.json(post.likes)
    } catch (error) {
        console.log(error);
        res.status(500).send("Server error");
    }
});

// @route   Put api/posts/unlike/:id
// @desc    unlike a post
// @access  priavte
router.put('/unlike/:id', auth, async (req, res) => {
    try {

        const post = await Post.findById(req.params.id)
        // console.log(post)
        if (!post.likes.find(like => like.user.toString() === req.user.id)) {
            return res.status(400).json({ msg: "post has not been liked" })
        }
        // Get remove index
        const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

        // Splice out of array
        post.likes.splice(removeIndex, 1);


        await post.save()

        res.json(post)
    } catch (error) {
        console.log(error);
        res.status(500).send("Server error");
    }
});


//comments routes

// @route   POST api/posts/comment/:id
// @desc    comment on a post 
// @access  Private
router.post(
    "/comment/:id",
    [auth, [check("text", "Text is required").not().isEmpty()]],
    async (req, res) => {
        // console.log(req.user.id)
        const errors = validationResult(req);
        if (!errors) return res.status(404).json({ errors: errors.array() });

        try {
            const user = await User.findById(req.user.id).select("-password");
            const post = await Post.findById(req.params.id);

            // console.log("user >>> ", user)
            const newComment = new Post({
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id,
            });

            post.comments.unshift(newComment)

            await post.save()

            res.json(post)

        } catch (error) {
            console.log(error);
            res.status(500).send("Server error");
        }
    }
);

// @route   DELETE api/posts/comment/:post_id/:comment_id
// @desc    delete a post
// @access  Private
router.delete("/comment/:post_id/:comment_id", auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);

        //pull out comment
        const comment = post.comments.find(comment => comment.id === req.params.comment_id)

        //make sure comment exists
        if (!comment) return res.status(404).json({ msg: 'comment does not exists' })

        //check user
        if (comment.user.toString() !== req.user.id) return res.status(401).json({ msg: 'user not authorizes' })

        // Get remove index
        const removeIndex = post.comments
            .map(item => item.user.toString())
            .indexOf(req.user.id);

        // Splice out of array
        post.comments.splice(removeIndex, 1);

        await post.save()

        res.json(post)

    } catch (error) {
        console.log(error);
        res.status(500).send("Server error");
    }
}
);

module.exports = router;
