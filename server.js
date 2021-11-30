'use strict'
const express = require('express');
const logger = require('morgan');
const controller = require("./controller/ContactController");
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
app.post("/signup", controller.signup);


/**
 * LOGIN USER
 */
app.post("/login", controller.login);


app.use(cookieParser());

/**
 * LOGOUT THE USER
 */
app.get("/logout", controller.logout)


Security.enable(app);


/////////////////////////////
// SECURED API
////////////////////////////

const contextPath = "/contacts"
/**
 * Create a contact, returns its ID.
 */
app.post(contextPath, /*TODO VALIDATION*/ controller.saveContact);


/**
 * Patch a contact
 */
app.patch(contacts + "/:id", /*TODO VALIDATION*/ controller.updateContact);

/**
 * Delete a contact
 */
app.delete(contacts + "/:id", controller.deleteContact);


app.get(contacts + "/:id", controller.getContactById);

/**
 * Get the contacts paged and sorted
 */
app.get(contextPath, /*TODO PAGED PARAMETERS VALIDATION*/ controller.getContacts);


//////////////////////////////////////////////////////////

function customErrors(err, req, res, next) {
    res.status(err.status).json(err.message);
}

app.use(customErrors);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`));
