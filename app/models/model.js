const db = require("../../db/connection");
const { convertTimestampToDate } = require(`../../db/seeds/utils`);

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

const selectArticles = () => {
  return db
    .query(`SELECT * FROM articles ORDER BY created_at DESC;`)
    .then(({ rows }) => {
      const articles = rows.map((article) => {
        delete article.body;
        article.comment_count = 0;

        return db
          .query(`SELECT * FROM comments WHERE article_id = $1`, [
            article.article_id,
          ])
          .then(({ rows }) => {
            article.comment_count = rows.length;
            return article;
          });
      });
      return Promise.all(articles);
    })
    .then((result) => {
      return result;
    });
};

module.exports = {
  selectTopics,
  selectArticlesById,
  selectArticles,
};
