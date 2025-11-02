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
// Allow CORS from any origin for testing purposes

// Attach middleware to the Express app (not the raw HTTP server)
app.use(cors({ origin: "*" }));

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

app.set("io", io);


//port is 3000 is running
 socketHandler(io);
server.listen(PORT, () => {
  console.log("Server is runnning on port 3000");
});
