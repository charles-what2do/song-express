const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const cors = require("cors");
require("./utils/db");

const moviesRouter = require("./routes/movies.route");
const directorRouter = require("./routes/director");
const songsRouter = require("./routes/songs.route");
const usersRouter = require("./routes/users.route");

app.get("/", (req, res) => {
  res.send("main api");
});

app.use(express.json());
app.use(cookieParser("notsogoodsecret"));

var corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
};
app.use(cors(corsOptions));

app.use("/movies", moviesRouter);
app.use("/director", directorRouter);
app.use("/songs", songsRouter);
app.use("/users", usersRouter);

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500);
  const message = err.message || "Internal server error";
  if (app.get("env") === "development" || app.get("env") === "test") {
    console.log(err);
  }
  res.send({ error: `${message}` });
});

module.exports = app;
