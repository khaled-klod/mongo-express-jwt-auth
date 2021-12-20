const express = require("express");
const app = express();
const http = require("http");
const dotenv = require("dotenv");
const db = require("./models");
const dbConfig = require("./config/db.config");
const bodyParser = require("body-parser");
const cors = require("cors");




const Role = db.role;
dotenv.config();
const port = process.env.PORT || 8080;
const connectStr = `mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`;

db.mongoose.connect(connectStr, (err) => {
  if (err) throw err;
  console.log("Successfully connected to MongoDB");
  initial();
});

// middle-wares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

//routes
require("./routes/auth.routes")(app);
require("./routes/user.routes")(app);

http.createServer(app).listen(port, () => {
  console.log("Server listening on port: ", port);
});

function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "user",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'user' to roles collection");
      });

      new Role({
        name: "moderator",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'moderator' to roles collection");
      });

      new Role({
        name: "admin",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'admin' to roles collection");
      });
    }
  });
}
