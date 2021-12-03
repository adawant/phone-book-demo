// process.env.NODE_ENV = "test"
const expect = require('chai').expect
const request = require('supertest')

const authenticate = require("./SecuredApisUtils")

const app = require('../../../server')
const db = require('../../../dao/db')


describe('GET /contacts', () => {


    //////////////////////////////////
    // TEST BASIC USER RETRIEVE WITH AND WITHOUT AUTH
    //////////////////////////////////

    it('Not auth then auth get', (done) => {
        doGet().then((response) => {
            expect(response.status).equal(401)
            authenticate(app).then(token => {
                doGet(token).then(r => {
                    const body = r.body
                    expectPagedResult(body, 0)
                    done()
                }).catch(e => done(e))
            }).catch(e => done(e))
        }).catch(e => done(e))
    })


    it('Only logged user contacts', (done) => {
        authenticate(app).then(token => {
            doGet(token).then(r => {
                expectPagedResult(r.body, 0)
                const exampleContact = {
                    name: "test",
                    phoneNumbers: [{
                        number: "00",
                        numberType: "mobile"
                    }]
                }
                doPost([exampleContact], token).then(() => {
                    doGet(token).then(r => {
                        const body = r.body
                        expectPagedResult(body, 1);
                        expect(body.content[0].name).to.eql(exampleContact.name)
                        expect(body.content[0].phoneNumbers).to.length(1)
                        expect(body.content[0].phoneNumbers[0].number).to.equal(exampleContact.phoneNumbers[0].number)
                        expect(body.content[0].phoneNumbers[0].numberType).to.equal(exampleContact.phoneNumbers[0].numberType)
                        authenticate(app) //now login with other user
                            .then(token2 => {
                                doGet(token2).then(r => {
                                    expectPagedResult(r.body, 0)
                                    done()
                                }).catch(e => done(e))
                            }).catch(e => done(e))
                    }).catch(e => done(e))
                }).catch(e => done(e))

            }).catch(e => done(e))
        }).catch(e => done(e))
    })


    it('Paged params test', (done) => {
        authenticate(app).then(token => {
            const c1 = {
                name: "test",
                phoneNumbers: [{
                    number: "00",
                    numberType: "mobile"
                }]
            }
            //that callback hell..so ugly, but no time to figure out how async functions can work with done()
            doPost([c1, c1, c1,], token).then(() => { //save 3 test contacts

                doGet(token).then(r => { //test no params
                    expectPagedResult(r.body, 3)

                    doGet(token, {size: 1}).then(r => { //test page size 1
                        expectPagedResult(r.body, 1)

                        doGet(token, {size: 2}).then(r => { //test page size 2
                            expectPagedResult(r.body, 2)

                            doGet(token, {size: 200}).then(r => { //test page size 200
                                expectPagedResult(r.body, 3)

                                doGet(token, {size: 2, page: 1}).then(r => { //test page size 1 and page 1
                                    expectPagedResult(r.body, 1, 1)

                                    doGet(token, {page: 1}).then(r => { //test page size 1
                                        expectPagedResult(r.body, 0, 1)
                                        done()
                                    }).catch(e => done(e))
                                }).catch(e => done(e))
                            }).catch(e => done(e))
                        }).catch(e => done(e))
                    }).catch(e => done(e))
                }).catch(e => done(e))
            }).catch(e => done(e))
        }).catch(e => done(e))
    })

})

function doGet(token, query) {
    let basicRequest = request(app).get("/contacts")
    if (token)
        basicRequest = basicRequest.set({"x-auth": token})
    if (query)
        basicRequest = basicRequest.query(query)
    return basicRequest
}

async function doPost(bodies, token) {
    for (let body of bodies) {
        let basicRequest = request(app).post("/contacts")
        if (token)
            basicRequest = basicRequest.set({"x-auth": token})
        await basicRequest.send(body)
    }
}


function expectPagedResult(body, contentSize, page = 0) {
    expect(body).to.contain.property('page')
    expect(body.page).to.equal(page)
    expect(body).to.contain.property('size')
    expect(body.size).to.equal(contentSize)
    expect(body).to.contain.property('content')
    expect(body.content).to.length(contentSize)
}
