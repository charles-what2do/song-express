const express = require("express");
const router = express.Router();
const {
  createOne,
  findOne,
  findAll,
  findOneAndUpdate,
  findOneAndDelete,
} = require("../controllers/movies.controller");

const movies = [];

router.post("/", createOne);

router.get("/", async (req, res) => {
  let movies = await findAll();
  res.status(200).send(movies);
});

router.get("/:id", findOne);

router.put("/:id", findOneAndUpdate);

router.delete("/:id", findOneAndDelete);

router.use((err, req, res, next) => {
  res.status(err.statusCode || 500);
  res.send(
    `Error: ${err} </br>
    Error Status Code: ${err.statusCode} <br>
    Error stack: ${err.stack}`
  );
});

module.exports = router;
