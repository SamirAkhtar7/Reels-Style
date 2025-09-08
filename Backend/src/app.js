//create a server


const exprees = require('express');

const app = exprees()
app.get("/", (req, res) => {
    res.json({message:"helllo"})
})


module.exports = app