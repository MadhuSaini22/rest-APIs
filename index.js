const express = require("express");
const app = express();

const mongoose = require("mongoose");
mongoose
  .connect(
    "mongodb+srv://MadhuSaini22:MadhuSaini22@cluster0.v6bxl6e.mongodb.net/nodePractice?retryWrites=true&w=majority"
  )
  .then((result) =>
    app.listen(3000, function () {
      console.log("Server is ready!!");
    })
  )
  .catch((err) => console.log(err));

// user routes
  const user_routes = require("./routes/userRoute")
  app.use('/api', user_routes)

//store routes 
const store_routes = require("./routes/storeRoute")
app.use('/api', store_routes)
// app.listen(3000, function () {
//   console.log("Server is ready!!");
// });
