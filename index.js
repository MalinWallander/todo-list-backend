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
  const todos = await Todo.findAll();
  res.json(todos.map((todo) => todo.toJSON()));
});

app.post("/todo", express.json(), async (req, res) => {
  const { title, id, completed } = req.body;
  const todo = await Todo.create({
    id,
    title,
    completed,
  });

  res.json(todo.toJSON());
});

app.patch("/todo/:id", express.json(), async (req, res) => {
  const { completed, title } = req.body;
  const { id } = req.params;
  await Todo.update({ completed, title }, { where: { id } });
  res.end();
});

app.delete("/todo/:id", async (req, res) => {
  const { id } = req.params;
  await Todo.destroy({ where: { id } });
  res.end;
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
