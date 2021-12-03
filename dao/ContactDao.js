const mongoose = require('mongoose')
const {mongo} = require("mongoose");

const contactSchema = new mongoose.Schema({
    userOwnerId: String,
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: false
    },
    phoneNumbers: {
        type: [{
            number: {
                type: String,
                required: true,
            },
            numberType: {
                type: String,
                required: true,
                default: "Other"
            }
        }],
        required: true
    },
    email: {
        type: String,
        required: false
    },
    address: {
        type: String,
        required: false
    }
})

const ContactModel = mongoose.model("contacts", contactSchema)

exports.save = (contactDetail) => {
    const contact = new ContactModel({
        userOwnerId: contactDetail.userOwnerId,
        name: contactDetail.name,
        surname: contactDetail.surname,
        phoneNumbers: contactDetail.phoneNumbers,
        email: contactDetail.email,
        address: contactDetail.address
    })
    return contact.save().then(_ => contact.id)
}

exports.partialUpdate = async (id, contactDetail) => {
    const contact = await ContactModel.findById(id)
    if (contact == null)
        return null

    if (contactDetail.name != null)
        contact.name = contactDetail.name

    if (contactDetail.surname != null)
        contact.surname = contactDetail.surname

    if (contactDetail.email != null)
        contact.email = contactDetail.email

    if (contactDetail.address != null)
        contact.address = contactDetail.address

    if (contactDetail.phoneNumbers != null) {
        contactDetail.phoneNumbers.map(it => {
            return {
                old: contact.phoneNumbers.find(e => e.number === it.number),
                new: it
            }
        }).forEach(it => {
            if (!it.old)
                contact.phoneNumbers.push(it.new)
            else it.old.numberType = it.new.numberType
        })
    }

    await contact.save()
    return contact
}

exports.delete = async contactId => {
    const contact = await ContactModel.findById(contactId)
    await ContactModel.findByIdAndDelete(contactId)
    return contact
}

exports.get = contactId => ContactModel.findById(contactId);


exports.getAllPaged = (ownerId, pagination) => {
    pagination.size = pagination.size || 10
    pagination.page = pagination.page || 0
    const filter = {
        userOwnerId: ownerId,
    }
    if (pagination.sortedKey) {

    }
    let findProcedure = ContactModel.find(filter)
        .limit(pagination.size)
        .skip(pagination.size * pagination.page);
    if (pagination.sortedKey) {
        const sort = {}
        if (!pagination.sorted || (pagination.sorted !== "asc" && pagination.sorted !== "desc"))
            pagination.sorted = "asc"
        findProcedure = findProcedure.sort(sort)
    } else pagination.sorted = undefined
    return findProcedure.then(c => {
        return {
            page: pagination.page,
            size: c.length,
            sortedKey: pagination.sortedKey,
            sorted: pagination.sorted,
            content: c
        }
    })
}

exports.isValidId = id => mongoose.isValidObjectId(id)
