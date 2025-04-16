const db = require("../connection");
const topics = require("../data/test-data/topics");
const format = require("pg-format");
const { convertTimestampToDate, createRef } = require("./utils");

const seed = ({ topicData, userData, articleData, commentData }) => {
  return db
    .query(`DROP TABLE IF EXISTS comments;`)
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS articles;`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS users;`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS topics;`);
    })
    .then(() => {
      return db.query(
        `CREATE TABLE topics (slug VARCHAR(250) PRIMARY KEY, description VARCHAR(500), img_url VARCHAR(1000));`
      );
    })
    .then(() => {
      return db.query(
        `CREATE TABLE users (username VARCHAR(250) PRIMARY KEY, name VARCHAR(500), avatar_url VARCHAR(1000));`
      );
    })
    .then(() => {
      return db.query(`CREATE TABLE articles (
        article_id SERIAL PRIMARY KEY,
        title VARCHAR(500),
        topic VARCHAR(250),
        author VARCHAR(255),
        body TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        votes INT DEFAULT 0,
        article_img_url VARCHAR(1000),
        FOREIGN KEY (topic) REFERENCES topics(slug),
        FOREIGN KEY (author) REFERENCES users(username)
    );`);
    })
    .then(() => {
      return db.query(`CREATE TABLE comments (
        comment_id  SERIAL PRIMARY KEY,
        article_id INT,
        body TEXT,
        votes INT DEFAULT 0,
        author VARCHAR(250),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (article_id) REFERENCES articles(article_id),
        FOREIGN KEY (author) REFERENCES users(username)
    );`);
    })
    .then(() => {
      const formattedTopics = topicData.map((topic) => {
        return [topic.slug, topic.description, topic.img_url];
      });

      const insertTopics = format(
        `INSERT INTO topics (slug, description, img_url) VALUES %L`,
        formattedTopics
      );

      return db.query(insertTopics);
    })
    .then(() => {
      const formattedUsers = userData.map((user) => {
        return [user.username, user.name, user.avatar_url];
      });

      const insertUsers = format(
        `INSERT INTO users(username,name, avatar_url) VALUES %L`,
        formattedUsers
      );

      return db.query(insertUsers);
    })
    .then(() => {
      const formattedArticles = articleData.map((article) => {
        const newArticle = convertTimestampToDate(article);
        // const date = new Date(article.created_at);
        return [
          newArticle.title,
          newArticle.topic,
          newArticle.author,
          newArticle.body,
          newArticle.created_at,
          newArticle.votes,
          newArticle.article_img_url,
        ];
      });

      const insertArticles = format(
        `INSERT INTO articles(title,topic,author,body,created_at,votes,article_img_url) VALUES %L RETURNING*;`,
        formattedArticles
      );

      return db.query(insertArticles);
    })
    .then((articles) => {
      const articlesRefObject = createRef(articles.rows);
      console.log(articlesRefObject);
      const formattedComments = commentData.map((comment) => {
        const newComment = convertTimestampToDate(comment);

        return [
          articlesRefObject[newComment.article_title],
          newComment.body,
          newComment.votes,
          newComment.author,
          newComment.created_at,
        ];
      });

      const insertComments = format(
        `INSERT INTO comments(article_id,body,votes,
        author,created_at) VALUES %L`,
        formattedComments
      );

      return db.query(insertComments);
    })
    .then(() => {
      console.log("Seed completes");
    });
};

module.exports = seed;
