const mongoose = require('mongoose')

const phoneNumberSchema = new mongoose.Schema({
    number: {
        type: String,
        required: true,
    },
    numberType: {
        type: String,
        required: true,
        default: "Other"
    }
})
const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: false
    },
    phoneNumbers: {
        type: [phoneNumberSchema],
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

const PhoneNumberModel = mongoose.model("PhoneNumberModel", phoneNumberSchema)
const ContactModel = mongoose.model("Contact", contactSchema)

exports.save = async (contactDetail) => {
    const contact = new ContactModel({
        name: contactDetail.name,
        surname: contactDetail.surname,
        phoneNumbers: contactDetail.phoneNumbers.map(it => new PhoneNumberModel({
            number: it.number,
            numberType: it.numberType
        })),
        email: contactDetail.email,
        address: contactDetail.address
    })
    await contact.save()
    return contact.id
}

exports.delete = async contactId => {
    await ContactModel.findByIdAndDelete(contactId)
    return {}
}



