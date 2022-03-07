const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "User not found!" });
  }

  request.username = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request;

  return response.status(200).json(username.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  username.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = username.todos.filter((todo) => todo.id === id);
  const newTodo = { ...todo, title: title, deadline: deadline };

  const userIndex = users.findIndex((user) => user === username);
  const todoIndex = username.todos.findIndex((todo) => todo.id === id);

  users[userIndex].todos[todoIndex] = newTodo;

  return response.status(200).send("title and deadline successfully updated");
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const todo = username.todos.filter((todo) => todo.id === id);
  const newTodo = { ...todo, done: true };

  const userIndex = users.findIndex((user) => user === username);
  const todoIndex = username.todos.findIndex((todo) => todo.id === id);

  users[userIndex].todos[todoIndex] = newTodo;

  return response.status(200).send("done successfully updated to true");
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const userIndex = users.findIndex((user) => user === username);
  const todoIndex = username.todos.findIndex((todo) => todo.id === id);

  users[userIndex].todos.splice(todoIndex, 1);
  return response.status(200).send("Todo successfully deleted");
});

module.exports = app;
