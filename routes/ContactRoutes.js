const express = require('express');
const contactsController = require("../controller/ContactsController");
const router = express.Router()
module.exports = router

/**
 * Create a contact, returns its ID.
 */
router.post("/", contactsController.saveContact);


/**
 * Patch a contact
 */
router.patch("/:id", contactsController.patchContact);

/**
 * Put a contact
 */
router.put("/:id", contactsController.updateContact);

/**
 * Delete a contact
 */
router.delete("/:id", contactsController.deleteContact);


router.get("/:id", contactsController.getContactById);

/**
 * Get the contacts paged and sorted
 */
router.get("/", contactsController.getContacts);

