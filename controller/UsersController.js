const Security = require("../security/Security")
const UserDao = require("../dao/UserDao")


exports.login = (req, resp) => {
    const user = req.body.userId;
    const password = req.body.password;
    Security.login(user, password).then(loginResult => {
        if (loginResult.tries === 0)
            resp.status(429).json(loginResult);
        else {
            if (loginResult.badUser || loginResult.badPassword)
                resp.status(401).json(loginResult);
            else {
                const token = Security.sign({userId: user});
                resp.cookie('token', token, {
                    httpOnly: true,
                    sameSite: true,
                    maxAge: 1000 * Security.getExpirationTime()
                }).status(200).end();
            }
        }
    }).catch(err => resp.status(500).json(err));
};

// invalidating the token would require to store all the invalidations until their expiration. Out of scope. Just removing the cookie
exports.logout = (req, resp) => resp.clearCookie("token").status(200).end();

exports.signUp = (req, resp) => {
    const name = req.body.name;
    const surname = req.body.surname;
    const password = req.body.password;
    UserDao.save({
        name: name,
        surname: surname,
        password: password
    }).then(userId => resp.json({userId: userId})).catch(err => resp.status(500).json(err));

};
