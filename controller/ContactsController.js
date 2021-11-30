const ContactDao = require("../dao/ContactDao")


exports.saveContact = (req, resp) => {
    const contactDetail = {
        userOwnerId: req.user.userId,
        name: req.body.name,
        surname: req.body.password,
        phoneNumbers: req.body.phoneNumbers,
        email: req.body.email,
        address: req.body.address
    }
    console.log("Saving contact " + JSON.stringify(contactDetail))
    ContactDao.save(contactDetail).then(id => {
        console.log("Contact " + id + " saved");
        return id;
    }).then(contactId => resp.status(201).json({contactId: contactId}))
        .catch(err => {
            if (err.name && err.name === "ValidationError") {
                console.log("Contact is not valid: " + JSON.stringify(err.errors))
                resp.status(400).json(err)
            } else handleError(err, resp);
        });
};


exports.updateContact = (req, resp) => {

}


exports.deleteContact = async (req, resp) => {
    console.log("Deleting contact " + req.params.id)
    const contact = await checkUserAllowed(req.params.id, req, resp)
    if (contact != null)
        ContactDao.delete(contact.id)
            .then(c => resp.status(200).json(c))
            .then(_ => console.log("Contact " + req.params.id + " deleted"))
            .catch(err => handleError(err, resp));
}


exports.getContactById = (req, resp) => {
}
exports.getContacts = (req, resp) => {
}

const checkUserAllowed = async (resourceId, req, resp) => {
    const contact = await ContactDao.get(resourceId)
    if (contact == null) {
        console.log('Contact with id ' + resourceId + " not found")
        resp.status(404).json({message: "Contact not found"})
        return null
    } else if (contact.userOwnerId !== req.user.userId) {
        console.log('User ' + req.user.userId + " is not the owner of " + resourceId)
        resp.status(403).json({message: "User is not the owner of the contact"})
        return null
    }
    return contact
}

const handleError = (err, resp) => {
    console.log("Error " + JSON.stringify(err))
    resp.status(500).json(err)
}
