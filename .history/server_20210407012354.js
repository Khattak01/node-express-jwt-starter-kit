const express = require('express');
const connectDB = require('./_helper/db')
const cors = require('cors')
const app = express();

// database connection
connectDB()

//init middleware
app.use(cors())
app.use(express.json())

// app use
app.use('/api/users', require('./routes/users'))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/tests', require('./routes/tests'))
app.use('/api/posts', require('./routes/posts'))
app.use('/api/profile', require('./routes/profile'))

//test route
app.get('/', function (req, res) {
    res.status(200).send(`Welcome to api`);
});

// listening port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`app is live at ${PORT}`);
});
