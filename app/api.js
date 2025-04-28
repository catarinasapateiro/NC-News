const express = require("express");
const app = express();
const endpointsJson = require("../endpoints.json");
const { getTopics } = require("./controllers/controller");

app.get("/api", (req, res) => {
  return res.status(200).send({ endpoints: endpointsJson });
});

app.get("/api/topics", getTopics);

module.exports = { app };
