const express = require("express");
const app = express();
const endpointsJson = require("../endpoints.json");
const { getTopics } = require("./controllers/controller");

app.get("/api", (req, res) => {
  return res.status(200).send({ endpoints: endpointsJson });
});

app.get("/api/topics", getTopics);

app.all("/*splat", (req, res) => {
  res.status(404).send({ msg: "Not found" });
});

module.exports = { app };
