const express = require("express");
const apiVersion1 = require("./library_v1");
const apiVersion2 = require("./library_v2");
const app = express();
const PORT = 3000;

app.use("/v1", apiVersion1);
app.use("/v2", apiVersion2);

app.get("/error", () => {
  const err = new Error("Error! Error!");
  err.statusCode = 404;
  //next(err); async
  throw err;
});

app.use((err, req, res, next) => {
  res.status(err.statusCode);
  res.send(
    `Error: ${err} </br>
    Error stack: ${err.stack}`
  );
});

const server = app.listen(PORT, () => {
  console.log(`Library API running on http://localhost:${PORT}`);
});

module.exports = app;
