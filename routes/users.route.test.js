const request = require("supertest");
const app = require("../app");

const { teardownMongoose } = require("../utils/testTeardownMongoose");
const userData = require("../data/testUserData");
const User = require("../models/user.model");

const jwt = require("jsonwebtoken");
jest.mock("jsonwebtoken");

describe("User Route", () => {
  let signedInAgent;

  afterAll(async () => {
    await teardownMongoose();
  });

  beforeEach(async () => {
    await User.create(userData);
    signedInAgent = request.agent(app);
    await signedInAgent.post("/users/login").send(userData[0]);
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await User.deleteMany();
  });

  describe("/login", () => {
    it("POST /users/login should logs user if username and password is correct", async () => {
      const expectedUser = userData[0];

      const { text: message } = await request(app)
        .post("/users/login")
        .send(expectedUser)
        .expect("set-cookie", /token=.*; Path=\/; Expires=.* HttpOnly/)
        .expect(200);

      expect(message).toEqual("You are logged in");
    });

    it("POST /users/login should not log trainer in when password is incorrect", async () => {
      const wrongUser = {
        username: userData[0].username,
        password: "random123",
      };

      const { body: error } = await request(app)
        .post("/users/login")
        .send(wrongUser)
        .expect(400);

      expect(error.error).toBe("Wrong password");
    });
  });

  describe("POST /users", () => {
    it("POST /users should add a user and return a new user object", async () => {
      const expectedUser = { username: "Tester", password: "P@ssw0rd" };

      const { body: actualUser } = await request(app)
        .post("/users")
        .send(expectedUser)
        .expect(200);

      expect(actualUser.username).toBe(expectedUser.username.toLowerCase());
      expect(actualUser.password).not.toBe(expectedUser.password);
    });
  });

  describe("GET /users", () => {
    it("GET /users/:username should return 404 when searching for non-existing user", async () => {
      const expectedUsername = userData[0].username;
      const wrongUsername = "Tester";

      jwt.verify.mockReturnValueOnce({ username: expectedUsername });

      const { body: error } = await signedInAgent
        .get(`/users/${wrongUsername}`)
        .expect(404);
      expect(jwt.verify).toBeCalledTimes(1);
      expect(error.error).toBe("No such user");
    });

    it("GET /users/:username should return user information when login as correct user", async () => {
      const userIndex = 0;
      const { password, ...expectedUserInformation } = userData[userIndex];
      const expectedUsername = userData[userIndex].username;

      jwt.verify.mockReturnValueOnce({ username: expectedUsername });

      const { body: actualUser } = await signedInAgent
        .get(`/users/${expectedUsername}`)
        .expect(200);
      expect(jwt.verify).toBeCalledTimes(1);
      expect(actualUser).toMatchObject(expectedUserInformation);
    });

    it("GET /users/:username should return 401 unathorized when token is invalid", async () => {
      const expectedUsername = userData[0].username;

      jwt.verify.mockImplementationOnce(() => {
        throw new Error("token not valid");
      });

      const { body: error } = await signedInAgent
        .get(`/users/${expectedUsername}`)
        .expect(401);
      expect(jwt.verify).toBeCalledTimes(1);
      expect(error.error).toBe("You are not authorized");
    });

    it("GET /users/:username should return 403 Forbidden when login with incorrect user", async () => {
      const mockUsername = userData[0].username;
      const accessUsername = userData[1].username;

      jwt.verify.mockReturnValueOnce({ username: mockUsername });

      const { body: error } = await signedInAgent
        .get(`/users/${accessUsername}`)
        .expect(403);
      expect(jwt.verify).toBeCalledTimes(1);
      expect(error.error).toBe("Forbidden");
    });

    it("GET /users/:username should return 401 Unauthorized when when no token is provided", async () => {
      const expectedUsername = userData[0].username;

      const { body: error } = await request(app)
        .get(`/users/${expectedUsername}`)
        .expect(401);
      expect(jwt.verify).not.toHaveBeenCalled();
      expect(error.error).toBe("You are not authorized");
    });
  });

  describe("/logout", () => {
    it("POST /users/logout should logout and clear cookie", async () => {
      const response = await request(app).post("/users/logout").expect(200);
      expect(response.text).toBe("You have been logged out");
      expect(response.headers["set-cookie"][0]).toMatch(/^token=/);
    });
  });
});
