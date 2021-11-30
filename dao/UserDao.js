/**
 * PASSWORDS ARE STORED IN SHA-256 DIGEST
 */
const digestModule = require('bcrypt');
const compareDigests = digestModule.compareSync;

const jspa = require("./JSPA");

exports.checkCredentials = async (user, password) => {
    const dbUser = await jspa.find("Users", {username: user});
    if (Object.entries(dbUser).length === 0) return {badUser: true, badPassword: true};
    return {
        badUser: false,
        badPassword: !compareDigests(password, dbUser.password, password),
        failures: dbUser.failures,
        lastFailure: new Date(dbUser.lastFailure || 0)
    }
}
exports.confirmLogin = user => jspa.update("Users", {username: user}, {failures: 0});

exports.denyLogin = (user, failureTime) => jspa.update("Users", {username: user}, {
    lastFailure: new Date().getTime(),
    failures: failureTime
});


exports.exists = (userID) => jspa.exists("Users", {username: userID});

