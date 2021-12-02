const request = require("supertest");

module.exports = async function authenticate(app) {
    if (!app)
        throw "Illegal app argument"
    const signup = await request(app).post("/signup").send({
        name: "test",
        surname: "test",
        password: "test"
    })
    const userId = signup.body.userId
    const response = await request(app).post("/login").send({
        userId: userId,
        password: "test"
    })
    return response.body.token
}
