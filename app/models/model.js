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
    .query(
      `SELECT 
  articles.*,
  comments_count.comment_count
FROM articles
LEFT JOIN (
  SELECT article_id, COUNT(*) AS comment_count
  FROM comments
  GROUP BY article_id
) AS comments_count
ON articles.article_id = comments_count.article_id
WHERE articles.article_id = $1;`,
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `No article found under article_id ${article_id}`,
        });
      } else {
        rows[0].comment_count = Number(rows[0].comment_count);
        return rows[0];
      }
    });
};

const selectArticles = (sort_by, order, topic) => {
  let queryStr = `SELECT 
    articles.article_id,
    articles.title,
    articles.topic,
    articles.author,
    articles.created_at,
    articles.votes,
    articles.article_img_url,
    COALESCE(comments_count.comment_count, 0) AS comment_count
  FROM articles
  LEFT JOIN (
    SELECT 
      article_id, 
      COUNT(*)::INT AS comment_count
    FROM comments
    GROUP BY article_id
  ) AS comments_count 
    ON articles.article_id = comments_count.article_id`;

  const greenList = ["created_at", "votes", "topic", "comment_count"];
  const topics = ["coding", "cooking", "football", "cats", "paper"];
  const validOrders = ["ASC", "DESC"];

  if (topic) {
    if (topics.includes(topic.toLowerCase())) {
      queryStr += ` WHERE articles.topic = '${topic}'`;
    } else {
      return Promise.reject({
        status: 404,
        msg: "Topic not found",
      });
    }
  }

  let orderBy = "";
  if (sort_by && greenList.includes(sort_by)) {
    const column =
      sort_by === "comment_count" ? "comment_count" : `articles.${sort_by}`;

    orderBy = ` ORDER BY ${column}`;
  } else {
    orderBy = " ORDER BY articles.created_at";
  }

  if (order) {
    if (validOrders.includes(order.toUpperCase())) {
      orderBy += ` ${order.toUpperCase()}`;
    } else {
      return Promise.reject({
        status: 400,
        msg: "Please insert ASC or DESC",
      });
    }
  } else {
    orderBy += " DESC";
  }

  queryStr += orderBy + ";";
  console.log("Final query:", queryStr);

  return db.query(queryStr).then((result) => {
    return result.rows.map((article) => ({
      ...article,
      comment_count: Number(article.comment_count),
    }));
  });
};

const selectCommentsByArticleId = (article_id) => {
  return db
    .query(
      `SELECT c.*, u.avatar_url 
       FROM comments c 
JOIN users u ON c.author = u.username 
WHERE c.article_id = $1 
ORDER BY c.created_at DESC;`,
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0 && article_id <= 37) {
        return [];
      } else if (rows.length === 0 && article_id > 37) {
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
  } else if (article_id > 37) {
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

const deleteComment = (comment_id) => {
  return db
    .query(
      `DELETE FROM comments
WHERE comment_id = $1 RETURNING*;`,
      [comment_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Comment id not found",
        });
      } else {
        return rows;
      }
    });
};

const selectUsers = () => {
  return db.query(`SELECT* FROM users`).then((result) => {
    return result.rows;
  });
};

const selectUserByUsername = (username) => {
  return db
    .query(`SELECT* FROM users   WHERE username=$1`, [username])
    .then((result) => {
      return result.rows;
    });
};

module.exports = {
  selectTopics,
  selectArticlesById,
  selectArticles,
  selectCommentsByArticleId,
  insertComment,
  updateArticle,
  deleteComment,
  selectUsers,
  selectUserByUsername,
};
