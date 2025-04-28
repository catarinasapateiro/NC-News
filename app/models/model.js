const db = require("../../db/connection");

const selectTopics = (topics) => {
  return db.query(`SELECT * FROM topics`).then((result) => {
    const allTopics = result.rows;
    return allTopics;
  });
};

module.exports = { selectTopics };