// process.env.NODE_ENV = "test"
const expect = require('chai').expect
const request = require('supertest')

const authenticate = require("./SecuredApisUtils")

const app = require('../../../server')
const db = require('../../../dao/db')


describe('PUT /contacts/:id', () => {


    //////////////////////////////////
    // TEST BASIC USER RETRIEVE WITH AND WITHOUT AUTH
    //////////////////////////////////

    it('Not auth then auth patch', (done) => {
        doPut("something", {}).then((response) => {
            expect(response.status).equal(401)
            authenticate(app).then(token => {
                doPut("something", {}, token).then(r => {
                    expect(r.status).equal(404)
                    done()
                }).catch(e => done(e))
            }).catch(e => done(e))
        }).catch(e => done(e))
    })


    it('Basic put', (done) => {
        authenticate(app).then(token => {
            const exampleContact = {
                name: "test",
                phoneNumbers: [{
                    number: "00",
                    numberType: "mobile"
                }]
            }
            doPost(exampleContact, token).then(r => {

                const id = r.body.contactId
                doGet(id, token).then(r => {
                    expect(r.status).equal(200)
                    const body = r.body
                    expect(body.name).to.eql(exampleContact.name)
                    expect(body.phoneNumbers).to.length(1)
                    expect(body.phoneNumbers[0].number).to.equal(exampleContact.phoneNumbers[0].number)
                    expect(body.phoneNumbers[0].numberType).to.equal(exampleContact.phoneNumbers[0].numberType)

                    doPut(id, {name: "another name"}, token).then(r => {
                        expect(r.status).equal(200)
                        const body = r.body
                        expect(body.name).to.eql("another name")
                        expect(body.phoneNumbers).to.length(0)

                        doPut(id, {phoneNumbers: [{number: "11"}]}, token).then(r => {
                            expect(r.status).equal(400)
                            doPut(id, {name: "qwerty",phoneNumbers: [{number: "00", numberType: "work"}]}, token).then(r => {
                                expect(r.status).equal(200)
                                const body = r.body
                                expect(body.name).to.eql("qwerty")
                                expect(body.phoneNumbers).to.length(1)
                                expect(body.phoneNumbers[0].number).to.equal("00")
                                expect(body.phoneNumbers[0].numberType).to.equal("work")
                                done()

                            }).catch(e => done(e))
                        }).catch(e => done(e))
                    }).catch(e => done(e))
                }).catch(e => done(e))
            }).catch(e => done(e))
        }).catch(e => done(e))
    })

    it('Only logged user put', (done) => {
        authenticate(app).then(token => {
            const exampleContact = {
                name: "test",
                phoneNumbers: [{
                    number: "00",
                    numberType: "mobile"
                }]
            }
            doPost(exampleContact, token).then(r => {
                const id = r.body.contactId

                doPut(id, {name: "test"}, token).then(r => {
                    expect(r.status).equal(200)

                    authenticate(app) //now login with other user
                        .then(token2 => {
                            doPut(id, {name: "test2"}, token2).then(r => {
                                expect(r.status).equal(403)
                                done()
                            }).catch(e => done(e))
                        }).catch(e => done(e))
                }).catch(e => done(e))
            }).catch(e => done(e))
        }).catch(e => done(e))
    })
})

function doGet(id, token) {
    let basicRequest = request(app).get("/contacts/" + id)
    if (token)
        basicRequest = basicRequest.set({"x-auth": token})
    return basicRequest
}


function doPut(id, body, token) {
    let basicRequest = request(app).put("/contacts/" + id)
    if (token)
        basicRequest = basicRequest.set({"x-auth": token})
    return basicRequest.send(body)
}

function doPost(body, token) {
    let basicRequest = request(app).post("/contacts")
    if (token)
        basicRequest = basicRequest.set({"x-auth": token})
    return basicRequest.send(body)
}

