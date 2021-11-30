const mongoose = require('mongoose')

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

exports.save = async (contactDetail) => {
    const contact = new ContactModel({
        userOwnerId: contactDetail.userOwnerId,
        name: contactDetail.name,
        surname: contactDetail.surname,
        phoneNumbers: contactDetail.phoneNumbers,
        email: contactDetail.email,
        address: contactDetail.address
    })
    await contact.save()
    return contact.id
}

exports.delete = async contactId => {
    const contact = await ContactModel.findById(contactId)
    await ContactModel.findByIdAndDelete(contactId)
    return contact
}

exports.get = async contactId => {
    return ContactModel.findById(contactId);
}



