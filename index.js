// const app = require("./library");
require("dotenv").config();
const app = require("./app");
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Express app started on http://localhost:${PORT}`);
});
