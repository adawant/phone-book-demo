const ContactDao = require("../dao/ContactDao")

const extractContactDetailsFromRequest = req => {
    return {
        userOwnerId: req.user.userId,
        name: req.body.name,
        surname: req.body.password,
        phoneNumbers: req.body.phoneNumbers,
        email: req.body.email,
        address: req.body.address
    }
}

exports.saveContact = (req, resp) => {
    const contactDetail = extractContactDetailsFromRequest(req)
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


exports.updateContact = async (req, resp) => {
    const contactDetail = extractContactDetailsFromRequest(req)
    console.log("Updating contact " + req.params.id + " with " + JSON.stringify(contactDetail))
    const contact = await checkUserAllowed(req.params.id, req, resp)
    if (contact != null)
        ContactDao.partialUpdate(req.params.id, contactDetail).then(c => {
            console.log("Contact " + req.params.id + " saved");
            return c;
        }).then(c => resp.status(200).json(c))
            .catch(err => {
                if (err.name && err.name === "ValidationError") {
                    console.log("Contact is not valid: " + JSON.stringify(err.errors))
                    resp.status(400).json(err)
                } else handleError(err, resp);
            });
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
    console.log("Retrieving contact " + req.params.id)
    checkUserAllowed(req.params.id, req, resp).then(c => {
            if (c != null)
                resp.status(200).json(c)
        }
    ).catch(err => handleError(err, resp));
}


exports.getContacts = (req, resp) => {
    const pagination = {
        page: parseInt(req.query.page, 10),
        size: parseInt(req.query.size, 10),
        sortedKey: req.query.sortedKey,
        sorted: req.query.sorted
    }
    console.log("Retrieving contacts " + JSON.stringify(pagination) + " of owner " + req.user.userId)
    ContactDao.getAllPaged(req.user.userId, pagination).then(c => resp.status(200).json(c)).catch(err => handleError(err, resp));
}

const checkUserAllowed = async (resourceId, req, resp) => {
    function notFound() {
        console.log('Contact id ' + resourceId + " is not compliant")
        resp.status(404).json({message: "Contact not found"})
    }

    if (!ContactDao.isValidId(resourceId)) {
        notFound()
        return null
    }
    const contact = await ContactDao.get(resourceId)
    if (contact == null) {
        notFound()
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
