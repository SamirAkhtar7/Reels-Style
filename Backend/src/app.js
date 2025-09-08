//create a server


const express = require('express');
const cookiesParser= require('cookie-parser')
const authRouter = require('./routes/auth.routes')
const dotenv = require("dotenv").config()

const app = express()
app.use(cookiesParser());


app.use(express.json())

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ message: "Invalid JSON" });
  }
  next();
});








app.get("/", (req, res) => {
   res.send("hello")
})

app.use("/api/auth",authRouter)

module.exports = app