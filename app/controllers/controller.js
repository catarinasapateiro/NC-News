const {
  selectTopics,
  selectArticlesById,
  selectArticles,
  selectCommentsByArticleId,
  insertComment,
  updateArticle,
  deleteComment,
  selectUsers,
} = require("../models/model");

const getTopics = (req, res) => {
  return selectTopics().then((result) => {
    res.status(200).send({ topics: result });
  });
};

const getArticlesById = (req, res, next) => {
  const { article_id } = req.params;
  return selectArticlesById(article_id)
    .then((article) => {
      res.status(200).send({ article: article });
    })
    .catch((err) => {
      next(err);
    });
};

const getArticles = (req, res, next) => {
  return selectArticles()
    .then((articles) => {
      res.status(200).send({ articles: articles });
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
};

const getCommentsbyArticleId = (req, res, next) => {
  const { article_id } = req.params;
  return selectCommentsByArticleId(article_id)
    .then((comments) => {
      res.status(200).send({ comments: comments });
    })
    .catch((err) => {
      next(err);
    });
};

const postCommentsbyArticleId = (req, res, next) => {
  const { username, body } = req.body;
  const { article_id } = req.params;

  return insertComment(username, body, article_id)
    .then((newComment) => {
      res.status(201).send({ comment: newComment });
    })
    .catch((err) => {
      next(err);
    });
};

const updateArticlesById = (req, res, next) => {
  const newVote = req.body.inc_votes;
  const { article_id } = req.params;

  return updateArticle(newVote, article_id)
    .then((article) => {
      res.status(200).send({ article: article });
    })
    .catch((err) => {
      next(err);
    });
};

const deleteCommentsById = (req, res, next) => {
  const { comment_id } = req.params;
  return deleteComment(comment_id)
    .then((result) => {
      // console.log(result, "result from delete");
      res.status(204).send({});
    })
    .catch((err) => {
      next(err);
    });
};

const getUsers = (req, res) => {
  return selectUsers()
    .then((result) => {
      res.status(200).send({ users: result });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = {
  getTopics,
  getArticlesById,
  getArticles,
  getCommentsbyArticleId,
  postCommentsbyArticleId,
  updateArticlesById,
  deleteCommentsById,
  getUsers,
};
