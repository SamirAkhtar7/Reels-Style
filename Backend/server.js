//start server
const dotenv = require("dotenv").config();
const cors = require("cors");
const app = require("./src/app");
const connectDb = require("./src/db/db");
const http = require("http");
const { Server } = require("socket.io");
const { socketHandler } = require("./socket");
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

connectDb();

// normalize frontend origin (strip trailing slashes)

const FRONTEND_URL = (
  process.env.FRONTEND_URL || "https://foodie-frontend-bcm7.onrender.com"
).replace(/\/+$/, "");

// Attach middleware to the Express app (not the raw HTTP server)
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // allow same-origin requests from non-browser environments (origin === undefined)
      if (!origin || origin === FRONTEND_URL) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

//port is 3000 is running
socketHandler(io);
server.listen(PORT, () => {
  console.log(`Server is runnning on port ${PORT} `);
});
