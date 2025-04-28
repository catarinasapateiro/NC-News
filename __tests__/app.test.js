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
          expect(topic).toHaveProperty("slug");
          expect(topic).toHaveProperty("description");
          expect(topic).toHaveProperty("img_url");
        });
      });
  });
  // test("200: Responds with an array of topic objects", () => {
  //   return request(app)
  //     .get("/api/topics")
  //     .expect(200)
  //     .then(({ body: { topics } }) => {
  //       expect(topics).toHaveLength(3);
  //       topics.forEach((topic) => {
  //         expect(topic).toHaveProperty(slug);
  //         expect(topic).toHaveProperty(description);
  //         expect(topic).toHaveProperty(img_url);
  //       });
  //     });
  // });
});
