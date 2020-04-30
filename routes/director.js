const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  const director = { name: "bestDirector" };
  res.status(200).send(director);
});

module.exports = router;
