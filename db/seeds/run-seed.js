const devData = require("../data/development-data/index.js");
const { seed } = require("../seeds/seed.js");
const db = require("../connection.js");

const dbQueries = () => {
  return db
    .query(`SELECT * FROM users`)
    .then((usersResult) => {
      console.log(usersResult.rows);
    })
    .then(() => {
      return db.query(`SELECT * FROM articles WHERE topic = 'coding'`);
    })
    .then((articlesTopic) => {
      console.log(articlesTopic.rows);
    })
    .then(() => {
      return db.query(`SELECT * FROM comments WHERE votes <  0`);
    })
    .then((commentsResult) => {
      console.log(commentsResult.rows);
    })
    .then(() => {
      return db.query(`SELECT * FROM topics`);
    })
    .then((topics) => {
      console.log(topics.rows);
    })
    .then(() => {
      return db.query(`SELECT * FROM articles WHERE author = 'grumpy19'`);
    })
    .then((articlesResult) => {
      console.log(articlesResult.rows);
    })
    .then(() => {
      return db.query(`SELECT * FROM comments WHERE votes > 10`);
    })
    .then((commentsResults) => {
      console.log(commentsResults.rows);
    });
};

dbQueries();
