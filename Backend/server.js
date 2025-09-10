//start server

const dotenv = require("dotenv").config()
const app = require('./src/app')
const connectDb = require("./src/db/db")
const cors = require('cors')

connectDb()
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.listen(3000, () => {
    console.log("Server is runnning on port 3000")
})