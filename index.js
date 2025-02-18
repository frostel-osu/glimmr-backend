"use strict";

const express = require("express");

const app = express();
const PORT = 65486;

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("index.html");
});

app.listen(PORT, () => {
    console.log("\"All is for the best in the best of all possible worlds.\" --Pangloss");
});
