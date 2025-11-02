//create a server

const express = require("express");
const cookiesParser = require("cookie-parser");
const cors = require("cors");
const authRouters = require("./routes/auth.routes");
const foodRouters = require("./routes/food.routes");
const userRouters = require("./routes/user.routes");
const { verifyToken } = require("./middlewares/auth.middleware");
const shopRouters = require("./routes/shop.routes");
const itemRouters = require("./routes/item.routes");
const orderRouter = require("./routes/oder.routes");


const app = express();
app.use(cookiesParser());

// Enable CORS for frontend origin and allow credentials (cookies)
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ message: "Invalid JSON" });
  }
  next();
});

app.get("/", (req, res) => {
  res.send("hello");
});

app.use("/api/auth", authRouters);
app.use("/api/user", userRouters);
app.use("/api/food", foodRouters);
app.use("/api/shop", shopRouters);
app.use("/api/item", itemRouters);
app.use('/api/order', orderRouter);

module.exports = app;
