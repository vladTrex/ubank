const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');

const app = express();

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// DB config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose
    .connect(db, {useNewUrlParser: true})
    .then(() => console.log('' +
        'MongoDB connected'))
    .catch(err => console.log(err));

// Passport config
app.use(passport.initialize());
require('./config/passport')(passport);

// Use routes
app.use('/api/users', users);
app.use('/api/profile', profile);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`))