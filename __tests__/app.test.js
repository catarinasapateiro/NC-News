const endpointsJson = require("../endpoints.json");
const { app } = require("../app/api.js");
const { seed } = require("../db/seeds/seed");
const request = require("supertest");
const db = require("../db/connection");
const data = require("../db/data/test-data/index");
const sorted = require("jest-sorted");
const bodyParser = require("body-parser");

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe("GET /api/topics", () => {
  test("200: Responds with an array of topic objects", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(topics).toHaveLength(3);
        topics.forEach((topic) => {
          expect(topic).toEqual({
            description: expect.any(String),
            slug: expect.any(String),
            img_url: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api/articles", () => {
  test("200: Responds with the requested article, selected by Id", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toMatchObject({
          article_id: 2,
          title: "Sony Vaio; or, The Laptop",
          topic: "mitch",
          author: "icellusedkars",
          body: "Call me Mitchell. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would buy a laptop about a little and see the codey part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to coding as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the laptop. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the the Vaio with me.",
          created_at: "2020-10-16T05:03:00.000Z",
          votes: 0,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          comment_count: null,
        });
      });
  });
  test("404: When passed a valid article_id that does not exist in the database", () => {
    return request(app)
      .get("/api/articles/55")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("No article found under article_id 55");
      });
  });
  test("400: Bad request when passed an invalid article_id ", () => {
    return request(app)
      .get("/api/articles/parrot")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request. Please insert a valid input");
      });
  });
  test("200: Responds with an array of article objects with the correct properties", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(13);
        articles.forEach((article) => {
          expect(article).toEqual({
            article_id: expect.any(Number),
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
      });
  });
  test("200: Responds with an array of article objects with a comment_count property that corresponds to the sum of comments by article_Id", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(13);
        const zeroComments = [
          articles[2],
          articles[3],
          articles[4],
          articles[8],
          articles[9],
          articles[10],
          articles[11],
          articles[12],
        ];
        zeroComments.forEach((article) => {
          expect(article.comment_count).toBe(0);
        });
        expect(articles[0].comment_count).toBe(2);
        expect(articles[1].comment_count).toBe(1);
        expect(articles[5].comment_count).toBe(2);
        expect(articles[6].comment_count).toBe(11);
        expect(articles[7].comment_count).toBe(2);
      });
  });
  test("200: Responds with an array of article objects sorted by date in descending order.", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        const datesSorted = [];
        articles.forEach((article) => {
          datesSorted.push(article.created_at);
        });
        expect(datesSorted).toBeSorted({ descending: true });
      });
  });
  test("200: QUERIES Responds with the articles sorted by the requested column", () => {
    return request(app)
      .get("/api/articles?sort_by=votes&&order=asc")
      .expect(200)
      .then(({ body: { articles } }) => {
        const votes = [];
        articles.forEach((article) => {
          votes.push(article.votes);
        });
        expect(articles).toHaveLength(13);
        expect(votes).toBeSorted({ ascending: true });
      });
  });
  test("400: QUERIES Bad request when passed an invalid article column value", () => {
    return request(app)
      .get("/api/articles?sort_by=INVALID&order=asc")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request. Please insert a valid input");
      });
  });
  test("400: QUERIES Bad request when passed an invalid value", () => {
    return request(app)
      .get("/api/articles?sort_by=votes&&order=INVALID")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request.Please insert a valid query");
      });
  });
  test("200: QUERIES Responds with the requested articles by topic", () => {
    return request(app)
      .get("/api/articles?topic=cats")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(1);
        expect(articles[0]).toEqual({
          article_id: expect.any(Number),
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
          comment_count: expect.any(Number),
        });
      });
  });
  test("400: QUERIES Bad request when passed an invalid value", () => {
    return request(app)
      .get("/api/articles?topic=INVALID")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request.Please insert a valid query");
      });
  });
  test("400: QUERIES Bad request when passed an invalid column value", () => {
    return request(app)
      .get("/api/articles?invalid=cats")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request.Please insert a valid column name");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200: Responds with the requested comments, selected by Id", () => {
    return request(app)
      .get("/api/articles/3/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toHaveLength(2);
        comments.forEach((comment) => {
          expect(comment).toEqual({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: expect.any(Number),
          });
        });
      });
  });

  test("200: Responds with the requested comments sorted by the most recent first", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toHaveLength(11);
        const commentsSorted = [];
        comments.forEach((comment) => {
          commentsSorted.push(comment.created_at);
        });

        expect(commentsSorted).toBeSorted({ descending: true });
      });
  });
  test("200: When passed a valid article_id that does not contain comments,returns empty array of comments", () => {
    return request(app)
      .get("/api/articles/4/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toEqual([]);
      });
  });
  test("404: When passed a valid article_id that does not exist in the database, throws an error of not found", () => {
    return request(app)
      .get("/api/articles/60/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("No comments found under article_id 60");
      });
  });
  test("400: Bad request when passed an invalid article_id ", () => {
    return request(app)
      .get("/api/articles/cat/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request. Please insert a valid input");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("201: Responds with the new comment added.", () => {
    const newComment = {
      username: "butter_bridge",
      body: "Great article!",
    };
    return request(app)
      .post("/api/articles/3/comments")
      .send(newComment)
      .expect(201)
      .then(({ body: { comment } }) => {
        expect(comment).toMatchObject({
          comment_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.any(String),
          author: "butter_bridge",
          body: "Great article!",
          article_id: 3,
        });
      });
  });
  test("404: When passed a valid article_id that does not exist in the database", () => {
    const newComment = {
      username: "butter_bridge",
      body: "Great article!",
    };
    return request(app)
      .post("/api/articles/60/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article id not found");
      });
  });
  test("404: When passed a username that does not exist in the users table", () => {
    const newComment = {
      username: "dog Milou",
      body: "This article is really informative!",
    };
    return request(app)
      .post("/api/articles/3/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Username not found");
      });
  });
  test("400: Bad request when passed an invalid article_id ", () => {
    const newComment = {
      username: "butter_bridge",
      body: "Great article!",
    };
    return request(app)
      .post("/api/articles/dog/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request. Please insert a valid input");
      });
  });
  test("400: Bad request when passed an invalid object to be posted", () => {
    const newComment = {
      body: "Great article!",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request.Invalid input");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("200: Responds with the updated article when passed a positive integer", () => {
    return request(app)
      .patch("/api/articles/3")
      .send({ inc_votes: 5 })
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article.votes).toBe(5);
        expect(article.article_id).toBe(3);
      });
  });
  test("200: Responds with the updated article when passed a negative integer", () => {
    return request(app)
      .patch("/api/articles/3")
      .send({ inc_votes: -10 })
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article.votes).toBe(-10);
        expect(article.article_id).toBe(3);
      });
  });
  test("404: When passed a valid article_id that does not exist in the database", () => {
    return request(app)
      .patch("/api/articles/70")
      .send({ inc_votes: 1 })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article id not found");
      });
  });

  test("400: Bad request when passed an invalid article_id ", () => {
    return request(app)
      .patch("/api/articles/poney")
      .send({ inc_votes: 1 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request. Please insert a valid input");
      });
  });

  test("400: Bad request when passed an invalid object input", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: "cat" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request. Please insert a valid input");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("204: Responds with an empty object", () => {
    return request(app)
      .delete("/api/comments/5")
      .expect(204)
      .then((response) => {
        expect(response.body).toEqual({});
      });
  });
  test("404: When passed a valid comment_id that does not exist in the database", () => {
    return request(app)
      .delete("/api/comments/60")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Comment id not found");
      });
  });

  test("400: Bad request when passed an invalid comment_id ", () => {
    return request(app)
      .delete("/api/comments/poney")
      .send({ inc_votes: 1 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request. Please insert a valid input");
      });
  });
});

describe("GET /api/users", () => {
  test("200: Responds with an array of user objects", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: { users } }) => {
        expect(users).toHaveLength(4);
        users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});

describe("GET /try to non-existing endpoint", () => {
  test("404: Attempting to access a non-existent endpoint ", () => {
    return request(app)
      .get("/api/notanendpoint")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not found");
      });
  });
});
