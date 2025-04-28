const db = require("../../db/connection");

const selectTopics = (topics) => {
  return db.query(`SELECT * FROM topics`).then((result) => {
    const allTopics = result.rows;
    return allTopics;
  });
};

const selectArticlesById = (article_id) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `No article found under article_id ${article_id}`,
        });
      }
      return rows[0];
    });
};

module.exports = { selectTopics, selectArticlesById };
