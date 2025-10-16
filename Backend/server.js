//start server

const dotenv = require("dotenv").config();
const cors = require("cors");
const app = require("./src/app");
const connectDb = require("./src/db/db");

connectDb();
app.use(cors({ origin: '*' }));

//port is 3000 is running 

app.listen(3000, () => {
  console.log("Server is runnning on port 3000");
});
