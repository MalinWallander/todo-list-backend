const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const cors = require("cors");
require("dotenv").config();
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize(
  process.env.DBNAME,
  process.env.USERNAME,
  process.env.PASSWORD,
  {
    host: process.env.URL,
    dialect: "postgres",
  }
);

const app = express();
const port = 3000;
app.use(cors());
app.use(morgan("tiny"));
app.use(bodyParser.urlencoded({ extended: false }));

const Todo = sequelize.define("Todos", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  completed: {
    type: DataTypes.BOOLEAN,
  },
});

app.get("/", async (req, res) => {
  if (req.headers.authorization === "bananahammock") {
    const todos = await Todo.findAll();
    res.json(todos.map((todo) => todo.toJSON()));
  } else {
    res.status(401).send("You are not authorized");
  }
});

app.post("/todo", express.json(), async (req, res) => {
  console.log(req.headers.authorization);
  if (req.headers.authorization === "bananahammock") {
    const { title, id, completed } = req.body;
    const todo = await Todo.create({
      id,
      title,
      completed,
    });
    res.status(201);
    res.json(todo.toJSON());
  } else {
    res.status(401).send("You are not authorized");
  }
});

app.patch("/todo/:id", express.json(), async (req, res) => {
  if (req.headers.authorization === "bananahammock") {
    const { completed, title } = req.body;
    const { id } = req.params;
    await Todo.update({ completed, title }, { where: { id } });
    res.end();
  } else {
    res.status(401).send("You are not authorized");
  }
});

app.delete("/todo/:id", async (req, res) => {
  if (req.headers.authorization === "bananahammock") {
    const { id } = req.params;
    await Todo.destroy({ where: { id } });
    res.end;
  } else {
    res.status(401).send("You are not authorized");
  }
});

const main = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

main();
