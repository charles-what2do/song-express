const request = require("supertest");
const app = require("../app");

const teardownMongoose = require("../utils/testTeardownMongoose");
const songData = require("../data/testSongData");
const Song = require("../models/song.model");

describe("Song Route", () => {
  afterAll(async () => {
    await teardownMongoose();
  });

  beforeEach(async () => {
    await Song.create(songData);
  });

  afterEach(async () => {
    await Song.deleteMany();
  });

  it("POST /songs should add a song and return a new song object", async () => {
    const newSong = { name: "test song", artist: "rhianna" };
    const expectedSong = { id: 2, name: "test song", artist: "rhianna" };

    const { body: actualSong } = await request(app)
      .post("/songs")
      .send(newSong)
      .expect(201);

    expect(actualSong).toMatchObject(expectedSong);
  });

  it("POST /songs should return 400 bad erquest error message when request is invalid", async () => {
    const response = await request(app)
      .post("/songs")
      .send({ badRequest: "" })
      .expect(400);
  });

  it("POST /songs with name less than 3 characters will give 400 error", async () => {
    const response = await request(app)
      .post("/songs")
      .send({ name: "tt", artist: "test" })
      .expect(400);
  });

  it("POST /songs with artist less than 3 characters will give 400 error", async () => {
    const response = await request(app)
      .post("/songs")
      .send({ name: "test", artist: "tt" })
      .expect(400);
  });

  it("GET /songs should return the songs", async () => {
    const { body: actualSongs } = await request(app).get("/songs").expect(200);

    expect(actualSongs).toMatchObject(songData);
  });

  it("GET /songs should throw 500 error if there is an internal server error", async () => {
    const origSongFind = Song.find;
    Song.find = jest.fn();
    Song.find.mockImplementationOnce(() => {
      const err = new Error();
      throw err;
    });
    const { body: error } = await request(app).get("/songs").expect(500);
    // expect(error).toEqual({ error: "Internal Server error" });
    Song.find = origSongFind;
  });

  it("GET /songs/:id should return the correct song", async () => {
    const { body: actualSong } = await request(app).get("/songs/1").expect(200);

    expect(actualSong).toMatchObject(songData[0]);
  });

  it("GET /songs/:id with invalid id will return 404", async () => {
    await request(app).get("/songs/10").expect(404);
  });

  it("GET /songs/:id should throw 500 error if there is an internal server error", async () => {
    const origSongFindOne = Song.findOne;
    Song.findOne = jest.fn();
    Song.findOne.mockImplementationOnce(() => {
      const err = new Error();
      throw err;
    });
    const { body: error } = await request(app).get("/songs/1").expect(500);
    // expect(error).toEqual({ error: "Internal Server error" });
    Song.findOne = origSongFindOne;
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

  it("PUT /songs/:id with invalid id will return 404", async () => {
    const newSong = { name: "test song updated", artist: "rhianna updated" };

    await request(app).put("/songs/10").send(newSong).expect(404);
  });

  it("DELETE /songs/:id should delete a song and return song object", async () => {
    const { body: actualSong } = await request(app)
      .delete("/songs/1")
      .expect(200);

    expect(actualSong).toEqual(songData[0]);

    await request(app).get("/songs/1").expect(404);
  });

  it("DELETE /songs/:id with invalid id will return 404", async () => {
    await request(app).delete("/songs/10").expect(404);
  });
});
