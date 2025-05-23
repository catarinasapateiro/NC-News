const express = require("express");
const app = express();
const endpointsJson = require("../endpoints.json");
const {
  getTopics,
  getArticlesById,
  getArticles,
  getCommentsbyArticleId,
  postCommentsbyArticleId,
  updateArticlesById,
  deleteCommentsById,
  getUsers,
  getUserByUsername,
} = require("./controllers/controller");
const bodyParser = require("body-parser");

const cors = require("cors");

app.use(cors());

app.use(express.json());

app.get("/api", (req, res) => {
  return res.status(200).send({ endpoints: endpointsJson });
});

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticlesById);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id/comments", getCommentsbyArticleId);

app.post("/api/articles/:article_id/comments", postCommentsbyArticleId);

app.patch("/api/articles/:article_id", updateArticlesById);

app.delete("/api/comments/:comment_id", deleteCommentsById);

app.get("/api/users", getUsers);

app.get("/api/users/:username", getUserByUsername);

app.all("/*splat", (req, res) => {
  res.status(404).send({ msg: "Not found" });
});

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.code === "22P02" || err.code === "42601") {
    res.status(400).send({ msg: "Bad request. Please insert a valid input" });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.code === "23503") {
    res.status(404).send({ msg: "Username not found" });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  res.status(500).send({ msg: "Internal Server Error" });

  next(err);
});

module.exports = { app };
