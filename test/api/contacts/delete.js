process.env.NODE_ENV = "test"
const expect = require('chai').expect
const request = require('supertest')

const authenticate = require("./SecuredApisUtils")

const app = require('../../../server')
const db = require('../../../dao/db')


describe('DELETE /contacts/:id', () => {


    //////////////////////////////////
    // TEST BASIC USER RETRIEVE WITH AND WITHOUT AUTH
    //////////////////////////////////

    it('Not auth then auth delete', (done) => {
        doDelete("something").then((response) => {
            expect(response.status).equal(401)
            authenticate(app).then(token => {
                doDelete("something", token).then(r => {
                    expect(r.status).equal(404)
                    done()
                }).catch(e => done(e))
            }).catch(e => done(e))
        }).catch(e => done(e))
    })


    it('Basic delete', (done) => {
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

                    doDelete(id, token).then(r => {
                        expect(r.status).equal(200)

                        doGet(id, token).then(r => {
                            expect(r.status).equal(404)

                            doDelete(id, token).then(r => {
                                expect(r.status).equal(404)
                                done()


                            }).catch(e => done(e))
                        }).catch(e => done(e))
                    }).catch(e => done(e))
                }).catch(e => done(e))
            }).catch(e => done(e))
        }).catch(e => done(e))
    })

    it('Only logged user delete', (done) => {
        authenticate(app).then(token => {
            const exampleContact = {
                name: "test",
                phoneNumbers: [{
                    number: "00",
                    numberType: "mobile"
                }]
            }
            doPost(exampleContact, token).then(r => { //save two contacts
                const id = r.body.contactId
                doPost(exampleContact, token).then(r => { //save two contacts
                    const id2 = r.body.contactId
                    doDelete(id, token).then(r => { //delete the first with the owner account
                        expect(r.status).equal(200)

                        authenticate(app) //now login with other user
                            .then(token2 => {

                                doDelete(id2, token2).then(r => { //try delete the second with another account
                                    expect(r.status).equal(403)

                                    doDelete(id2, token).then(r => { //delete the second with owner account
                                        expect(r.status).equal(200)
                                        done()

                                    }).catch(e => done(e))
                                }).catch(e => done(e))
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


function doDelete(id, token) {
    let basicRequest = request(app).delete("/contacts/" + id)
    if (token)
        basicRequest = basicRequest.set({"x-auth": token})
    return basicRequest
}

function doPost(body, token) {
    let basicRequest = request(app).post("/contacts")
    if (token)
        basicRequest = basicRequest.set({"x-auth": token})
    return basicRequest.send(body)
}

