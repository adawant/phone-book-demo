require('dotenv').config()

const mongoose = require('mongoose')

exports.connect = () => {
    return new Promise((resolve, reject) => {
        if (process.env.NODE_ENV === "test") {
            console.log("Mocking mongo database")
            const Mockgoose = require('mockgoose').Mockgoose
            const instance = new Mockgoose(mongoose)
            instance.prepareStorage()
                .then(() => {
                    doConnect(resolve, reject)
                }).catch(ex => reject(ex))
        } else {
            doConnect(resolve, reject)
        }
    })
}

function doConnect(resolve, reject) {
    mongoose.connect(process.env.DATABASE_URL)
        .then((res, err) => {
            if (err)
                reject(err)
            else {
                console.log("Connection to db succeed")
                resolve()
            }
        })
        .catch(e => reject(e))
}

exports.disconnect = () => mongoose.disconnect()


