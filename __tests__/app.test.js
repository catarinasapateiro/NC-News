const endpointsJson = require("../endpoints.json");
const { app } = require("../app/api.js");
const { seed } = require("../db/seeds/seed");
const request = require("supertest");
const db = require("../db/connection");
const data = require("../db/data/test-data/index");

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
