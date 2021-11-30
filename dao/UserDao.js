/**
 * PASSWORDS ARE STORED IN SHA-256 DIGEST
 */
const digestModule = require('bcrypt');
const compareDigests = digestModule.compareSync;
const createDigest = data => digestModule.hashSync(data, digestModule.genSaltSync());

const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    surname: {type: String, required: true},
    password: {type: String, required: true},
    failures: {type: Number, required: false, default: 0},
    lastFailure: {type: Date, required: false}
})

const UserModel = mongoose.model("users", userSchema)

exports.checkCredentials = async (userId, password) => {
    const dbUser = await UserModel.findById(userId)
    if (dbUser == null) {
        return {badUser: true, badPassword: true, failures: 0};
    }
    return {
        badUser: false,
        badPassword: !compareDigests(password, dbUser.password),
        failures: dbUser.failures,
        lastFailure: dbUser.lastFailure || 0
    }
}
exports.confirmLogin = async userId => {
    const user = await UserModel.findById(userId)
    user.failures = 0
    await user.save()
}

exports.denyLogin = async (userId, failureTime) => {
    const user = await UserModel.findById(userId)
    if (user == null)
        return
    user.lastFailure = new Date()
    user.failures = failureTime
    await user.save()
}


exports.exists = (userID) => UserModel.exists(userID)

exports.save = async (userDetail) => {
    const user = new UserModel({
        name: userDetail.name,
        surname: userDetail.surname,
        password: createDigest(userDetail.password),
    })
    await user.save()
    return user.id
}
