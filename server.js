'use strict'
const express = require('express');
const logger = require('morgan');
const contactsController = require("./controller/ContactController");
const usersController = require("./controller/UsersController");

const cookieParser = require('cookie-parser');
const Security = require("./security/Security")

const PORT = 3001;

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


app.use(cookieParser());

/**
 * LOGOUT THE USER
 */
app.get("/logout", usersController.logout)


Security.enable(app);


/////////////////////////////
// SECURED API
////////////////////////////

const contextPath = "/contacts"
/**
 * Create a contact, returns its ID.
 */
app.post(contextPath, /*TODO VALIDATION*/ contactController.saveContact);


/**
 * Patch a contact
 */
app.patch(contacts + "/:id", /*TODO VALIDATION*/ contactController.updateContact);

/**
 * Delete a contact
 */
app.delete(contacts + "/:id", contactController.deleteContact);


app.get(contacts + "/:id", contactController.getContactById);

/**
 * Get the contacts paged and sorted
 */
app.get(contextPath, /*TODO PAGED PARAMETERS VALIDATION*/ contactController.getContacts);


//////////////////////////////////////////////////////////

function customErrors(err, req, res, next) {
    res.status(err.status).json(err.message);
}

app.use(customErrors);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`));
