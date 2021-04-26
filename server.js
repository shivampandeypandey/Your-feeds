const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const bluebird = require('bluebird');
const mongoose = require('mongoose');
const logger = require('morgan')
const morganBody = require('morgan-body');

const PORT = process.env.PORT || 3001;
const app = express();




// Define middleware here
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Serve up static assets (usually on heroku)
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

// Morgan loggers.
app.use(logger('dev'));
morganBody(app, {
  logReqDateTime: false,
  logReqUserAgent: false
});

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/yourFeed", { promiseLibrary: bluebird });

// Define API routes here
const routes = require('./routes/api/index');
app.use(routes);

// Send every other request to the React app
// Define any API routes before this runs
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

app.listen(PORT, () => {
  console.log(`🌎 ==> Server started on port ${PORT}!`);
});
