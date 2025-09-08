const mongoose = require('mongoose');




const connectDb = () => {
    //local Data base
    mongoose
    .connect("mongodb://localhost:27017/food-view")

      //atlas DataBase
    //   .connect(
    //     "mongodb+srv://sameerakhtar40444:dzL9FpXUtYzmMiox@clusterfirst.zreyych.mongodb.net/reels-Style/user"
    //   )

      .then(() => {
        console.log("MongoDb connected");
      })
      .catch((err) => {
        console.log("mongoDb connection error:", err);
      });
}


module.exports = connectDb;