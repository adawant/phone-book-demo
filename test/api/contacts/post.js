// process.env.NODE_ENV = "test"
const expect = require('chai').expect
const request = require('supertest')

const authenticate = require("./SecuredApisUtils")

const app = require('../../../server')
const db = require('../../../dao/db')

describe('POST /contacts', () => {
    before(() => {
        db.connect().then(() => {
            done()
        }).catch(err => (done(err)))
    })


    //////////////////////////////////
    // TEST BASIC USER CREATION WITH AND WITHOUT AUTH
    //////////////////////////////////

    it('User creation', (done) => {
        function performCall(body, token) {
            let basicRequest = request(app).post("/contacts")
            if (token)
                basicRequest = basicRequest.set({"x-auth": token})
            return basicRequest.send(body)
        }

        const body = {
            name: "test",
            phoneNumbers: [{
                number: "00",
                numberType: "mobile"
            }]
        }

        performCall(body).then((response) => {
            expect(response.status).equal(401)
            authenticate(app).then(token => {
                performCall(body, token).then(r => {
                    const body = r.body
                    expect(body).to.contain.property('contactId')
                    done()
                }).catch(e => done(e))
            })
        })
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
            doTestWrongBodie(token, [body1, body2])
                .then(() => done())
                .catch(e => done(e))
        })


        async function doTestWrongBodie(token, bodies) {
            for (let body in bodies) {
                const response = await performCall(body, token)
                expect(response.status).equal(400)
            }
        }
    })


    after(() => {
        db.disconnect().then(() => done()).catch(err => (done(err)))
    })
})
