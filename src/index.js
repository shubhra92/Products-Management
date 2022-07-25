const express = require('express');
const app = express();
const routes = require('./routes/routes')
const mongoose = require('mongoose');
const multer = require('multer');

// app.use(multer().(function (req, file, cb) { if (file. mimetype == "image/png" || file. mimetype == "image/jpg" ) return true } ))

app.use(express.json());

mongoose.connect('mongodb+srv://avi-sin:CJTIF4CupXQdRKHV@cluster0.ovf3r.mongodb.net/group66Database')
.then(() => console.log('MongoDb is connected...'), (err) => console.log(err))
// .catch((err) => console.log(err));

app.use(routes);

app.listen(3000, () => console.log('Express app is running on port 3000'));