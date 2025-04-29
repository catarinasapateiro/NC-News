const express = require("express");
const app = express();
const endpointsJson = require("../endpoints.json");
const {
  getTopics,
  getArticlesById,
  getArticles,
  getCommentsbyArticleId,
} = require("./controllers/controller");

app.use(express.json());

app.get("/api", (req, res) => {
  return res.status(200).send({ endpoints: endpointsJson });
});

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticlesById);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id/comments", getCommentsbyArticleId);

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad request. Please insert a valid input" });
  } else {
    next(err);
  }
});

app.all("/*splat", (req, res) => {
  res.status(404).send({ msg: "Not found" });
});

module.exports = { app };
