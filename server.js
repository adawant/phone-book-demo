'use strict'
require('dotenv').config()

const express = require('express');
const logger = require('morgan');

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL).catch(e => {
    console.log(`Error connecting to db: ${e.message}`)
    process.exit(-1)
})

const contactsController = require("./controller/ContactsController");
const usersController = require("./controller/UsersController");

const Security = require("./security/Security")

const PORT = 8080;

const app = express();

app.use(logger('dev'));
app.use(express.json());

/////////////////////////////
// PUBLIC API
////////////////////////////

/**
 * CREATE USER
 */
app.post("/signup", usersController.signUp);


/**
 * LOGIN USER
 */
app.post("/login", usersController.login);


Security.enable(app);


/////////////////////////////
// SECURED API
////////////////////////////

const contextPath = "/contacts"
/**
 * Create a contact, returns its ID.
 */
app.post(contextPath, contactsController.saveContact);


/**
 * Patch a contact
 */
app.patch(contextPath + "/:id", contactsController.updateContact);

/**
 * Delete a contact
 */
app.delete(contextPath + "/:id", contactsController.deleteContact);


app.get(contextPath + "/:id", contactsController.getContactById);

/**
 * Get the contacts paged and sorted
 */
app.get(contextPath, contactsController.getContacts);


//////////////////////////////////////////////////////////

function customErrors(err, req, res, next) {
    res.status(err.status || 500).json(err.message);
}

app.use(customErrors);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`));
