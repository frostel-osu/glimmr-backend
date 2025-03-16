"use strict";

const express = require("express");
const mysql = require("mysql2/promise");

require("dotenv").config();

const app = express();

const handle_async = (fn) => (req, res, next) => fn(req, res).catch(next); //express 4

//initialize database

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

//setup middleware

app.use(express.json());
app.use(express.static("public"));

//serve users api

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
    phone || null
  ]);

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

//serve connections api

app.post("/connections", handle_async(async (req, res) => {
  const { id_user_1, id_user_2 } = req.body;

  const [[[data]]] = await pool.execute("CALL create_connection(?, ?)", [id_user_1, id_user_2]);

  res.status(201).json(data);
}));

app.get("/connections/:id", handle_async(async (req, res) => {
  const [[[data]]] = await pool.execute("CALL read_connections_by_id(?)", [req.params.id]);

  res.json(data);
}));

app.get("/connections", handle_async(async (req, res) => {
  const [[data]] = await pool.execute("CALL read_connections", []);

  res.json(data);
}));

app.put("/connections/:id", handle_async(async (req, res) => {
  const { id_user_1, id_user_2, is_deleted } = req.body;

  const [[[data], metadata]] = await pool.execute("CALL update_connection(?, ?, ?, ?)", [
    req.params.id,
    id_user_1 || null,
    id_user_2 || null,
    is_deleted || null
  ]);

  if (metadata.affectedRows > 0) {
    res.json(data);
  } else {
    res.status(404).send();
  }
}));

app.delete("/connections/:id", handle_async(async (req, res) => {
  const [metadata] = await pool.execute("CALL delete_connection(?)", [req.params.id]);

  if (metadata.affectedRows > 0) {
    res.status(204).send();
  } else {
    res.status(404).send();
  }
}));

//serve likes api

app.post("/likes", handle_async(async (req, res) => {
  const { id_connection, id_user } = req.body;

  const [[[data]]] = await pool.execute("CALL create_like(?, ?)", [id_connection, id_user]);

  res.status(201).json(data);
}));

app.get("/likes/:id", handle_async(async (req, res) => {
  const [[[data]]] = await pool.execute("CALL read_likes_by_id(?)", [req.params.id]);

  res.json(data);
}));

app.get("/likes", handle_async(async (req, res) => {
  const [[data]] = await pool.execute("CALL read_likes", []);

  res.json(data);
}));

//serve messages api

app.post("/messages", handle_async(async (req, res) => {
  const { id_connection, id_user, text } = req.body;

  const [[[data]]] = await pool.execute("CALL create_message(?, ?, ?)", [id_connection, id_user, text]);

  res.status(201).json(data);
}));

app.get("/messages/:id", handle_async(async (req, res) => {
  const [[[data]]] = await pool.execute("CALL read_messages_by_id(?)", [req.params.id]);

  res.json(data);
}));

app.get("/messages", handle_async(async (req, res) => {
  const [[data]] = await pool.execute("CALL read_messages", []);

  res.json(data);
}));

//serve home page

app.get("/", (req, res) => {
  res.send("index.html");
});

//setup middleware (errors)

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json(err);
});

//initialize app

app.listen(process.env.PORT, () => {
    console.log("\"All is for the best in the best of all possible worlds.\" --Pangloss");
});
