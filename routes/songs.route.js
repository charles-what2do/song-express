const express = require("express");
const router = express.Router();
const {
  createOne,
  findOne,
  findAll,
  findOneAndUpdate,
  findOneAndDelete,
} = require("../controllers/songs.controller");

router.post("/", createOne);

router.get("/", findAll);

router.get("/:id", findOne);

router.put("/:id", findOneAndUpdate);

router.delete("/:id", findOneAndDelete);

router.use((err, req, res, next) => {
  res.status(err.statusCode || 500);
  res.send(err);
  // res.send(
  //   `Error: ${err} </br>
  //   Error Status Code: ${err.statusCode} <br>
  //   Error stack: ${err.stack}`
  // );
});

module.exports = router;
