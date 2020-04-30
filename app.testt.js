const request = require("supertest");
const app = require("./app");

const sampleMovie = { movieName: "Lion King" };
const errorMovie = { movieName: "Li" };
const teardownMongoose = require("./utils/testTeardownMongoose");
const songData = require("./data/testSongData");
const Song = require("./models/song.model");

describe("App", () => {
  afterAll(async () => {
    await teardownMongoose();
  });

  beforeEach(async () => {
    await Song.create(songData);
  });

  afterEach(async () => {
    await Song.deleteMany();
  });

  // it("should respond with status 400 and correct string when sending non-json", async () => {
  //   const { text } = await request(app)
  //     .post("/")
  //     .send("This is not json!")
  //     .expect(404);
  //   expect(text).toEqual("Server wants application/json!");
  // });

  it("POST /songs should add a song and return a new song object", async () => {
    const newSong = { name: "test song", artist: "rhianna" };
    const expectedSong = { id: 1, name: "test song", artist: "rhianna" };

    const { body } = await request(app)
      .post("/songs")
      .send(newSong)
      .expect(201);

    expect(body).toEqual(expectedSong);
  });

  it("GET /songs/:id should return the correct song", async () => {
    const expectedSong = { id: 1, name: "test song", artist: "rhianna" };

    const { body: actualSong } = await request(app).get("/songs/1").expect(200);

    expect(actualSong).toMatchObject(expectedSong);
  });

  it("PUT /songs should update a song and return updated song object", async () => {
    const newSong = { name: "test song updated", artist: "rhianna updated" };
    const expectedSong = {
      id: 1,
      name: "test song updated",
      artist: "rhianna updated",
    };

    const { body: actualSong } = await request(app)
      .put("/songs/1")
      .send(newSong)
      .expect(200);

    expect(actualSong).toEqual(expectedSong);
  });

  it("DELETE /songs should delete a song and return song object", async () => {
    const expectedSong = {
      id: 1,
      name: "test song updated",
      artist: "rhianna updated",
    };

    const { body: actualSong } = await request(app)
      .delete("/songs/1")
      .expect(200);

    expect(actualSong).toEqual(expectedSong);

    await request(app).get("/songs/1").expect(404);
  });

  it("POST /movies should return a new movie object", async () => {
    const newMovie = sampleMovie;
    const response = await request(app)
      .post("/movies")
      .send(newMovie)
      .expect(201);
    expect(response.body).toMatchObject(newMovie);
  });

  it("GET /movies should return one movie object in array", async () => {
    const expectedMovie = [{ id: 1, movieName: sampleMovie.movieName }];
    const response = await request(app).get("/movies").expect(200);
    expect(response.body).toEqual(expectedMovie);
  });

  it("GET /movies/:id should return correct movie object", async () => {
    const expectedMovie = { id: 1, movieName: sampleMovie.movieName };
    const response = await request(app).get("/movies/1").expect(200);
    expect(response.body).toEqual(expectedMovie);
  });

  it("POST /movies with less than 3 characters will give 400 error", async () => {
    const response = await request(app)
      .post("/movies")
      .send(errorMovie)
      .expect(400);
  });

  it("GET /director", async () => {
    const expectedDirectors = { name: "bestDirector" };
    const response = await request(app).get("/director").expect(200);
    expect(response.body).toEqual(expectedDirectors);
  });
});
