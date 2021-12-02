'use strict'
const db = require('./dao/db')
const express = require('express');
const logger = require('morgan');

const Security = require("./security/Security")

const PORT = 8080;

const app = express();

module.exports = app

app.use(logger('dev'));
app.use(express.json());

/////////////////////////////
// PUBLIC API
////////////////////////////
const userRoutes = require("./routes/UserRoutes")
app.use("/", userRoutes)


Security.enable(app);


/////////////////////////////
// SECURED API
////////////////////////////

const contactRoutes = require("./routes/ContactRoutes")
app.use("/contacts", contactRoutes)

//////////////////////////////////////////////////////////

function customErrors(err, req, res, next) {
    res.status(err.status || 500).json(err.message);
}

app.use(customErrors);

db.connect().then(_ =>
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`))
).catch((e) => {
    console.log("Error connecting to db: " + e.message)
    process.exit(-1)
})
