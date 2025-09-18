//create a server


const express = require('express');
const cookiesParser= require('cookie-parser')
const authRouters = require('./routes/auth.routes')
const foodRouters = require("./routes/food.routes")
const userRouters = require("./routes/user.routes");
const { verifyToken } = require('./middlewares/auth.middleware');

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

app.use("/api/auth", authRouters)
app.use("/api/user", userRouters)
app.use("/api/food", foodRouters)



module.exports = app