process.env.NODE_ENV = "test"
const expect = require('chai').expect
const request = require('supertest')

const authenticate = require("./SecuredApisUtils")

const app = require('../../../server')
const db = require('../../../dao/db')

describe('POST /contacts', () => {
    //////////////////////////////////
    // TEST BASIC USER CREATION WITH AND WITHOUT AUTH
    //////////////////////////////////

    it('User creation', (done) => {

        const body = {
            name: "test",
            phoneNumbers: [{
                number: "00",
                numberType: "mobile"
            }],
            email: "a@b.com",
            address: "here"
        }

        doPost(body).then((response) => {
            expect(response.status).equal(401)
            authenticate(app).then(token => {
                doPost(body, token).then(r => {
                    const body = r.body
                    expect(body).to.contain.property('contactId')

                    const body2 = { //no phone numbers, only name. Phones let you do this
                        name: "test"
                    }
                    doPost(body2, token).then(r => {
                        const body = r.body
                        expect(body).to.contain.property('contactId')
                        done()
                    }).catch(e => done(e))
                }).catch(e => done(e))
            }).catch(e => done(e))
        }).catch(e => done(e))
    })

    //////////////////////////////////
    // TEST BAD USER CREATION WITH AUTH
    //////////////////////////////////

    it('Bad user creation', (done) => {
        authenticate(app).then(token => {
            const body1 = {
                phoneNumbers: [{
                    number: "00",
                    numberType: "mobile"
                }]
            }
            const body2 = {
                name: "test",
                phoneNumbers: [{
                    numberType: "mobile"
                }]
            }
            const body3 = {
                randomKey: "a value"
            }
            doTestWrongBodies(token, [body1, body2, body3])
                .then(() => done())
                .catch(e => done(e))
        }).catch(e => done(e))


        async function doTestWrongBodies(token, bodies) {
            for (let body of bodies) {
                const response = await doPost(body, token)
                expect(response.status).equal(400)
            }
        }
    })

})

function doPost(body, token) {
    let basicRequest = request(app).post("/contacts")
    if (token)
        basicRequest = basicRequest.set({"x-auth": token})
    return basicRequest.send(body)
}
