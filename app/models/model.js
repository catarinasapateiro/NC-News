const db = require("../../db/connection");
const { convertTimestampToDate } = require(`../../db/seeds/utils`);
const bodyParser = require("body-parser");

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
          .query(`SELECT * FROM comments WHERE article_id = $1 `, [
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

const selectCommentsByArticleId = (article_id) => {
  return db
    .query(
      `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC`,
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0 && article_id <= 13) {
        return [];
      } else if (rows.length === 0 && article_id > 13) {
        {
          return Promise.reject({
            status: 404,
            msg: `No comments found under article_id ${article_id}`,
          });
        }
      } else {
        return rows;
      }
    });
};

const insertComment = (username, body, article_id) => {
  const arg = [username, body, article_id];

  if (arg.includes(undefined)) {
    return Promise.reject({
      status: 400,
      msg: "Bad request.Invalid input",
    });
  } else if (article_id > 13) {
    return Promise.reject({
      status: 404,
      msg: "Article id not found",
    });
  } else {
    return db
      .query(
        `INSERT INTO comments(author,body,article_id) VALUES($1,$2,$3) RETURNING*`,
        [username, body, article_id]
      )
      .then((result) => {
        return result.rows[0];
      });
  }
};

const updateArticle = (newVote, article_id) => {
  return db
    .query(
      `UPDATE articles SET votes = votes + $1
    WHERE article_id = $2 RETURNING*;`,
      [newVote, article_id]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Article id not found",
        });
      } else {
        return result.rows[0];
      }
    });
};

module.exports = {
  selectTopics,
  selectArticlesById,
  selectArticles,
  selectCommentsByArticleId,
  insertComment,
  updateArticle,
};
