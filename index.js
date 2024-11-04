const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Server Is Running");
});

app.listen(port, () => {
  console.log(`Server is working on port ${port}`);
});

// ekhan theke shuru korba
kkkkkkkk;
