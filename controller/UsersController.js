const Security = require("../security/Security")
const UserDao = require("../dao/UserDao")

exports.login = (req, resp) => {
    const user = req.body.userId;
    const password = req.body.password;
    console.log("User " + user + " logging in")
    Security.login(user, password).then(loginResult => {
        if (loginResult.tries === 0) {
            console.log("User " + user + " exceeded number of trials")
            resp.status(429).json(loginResult);
        } else {
            if (loginResult.badUser || loginResult.badPassword) {
                console.log("User " + user + " denid logging in:" + JSON.stringify(loginResult))
                resp.status(401).json(loginResult);
            } else {
                console.log("User " + user + " logged in")
                const token = Security.sign({userId: user});
                resp.status(200).json({token: token});
            }
        }
    }).catch(err => resp.status(500).json(err));
};


exports.signUp = (req, resp) => {
    const name = req.body.name;
    const surname = req.body.surname;
    const password = req.body.password;
    console.log("Signing up user " + name + " " + surname)
    UserDao.save({
        name: name,
        surname: surname,
        password: password
    }).then(userId => resp.json({userId: userId}))
        .catch(err => resp.status(500).json(err));

};
