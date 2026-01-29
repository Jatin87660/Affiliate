const express = require('express');
const app = express();
const path = require('path');
const mongoose = require("mongoose");


const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));




require('dotenv').config();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'photos')));
app.use(express.static(path.join(__dirname, 'public')));


const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error(err));




const home = require('./routes/home')
app.use(home);

const auth = require('./routes/auth')
app.use('/auth', auth)

const main = require('./routes/main');
app.use('/main',main);





const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server is listening on 3000");
})