// const app = require("./library");
require("dotenv").config();
const app = require("./app");
//const PORT = 3000;

const server = app.listen(process.env.PORT, () => {
  console.log(`Express app started on http://localhost:${process.env.PORT}`);
});
