const request = require("supertest");
const app = require("../app");

const teardownMongoose = require("../utils/testTeardownMongoose");
const movieData = require("../data/testmovieData");
const Movie = require("../models/movie.model");

describe("Movie route", () => {
  afterAll(async () => {
    await teardownMongoose();
  });

  beforeEach(async () => {
    await Movie.create(movieData);
  });

  afterEach(async () => {
    await Movie.deleteMany();
  });

  it("POST /movies should return a new movie object", async () => {
    const newMovie = { name: "test movie" };
    const expectedMovie = { id: 2, name: "test movie" };

    const { body: actualMovie } = await request(app)
      .post("/movies")
      .send(newMovie)
      .expect(201);
    expect(actualMovie).toMatchObject(expectedMovie);
  });

  it("POST /movies should return 400 bad erquest error message when request is invalid", async () => {
    const response = await request(app)
      .post("/movies")
      .send({ badRequest: "" })
      .expect(400);
  });

  it("POST /movies with less than 3 characters will give 400 error", async () => {
    const response = await request(app)
      .post("/movies")
      .send({ name: "tt" })
      .expect(400);
  });

  it("GET /movies should return one movie object in array", async () => {
    const { body: actualMovies } = await request(app)
      .get("/movies")
      .expect(200);

    expect(actualMovies).toMatchObject(movieData);
  });

  it("GET /movies/:id should return correct movie object", async () => {
    const { body: actualMovie } = await request(app)
      .get("/movies/1")
      .expect(200);

    expect(actualMovie).toEqual(movieData[0]);
  });

  it("GET /movies/:id with invalid id will return 404", async () => {
    await request(app).get("/movies/10").expect(404);
  });

  it("PUT /movies should update a movie and return updated movie object", async () => {
    const newMovie = { name: "test movie updated" };
    const expectedMovie = {
      id: 1,
      name: "test movie updated",
    };

    const { body: actualMovie } = await request(app)
      .put("/movies/1")
      .send(newMovie)
      .expect(200);

    expect(actualMovie).toEqual(expectedMovie);
  });

  it("PUT /movies/:id with invalid id will return 404", async () => {
    const newMovie = { name: "test movie updated" };

    await request(app).put("/movies/10").send(newMovie).expect(404);
  });

  it("DELETE /movies/:id should delete a movie and return movie object", async () => {
    const { body: actualMovie } = await request(app)
      .delete("/movies/1")
      .expect(200);

    expect(actualMovie).toEqual(movieData[0]);

    await request(app).get("/movies/1").expect(404);
  });

  it("DELETE /movies/:id with invalid id will return 404", async () => {
    await request(app).delete("/movies/10").expect(404);
  });
});
