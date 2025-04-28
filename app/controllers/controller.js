const { selectTopics } = require("../models/model");

const getTopics = (req, res) => {
  return selectTopics().then((result) => {
    res.status(200).send({ topics: result });
  });
};

module.exports = { getTopics };
