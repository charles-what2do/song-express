// library_v1
const express = require("express");
const api = express.Router();
const PORT = 3000;

const moviesRouter = require("./routes/movies");
const directorRouter = require("./routes/director");
const songsRouter = require("./routes/songs");

api.use(express.json());
api.use("/movies", moviesRouter);
api.use("/director", directorRouter);
api.use("/songs", songsRouter);

api.get("/", (req, res) => {
  res.send("Version 1 of library API");
});

module.exports = api;
