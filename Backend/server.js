//start server

const app = require('./src/app')
const connectDb = require("./src/db/db")
const dotenv = require("dotenv").config()

connectDb()
app.listen(3000, () => {
    console.log("Server is runnning on port 3000")
})