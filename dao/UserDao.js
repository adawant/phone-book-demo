/**
 * PASSWORDS ARE STORED IN SHA-256 DIGEST
 */
const digestModule = require('bcrypt');
const {v4: uuidv4} = require('uuid');
const compareDigests = digestModule.compareSync;
const createDigest = data => digestModule.hashSync(data, digestModule.genSaltSync());

const jspa = require("./JSPA");

exports.checkCredentials = async (user, password) => {
    const dbUser = await jspa.find("Users", {userId: user});
    if (Object.entries(dbUser).length === 0) return {badUser: true, badPassword: true};
    return {
        badUser: false,
        badPassword: !compareDigests(password, dbUser.password, password),
        failures: dbUser.failures,
        lastFailure: new Date(dbUser.lastFailure || 0)
    }
}
exports.confirmLogin = user => jspa.update("Users", {userId: user}, {failures: 0});

exports.denyLogin = (user, failureTime) => jspa.update("Users", {userId: user}, {
    lastFailure: new Date().getTime(),
    failures: failureTime
});


exports.exists = (userID) => jspa.exists("Users", {userId: userID});

exports.save = (userDetail) => jspa.save("Users", {
    name: userDetail.name,
    surname: userDetail.surname,
    password: createDigest(userDetail.password),
    userId: uuidv4()
})
