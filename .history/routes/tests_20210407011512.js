const express = require('express');
const router = express.Router();
const Test = require('../models/Test');

//get all tests
router.get('/', async (req, res) => {
    try {
        const test = await Test.find();
        res.json(test);
    }
    catch (err) {
        res.status(500).send("Server error");
    }
});

//get test by id
router.get('/:id', async (req, res) => {
    try {
        const test = await Test({ "_id": req.params.id })
        if (!test) return res.json({ msg: 'test with the given id not found' })

        res.json(test);
    }
    catch (err) {
                if (err.kind == "ObjectId") {
            return res.status(400).send("test not found");
        }
        res.status(500).send('Server error')
    }
});

//add test
router.post('/', async (req, res) => {
    const { name, price, description } = req.body
    try {
        const testExists = await Test.findOne({ name: name })
        if (testExists) return res.json({ msg: "Test with the given name already exists" })

        const test = new Test({ name, price, description })
        test.save()
        res.json(test);
    }
    catch (err) {
        res.status(500).send('Server error')
    }
});

//updated test, we can use this sam eroute for adding test as well
router.post('/:id', async (req, res) => {

    const { name, price, description } = req.body
    const id = req.params.id
    try {
        const testExists = await Test.findOne({ "_id": id })
        // console.log(testExists)
        if (!testExists) return res.json({ msg: "Test with the given id does not exists" })

        const test = await Test.findOneAndUpdate(
            { _id: id },
            { $set: { name: name, price: price, description: description } },
            {new:true}//to return the updated values, not prev object
        )
        res.json(test);
    }
    catch (err) {
        if (err.kind == "ObjectId") {
            return res.status(400).send("test not found");
        }
        res.status(500).send('Server error')
    }
});

//delete test
router.delete('/:id', async (req, res) => {

    const id = req.params.id
    try {
        const testExists = await Test.findOne({ "_id": id })
        // console.log(testExists)
        if (!testExists) return res.json({ msg: "Test with the given id does not exists" })

        await Test.findOneAndRemove({
            _id: id,
        });
        res.json({ msg: "test deleted" });
    }
    catch (err) {
        if (err.kind == "ObjectId") {
            return res.status(400).send("test not found");
        }
        res.status(500).send('Server error')
    }
});


module.exports = router;
