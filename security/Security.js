const JWT = require('jsonwebtoken');
const jwtExpireTime = 600;
const express_jwt = require('express-jwt');
const UserDao = require("../dao/UserDao");
const {sleep} = require("../utils/Utilities")
const failureThreshold = 5;
const blockTime = 60 * 60 * 1000;
const waitFactor = 1000;

/**
 * Creates a new secret for every server instance; so at server restart no token will be longer valid.
 * This compromise is accepted since server restart should be rare and the generated secret is more secure.
 * Additionally, this avoids the necessity of saving it.
 * @type {string}
 */
const jwtSecret = require("crypto").randomBytes(128).toString('hex');

exports.sign = something => JWT.sign(something, jwtSecret, {expiresIn: jwtExpireTime})
exports.getExpirationTime = () => jwtExpireTime;
exports.enable = app => app.use(
    express_jwt({
        secret: jwtSecret,
        getToken: req => req.cookies.token
    })
);

exports.login = async (user, password) => {
    if (!user || !password) {
        return {badUser: true, badPassword: true};
    }
    const result = await UserDao.checkCredentials(user, password);

    if (result.failures && result.failures >= failureThreshold && (new Date() - result.lastFailure) < blockTime) {
        const until = result.lastFailure;
        until.setTime(until.getTime() + blockTime)
        return {tries: 0, until: until.toISOString()};
    }
    let tries;
    if (result.badUser || result.badPassword) {
        const nFailure = result.failures + 1;
        UserDao.denyLogin(user, nFailure);
        await sleep(waitFactor * (nFailure - 1));
        tries = result.failures > failureThreshold ? 0 : failureThreshold - result.failures;
    } else {
        UserDao.confirmLogin(user);
        tries = failureThreshold;
    }
    return {
        badUser: result.badUser,
        badPassword: result.badPassword,
        tries: tries
    };
}
