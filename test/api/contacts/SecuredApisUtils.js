const request = require("supertest");
const expect = require('chai').expect

module.exports = async function authenticate(app) {
    if (!app)
        throw "Illegal app argument"
    const signup = await request(app).post("/signup").send({
        name: "test",
        surname: "test",
        password: "test"
    })
    expect(signup.statusCode).equal(200)
    const userId = signup.body.userId
    const response = await request(app).post("/login").send({
        userId: userId,
        password: "test"
    })
    expect(response.statusCode).equal(200)
    return response.body.token
}
