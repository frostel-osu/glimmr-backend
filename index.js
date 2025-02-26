"use strict";

const express = require("express");
const mysql = require("mysql2/promise");

require("dotenv").config();

const app = express();

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

app.use(express.json());
app.use(express.static("public"));

const handle_async = (fn) => (req, res, next) => fn(req, res).catch(next); //express 4

app.post("/users", handle_async(async (req, res) => {
  const { email, name, phone } = req.body;

  const [[[data]]] = await pool.execute("CALL create_user(?, ?, ?)", [email, name, phone]);

  res.status(201).json(data);
}));

app.get("/users/:id", handle_async(async (req, res) => {
  const [[[data]]] = await pool.execute("CALL read_users_by_id(?)", [req.params.id]);

  res.json(data);
}));

app.get("/users", handle_async(async (req, res) => {
  const [[data]] = await pool.execute("CALL read_users", []);

  res.json(data);
}));

app.put("/users/:id", handle_async(async (req, res) => {
  const { email, name, phone } = req.body;

  const [[[data], metadata]] = await pool.execute("CALL update_user(?, ?, ?, ?)", [
    req.params.id,
    email || null,
    name || null,
    phone || null]
  );

  if (metadata.affectedRows > 0) {
    res.json(data);
  } else {
    res.status(404).send();
  }
}));

app.delete("/users/:id", handle_async(async (req, res) => {
  const [metadata] = await pool.execute("CALL delete_user(?)", [req.params.id]);

  if (metadata.affectedRows > 0) {
    res.status(204).send();
  } else {
    res.status(404).send();
  }
}));

app.get("/", (req, res) => {
  res.send("index.html");
});

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json(err);
});

app.listen(process.env.PORT, () => {
    console.log("\"All is for the best in the best of all possible worlds.\" --Pangloss");
});
