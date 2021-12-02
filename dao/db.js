require('dotenv').config()

const mongoose = require('mongoose')

exports.connect = () => {
    return new Promise((resolve, reject) => {
        mongoose.connect(process.env.DATABASE_URL)
            .then((res, err) => {
                if (err)
                    handleError(err, reject)
                else {
                    console.log("Connection to db succeed")
                    resolve()
                }
            })
            .catch(e => handleError(e, reject))
    })
}

const handleError = (error, reject) => {
    console.log(`Error connecting to db: ${e.message}`)
    reject(e)
}
