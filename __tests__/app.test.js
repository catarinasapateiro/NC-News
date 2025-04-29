const endpointsJson = require("../endpoints.json");
const { app } = require("../app/api.js");
const { seed } = require("../db/seeds/seed");
const request = require("supertest");
const db = require("../db/connection");
const data = require("../db/data/test-data/index");
const sorted = require("jest-sorted");

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
});
